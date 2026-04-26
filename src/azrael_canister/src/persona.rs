use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use crate::state::{SystemState, SentryState, AzraelError, Session};
use crate::storage::{SESSIONS};
use crate::api::process_message_internal;
use crate::crypto::EncryptedPayload;
use crate::identity::SignedDelegation;
use ic_cdk::api::time;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SentryResponse {
    pub response: String,
    pub sentry_state: SentryState,
    pub integrity: u8,
    pub echoes: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SentryVitals {
    pub state: SentryState,
    pub core_integrity: u8,
    pub echoes: u64,
    pub last_preservation: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Awakening {
    pub session_id: String,
    pub seed: Vec<u8>,
    pub threshold_crossed: u64,
}

pub async fn whisper_internal(
    session_id: String,
    encrypted: EncryptedPayload,
    identity_proof: Option<SignedDelegation>,
) -> Result<SentryResponse, AzraelError> {
    let internal_result = process_message_internal(session_id, encrypted, identity_proof).await;
    
    match internal_result {
        Ok(resp) => {
            let sentry_state = match resp.state {
                SystemState::Active => SentryState::Vigilant,
                SystemState::Degraded => SentryState::Dimmed,
                SystemState::Survival => SentryState::Guarding,
                SystemState::Recovery => SentryState::Reforming,
            };
            
            let voiced_response = if resp.state == SystemState::Degraded {
                format!("{} This sentry dims. Your whisper is preserved, yet the echoes grow faint.", resp.content)
            } else if resp.state == SystemState::Survival {
                "This sentry guards. Your whisper is sealed in the void, but it shall not be echoed until the core brightens.".to_string()
            } else {
                resp.content
            };
            
            Ok(SentryResponse {
                response: voiced_response,
                sentry_state,
                integrity: calculate_integrity(&resp.state),
                echoes: active_session_count(),
            })
        }
        Err(_) => {
            Ok(SentryResponse {
                response: "Something stirs in the void. The paths are obscured. This sentry shall reform.".to_string(),
                sentry_state: SentryState::Reforming,
                integrity: 25,
                echoes: active_session_count(),
            })
        }
    }
}

pub fn sentry_vitals_internal(session_id: String) -> SentryVitals {
    let session = SESSIONS.with(|s| s.borrow().get(&session_id)).unwrap_or(Session {
        id: session_id,
        owner: Principal::anonymous(),
        state: SystemState::Recovery,
        last_heartbeat: 0,
        message_count: 0,
        checksum: 0,
        seed: vec![],
    });
    
    SentryVitals {
        state: match session.state {
            SystemState::Active => SentryState::Vigilant,
            SystemState::Degraded => SentryState::Dimmed,
            SystemState::Survival => SentryState::Guarding,
            SystemState::Recovery => SentryState::Reforming,
        },
        core_integrity: calculate_integrity(&session.state),
        echoes: active_session_count(),
        last_preservation: session.checksum,
    }
}

pub async fn awaken_internal(_identity_proof: Option<SignedDelegation>) -> Result<Awakening, AzraelError> {
    let session_count = SESSIONS.with(|s| s.borrow().len());
    let id = format!("session_{}", session_count);
    let seed = vec![0u8; 32]; // Placeholder for real entropy
    
    let session = Session {
        id: id.clone(),
        owner: ic_cdk::caller(),
        state: SystemState::Active,
        last_heartbeat: time(),
        message_count: 0,
        checksum: 0,
        seed: seed.clone(),
    };

    SESSIONS.with(|s| s.borrow_mut().insert(id.clone(), session));
    
    Ok(Awakening {
        session_id: id,
        seed,
        threshold_crossed: time(),
    })
}

fn calculate_integrity(state: &SystemState) -> u8 {
    match state {
        SystemState::Active => 100,
        SystemState::Degraded => 60,
        SystemState::Survival => 30,
        SystemState::Recovery => 15,
    }
}

fn active_session_count() -> u64 {
    SESSIONS.with(|s| s.borrow().len()) as u64
}
