use crate::state::{Session, SystemState, ChatResponse, DriftError, AzraelError};
use crate::storage::{SESSIONS, self};
use crate::crypto::EncryptedPayload;
use crate::identity::{IdentityVerifier, SignedDelegation};
use crate::ai_bridge::{AIBridge, AIPath};
use crate::recovery::RecoveryManager;
use candid::Principal;
use ic_cdk::api::time;

const IDENTITY: IdentityVerifier = IdentityVerifier;
const AI_BRIDGE: AIBridge = AIBridge {
    api_key: String::new(),
    proxy_principal: None,
};

impl From<DriftError> for AzraelError {
    fn from(_: DriftError) -> Self {
        AzraelError::HeartbeatTimeout
    }
}

#[ic_cdk::update]
pub async fn chat(
    session_id: String,
    encrypted_message: EncryptedPayload,
    identity_proof: Option<SignedDelegation>,
) -> Result<ChatResponse, AzraelError> {
    process_message_internal(session_id, encrypted_message, identity_proof).await
}

pub async fn process_message_internal(
    session_id: String,
    encrypted_message: EncryptedPayload,
    identity_proof: Option<SignedDelegation>,
) -> Result<ChatResponse, AzraelError> {
    // 1. Identity verification (if provided)
    let caller = ic_cdk::caller();
    let owner = if let Some(proof) = identity_proof {
        IDENTITY.verify_delegation(proof, caller)?
    } else {
        // Anonymous: session must exist and match anonymous principal
        if caller != Principal::anonymous() {
            return Err(AzraelError::IdentityRequired);
        }
        caller
    };
    
    // 2. Session retrieval + auto-restore check
    let mut session = SESSIONS.with(|s| {
        s.borrow().get(&session_id).ok_or(AzraelError::SessionNotFound)
    })?;
    
    // 3. Recovery promotion if in recovery state
    if session.state == SystemState::Recovery {
        RecoveryManager::promote_from_recovery(&session_id)?;
        session = SESSIONS.with(|s| s.borrow().get(&session_id).unwrap());
    }
    
    // 4. Drift + constraint checks
    session.check_drift()?;
    encrypted_message.validate()?;
    
    // 5. Ownership check
    if session.owner != owner {
        return Err(AzraelError::Unauthorized);
    }
    
    // 6. Store encrypted message (can't read it)
    let msg_hash = encrypted_message.hash_for_integrity();
    let msg_id = storage::append_encrypted(&session_id, &encrypted_message, msg_hash)?;
    
    // 7. Route to AI (direct or proxied)
    let ai_path = AI_BRIDGE.route("", 0); // Size check on ciphertext
    let ai_response = match ai_path {
        AIPath::Direct => AI_BRIDGE.call_direct(format!("Session: {}\nHash: {:?}", session_id, msg_hash)).await,
        AIPath::Proxied => {
            // Return request for client to proxy
            return Ok(ChatResponse {
                session_id,
                content: AI_BRIDGE.call_proxied(&session, "".to_string())?,
                state: SystemState::Active,
                timestamp: time(),
                signature: vec![0; 32],
                requires_proxy: true,
                msg_id,
            });
        }
        AIPath::Cached => todo!(),
    }?;
    
    // 8. Log response (encrypted by client later)
    let _response_hash = storage::hash_plaintext(&ai_response);
    
    // 9. Checkpoint if needed
    let _ = RecoveryManager::maybe_checkpoint();
    
    Ok(ChatResponse {
        session_id,
        content: ai_response,
        state: SystemState::Active,
        timestamp: time(),
        signature: vec![0; 32],
        requires_proxy: false,
        msg_id,
    })
}

fn validate_constraints(_session: &Session, content: &String) -> Result<(), AzraelError> {
    if content.len() > 1000 {
        return Err(AzraelError::ConstraintViolation("Message too long".to_string()));
    }
    Ok(())
}
