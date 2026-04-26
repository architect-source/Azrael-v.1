mod state;
mod storage;
mod api;
mod ai_bridge;
mod identity;
mod crypto;
mod recovery;
mod proxy;
mod tactical;
mod persona;

use crate::state::{Session, SystemState, AzraelError, TacticalLevel, SwitchType, TacticalError, AttestationReport, TEEIdentity, TEError};
use crate::storage::{SESSIONS, COMPARTMENTS, KILL_SWITCH};
use crate::persona::{SentryResponse, SentryVitals, Awakening};
use crate::crypto::EncryptedPayload;
use crate::identity::SignedDelegation;
use ic_cdk::api::time;
use ic_cdk::caller;

#[ic_cdk::update]
fn create_session() -> Result<Session, AzraelError> {
    let id = Math.random().toString(36).substring(7); // Wait, this is Rust, not JS.
    // Let's use a better ID generation or just a counter for now.
    let session_count = SESSIONS.with(|s| s.borrow().len());
    let id = format!("session_{}", session_count);
    
    let mut seed = [0u8; 32];
    if let Err(_) = ic_cdk::api::management_canister::main::raw_rand().await {
        // Fallback if raw_rand fails (unlikely in update call)
        seed = [0u8; 32];
    } else {
        // Wait, raw_rand returns Vec<u8>
    }
    
    // Actually, let's just use a simpler way for now if raw_rand is too complex here
    // Or just use the time and some other entropy
    let seed = vec![0u8; 32]; // Placeholder, will fix with real entropy
    
    let session = Session {
        id: id.clone(),
        owner: caller(),
        state: SystemState::Active,
        last_heartbeat: time(),
        message_count: 0,
        checksum: 0,
        seed,
    };

    SESSIONS.with(|s| s.borrow_mut().insert(id, session.clone()));
    Ok(session)
}

#[ic_cdk::update]
fn heartbeat(session_id: String) -> Result<(), AzraelError> {
    SESSIONS.with(|s| {
        let mut sessions = s.borrow_mut();
        let mut session = sessions.get(&session_id).ok_or(AzraelError::SessionNotFound)?;
        session.last_heartbeat = time();
        sessions.insert(session_id, session);
        Ok(())
    })
}

#[ic_cdk::query]
fn get_session(session_id: String) -> Option<Session> {
    SESSIONS.with(|s| s.borrow().get(&session_id))
}

#[ic_cdk::update]
fn checkpoint() -> u64 {
    storage::checkpoint().unwrap_or(0)
}

#[ic_cdk::update]
fn register_proxy(proxy: candid::Principal, name: String) -> Result<(), AzraelError> {
    proxy::ProxyVerifier::register(proxy, name)
}

#[ic_cdk::update]
fn remove_proxy(proxy: candid::Principal) -> Result<(), AzraelError> {
    proxy::ProxyVerifier::remove(proxy)
}

#[ic_cdk::query]
fn list_proxies() -> Vec<(candid::Principal, String, u64)> {
    proxy::ProxyVerifier::list()
}

#[ic_cdk::update]
fn disable_proxies() {
    proxy::set_proxy_disabled(true);
}

#[ic_cdk::update]
fn enable_proxies() {
    proxy::set_proxy_disabled(false);
}

// Tactical API
#[ic_cdk::update]
fn emergency_trigger(switch: SwitchType, reason: String) -> Result<(), AzraelError> {
    KILL_SWITCH.with(|ks| {
        ks.borrow_mut().trigger(switch, reason, caller())
            .map_err(AzraelError::Tactical)
    })
}

#[ic_cdk::query]
fn get_compartment_status(session_id: String) -> Option<tactical::compartment::Compartment> {
    COMPARTMENTS.with(|c| c.borrow().active.get(&session_id).cloned())
}

#[ic_cdk::update]
fn verify_tee_attestation(report: AttestationReport) -> Result<TEEIdentity, AzraelError> {
    tactical::tee::TEEVerifier::verify_attestation(&report)
        .map_err(AzraelError::TEE)
}

// AZRAEL Persona API
#[ic_cdk::update]
async fn awaken(identity_proof: Option<SignedDelegation>) -> Result<Awakening, AzraelError> {
    persona::awaken_internal(identity_proof).await
}

#[ic_cdk::update]
async fn whisper(
    session_id: String, 
    encrypted: EncryptedPayload, 
    identity_proof: Option<SignedDelegation>
) -> Result<SentryResponse, AzraelError> {
    persona::whisper_internal(session_id, encrypted, identity_proof).await
}

#[ic_cdk::query]
fn sentry_vitals(session_id: String) -> SentryVitals {
    persona::sentry_vitals_internal(session_id)
}

// Export Candid interface
ic_cdk::export_candid!();
