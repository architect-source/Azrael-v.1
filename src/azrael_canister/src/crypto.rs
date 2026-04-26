use candid::{CandidType, Decode, Encode};
use serde::{Deserialize, Serialize};
use crate::state::AzraelError;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct EncryptedPayload {
    pub ciphertext: Vec<u8>,
    pub nonce: Vec<u8>,
    pub version: String,
}

impl EncryptedPayload {
    pub fn validate(&self) -> Result<(), AzraelError> {
        if self.ciphertext.is_empty() || self.ciphertext.len() > 10_000_000 {
            return Err(AzraelError::ConstraintViolation("Invalid payload size".to_string()));
        }
        
        match self.version.as_str() {
            "xchacha20poly1305-v1" => Ok(()),
            _ => Err(AzraelError::UnsupportedCryptoVersion),
        }
    }
    
    pub fn hash_for_integrity(&self) -> [u8; 32] {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(&self.ciphertext);
        hasher.update(&self.nonce);
        let result = hasher.finalize();
        let mut hash = [0u8; 32];
        hash.copy_from_slice(&result);
        hash
    }
}

impl Storable for EncryptedPayload {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
