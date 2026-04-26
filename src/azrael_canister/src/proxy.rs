use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use std::collections::{HashSet, HashMap};
use std::cell::RefCell;
use crate::state::{AzraelError, SystemState};

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ModelSpec {
    GeminiFlash,
    GeminiPro,
    Custom(String),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ProxyRequest {
    pub request_id: String,
    pub session_id: String,
    pub timestamp: u64,
    pub nonce: u64,
    pub encrypted_payload_hash: Vec<u8>,
    pub context_summary: String,
    pub preferred_model: ModelSpec,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub canister_signature: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ProxyResponse {
    pub request_id: String,
    pub timestamp: u64,
    pub result: ProxyResult,
    pub proxy_signature: Vec<u8>,
    pub response_hash: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ProxyResult {
    Success(AISuccess),
    Degraded(DegradedResponse),
    Error(ProxyError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct AISuccess {
    pub content: String,
    pub model_used: ModelSpec,
    pub tokens_used: u32,
    pub finish_reason: String,
    pub latency_ms: u32,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct DegradedResponse {
    pub reason: DegradedReason,
    pub fallback_content: String,
    pub retry_after: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum DegradedReason {
    RateLimit,
    ModelUnavailable,
    ContentFiltered,
    Timeout,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ProxyError {
    InvalidRequest(String),
    Unauthorized(String),
    ReplayDetected,
    SignatureInvalid,
    InternalError(String),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum VerificationResult {
    Valid(ValidDetails),
    Invalid(InvalidReason),
    Expired(u64),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ValidDetails {
    pub proxy_principal: Principal,
    pub latency_verified: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum InvalidReason {
    SignatureMismatch,
    RequestIdMismatch,
    TimestampTooOld(u64),
    HashMismatch,
    UnknownProxy(Principal),
    ReplayDetected,
}

thread_local! {
    static PROXIES: RefCell<HashMap<Principal, String>> = RefCell::new(HashMap::new());
    static PROXY_DISABLED: RefCell<bool> = RefCell::new(false);
    static SEEN_NONCES: RefCell<HashSet<String>> = RefCell::new(HashSet::new());
}

pub struct ProxyVerifier;

impl ProxyVerifier {
    pub fn register(proxy: Principal, name: String) -> Result<(), AzraelError> {
        PROXIES.with(|p| p.borrow_mut().insert(proxy, name));
        Ok(())
    }
    
    pub fn remove(proxy: Principal) -> Result<(), AzraelError> {
        PROXIES.with(|p| p.borrow_mut().remove(&proxy));
        Ok(())
    }

    pub fn list() -> Vec<(Principal, String, u64)> {
        PROXIES.with(|p| p.borrow().iter().map(|(k, v)| (*k, v.clone(), 0)).collect())
    }

    pub fn verify_response(
        request: &ProxyRequest,
        response: &ProxyResponse,
    ) -> Result<VerificationResult, AzraelError> {
        if PROXY_DISABLED.with(|d| *d.borrow()) {
            return Err(AzraelError::AIUnavailable);
        }
        
        // In a real implementation, we'd recover the principal from the signature
        // For now, we assume the caller provides it or we check against registered proxies
        let proxy_principal = ic_cdk::caller(); 
        
        if !PROXIES.with(|p| p.borrow().contains_key(&proxy_principal)) {
            return Ok(VerificationResult::Invalid(InvalidReason::UnknownProxy(proxy_principal)));
        }
        
        if SEEN_NONCES.with(|n| n.borrow().contains(&response.request_id)) {
            return Ok(VerificationResult::Invalid(InvalidReason::ReplayDetected));
        }
        SEEN_NONCES.with(|n| n.borrow_mut().insert(response.request_id.clone()));
        
        let now = time();
        let age = now.saturating_sub(response.timestamp);
        if age > 300_000_000_000 { // 5 minutes
            return Ok(VerificationResult::Expired(response.timestamp));
        }
        
        if request.request_id != response.request_id {
            return Ok(VerificationResult::Invalid(InvalidReason::RequestIdMismatch));
        }
        
        // Signature and Hash verification would go here
        
        Ok(VerificationResult::Valid(ValidDetails {
            proxy_principal,
            latency_verified: true,
        }))
    }
}

pub fn is_proxy_disabled() -> bool {
    PROXY_DISABLED.with(|d| *d.borrow())
}

pub fn set_proxy_disabled(disabled: bool) {
    PROXY_DISABLED.with(|d| *d.borrow_mut() = disabled);
}
