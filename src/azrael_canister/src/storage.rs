use ic_stable_structures::{StableBTreeMap, StableCell, DefaultMemoryImpl, storable::Bound, Storable};
use std::cell::RefCell;
use crate::state::Session;
use crate::tactical::compartment::CompartmentManager;
use crate::tactical::killswitch::KillSwitch;
use candid::{CandidType, Decode, Encode};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use ic_cdk::api::time;

#[derive(CandidType, Serialize, Deserialize, Clone, Default)]
pub struct CanisterState {
    pub last_checkpoint: u64,
    pub checksum: u64,
}

impl Storable for CanisterState {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(Debug)]
pub enum StorageError {
    SetFailed,
}

thread_local! {
    static STATE: RefCell<StableCell<CanisterState, DefaultMemoryImpl>> = 
        RefCell::new(StableCell::init(
            DefaultMemoryImpl::default(),
            CanisterState::default()
        ).expect("Failed to initialize state"));
    
    pub static SESSIONS: RefCell<StableBTreeMap<String, Session, DefaultMemoryImpl>> =
        RefCell::new(StableBTreeMap::init(DefaultMemoryImpl::default()));

    pub static COMPARTMENTS: RefCell<CompartmentManager> = RefCell::new(CompartmentManager::new());
    pub static KILL_SWITCH: RefCell<KillSwitch> = RefCell::new(KillSwitch::new());
}

use crate::crypto::EncryptedPayload;

// Drift checkpoint: atomic state preservation
pub fn checkpoint() -> Result<u64, StorageError> {
    let timestamp = time();
    STATE.with(|s| {
        let mut state = s.borrow().get().clone();
        state.last_checkpoint = timestamp;
        state.checksum = calculate_checksum(&state);
        s.borrow_mut().set(state).map_err(|_| StorageError::SetFailed)
    })?;
    Ok(timestamp)
}

pub fn append_encrypted(_session_id: &str, _payload: &EncryptedPayload, _hash: [u8; 32]) -> Result<u64, AzraelError> {
    // Placeholder for appending to stable storage
    Ok(time())
}

pub fn hash_plaintext(data: &str) -> [u8; 32] {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let result = hasher.finalize();
    let mut hash = [0u8; 32];
    hash.copy_from_slice(&result);
    hash
}

fn calculate_checksum(_state: &CanisterState) -> u64 {
    // Placeholder for actual checksum logic
    0
}
