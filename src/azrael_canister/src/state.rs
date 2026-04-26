use ic_cdk::api::time;
use candid::{Principal, CandidType, Decode, Encode};
use serde::{Deserialize, Serialize};
use ic_stable_structures::{storable::Bound, Storable};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum SystemState {
    Active,      // Full operation
    Degraded,    // AI offline, logging only
    Survival,    // Null actions only, state preserved
    Recovery,    // Re-initializing from checkpoint
}

#[derive(CandidType, Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum SentryState {
    Vigilant,      // Fully operational
    Dimmed,        // Degraded, limited responses
    Guarding,      // Survival mode, preservation only
    Reforming,     // Recovery in progress
}

#[derive(CandidType, Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum TacticalLevel {
    Standard,
    Elevated,
    Ghost,
    Black,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum CompartmentStatus {
    Active,
    Suspicious,
    Quarantined,
    Terminated,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum TEEType {
    IntelSGX,
    AMDSEV,
    IntelTDX,
    AWSNitro,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct AttestationReport {
    pub tee_type: TEEType,
    pub measurement: [u8; 32],
    pub timestamp: u64,
    pub nonce: [u8; 32],
    pub quote: Vec<u8>,
    pub pcr_values: Vec<[u8; 32]>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TEEIdentity {
    pub measurement: [u8; 32],
    pub tee_type: TEEType,
    pub verified_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum TEError {
    UnknownMeasurement,
    PCRMismatch(usize),
    Expired,
    StaleAttestation,
    InvalidSignature,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum SwitchType {
    ProxyHalt,
    SessionFreeze,
    AISilence,
    DeadDrop,
    FullLockdown,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Session {
    pub id: String,
    pub owner: Principal,
    pub state: SystemState,
    pub last_heartbeat: u64,
    pub message_count: u64,
    pub checksum: u64,  // Integrity verification
    pub seed: Vec<u8>,  // For client key derivation
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum DriftError {
    HeartbeatTimeout,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum AzraelError {
    SessionNotFound,
    HeartbeatTimeout,
    ConstraintViolation(String),
    SystemRecovering,
    StorageFull,
    AIUnavailable,
    IdentityExpired,
    IdentityWrongTarget,
    IdentityRequired,
    Unauthorized,
    SerializationError,
    DeserializationError,
    CompleteDataLoss,
    InvalidStateTransition,
    RecoveryNotComplete,
    UnsupportedCryptoVersion,
    Tactical(TacticalError),
    TEE(TEError),
    ThresholdDenied,            // Auth failed
    SentryReforming,            // System not ready
    WhisperLost,                // Message failed, but may retry
    VoidUnreachable,            // Network/system failure
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum TacticalError {
    Unauthorized,
    InsufficientSignatures,
    InvalidSignature,
    UnknownMeasurement,
    PCRMismatch(usize),
    Expired,
    StaleAttestation,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct ChatResponse {
    pub session_id: String,
    pub content: String,
    pub state: SystemState,
    pub timestamp: u64,
    pub signature: Vec<u8>,
    pub requires_proxy: bool,
    pub msg_id: u64,
}

impl Session {
    pub fn check_drift(&self) -> Result<(), DriftError> {
        let now = time();
        let elapsed = now - self.last_heartbeat;
        
        match self.state {
            SystemState::Active if elapsed > 30_000_000_000 => {
                // 30 seconds in nanoseconds
                Err(DriftError::HeartbeatTimeout)
            }
            _ => Ok(())
        }
    }
    
    // Null action: safe, verifiable, no side effects
    pub fn null_response(&self) -> ChatResponse {
        ChatResponse {
            session_id: self.id.clone(),
            content: String::new(),  // Empty = intentional null
            state: SystemState::Survival,
            timestamp: time(),
            signature: self.sign_null(),
            requires_proxy: false,
            msg_id: 0,
        }
    }

    fn sign_null(&self) -> Vec<u8> {
        // Placeholder for actual signature logic
        vec![0; 32]
    }
}

impl Storable for Session {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
