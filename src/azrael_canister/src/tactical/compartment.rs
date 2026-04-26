use candid::{Principal, CandidType};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ic_cdk::api::time;
use crate::state::{TacticalLevel, CompartmentStatus, TacticalError};
use crate::storage::SESSIONS;

pub const MAX_COMPARTMENTS: usize = 1000;
pub const DEAD_DROP_TIMEOUT: u64 = 3600_000_000_000; // 1 hour in nanos

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Compartment {
    pub session_id: String,
    pub owner: Principal,
    pub memory_quota: usize,
    pub cycle_quota: u64,
    pub network_allowlist: Vec<String>,
    pub created_at: u64,
    pub threat_score: u32,
    pub status: CompartmentStatus,
}

pub enum SecurityEvent {
    AuthFailure,
    InvalidPayload,
    RateLimit,
}

impl SecurityEvent {
    pub fn risk_value(&self) -> u32 {
        match self {
            SecurityEvent::AuthFailure => 20,
            SecurityEvent::InvalidPayload => 10,
            SecurityEvent::RateLimit => 5,
        }
    }
}

pub struct CompartmentManager {
    pub active: HashMap<String, Compartment>,
    pub quarantined: HashSet<String>,
}

impl CompartmentManager {
    pub fn new() -> Self {
        Self {
            active: HashMap::new(),
            quarantined: HashSet::new(),
        }
    }

    pub fn create_compartment(
        &mut self,
        session_id: String,
        owner: Principal,
        tactical_level: TacticalLevel,
    ) -> Result<Compartment, TacticalError> {
        if self.active.len() >= MAX_COMPARTMENTS {
            self.recycle_oldest()?;
        }
        
        let compartment = Compartment {
            session_id: session_id.clone(),
            owner,
            memory_quota: tactical_level.memory_quota(),
            cycle_quota: tactical_level.cycle_quota(),
            network_allowlist: tactical_level.allowlist(),
            created_at: time(),
            threat_score: 0,
            status: CompartmentStatus::Active,
        };
        
        self.active.insert(session_id, compartment.clone());
        Ok(compartment)
    }
    
    pub fn assess_threat(&mut self, session_id: &str, event: SecurityEvent) {
        let Some(comp) = self.active.get_mut(session_id) else { return };
        
        comp.threat_score += event.risk_value();
        
        match comp.threat_score {
            0..=10 => (),
            11..=50 => {
                comp.status = CompartmentStatus::Suspicious;
            }
            51..=100 => {
                comp.status = CompartmentStatus::Quarantined;
                self.quarantined.insert(session_id.to_string());
            }
            _ => {
                self.trigger_dead_drop(session_id);
            }
        }
    }
    
    pub fn trigger_dead_drop(&mut self, session_id: &str) {
        SESSIONS.with(|s| s.borrow_mut().remove(session_id));
        self.active.remove(session_id);
        self.quarantined.remove(session_id);
        ic_cdk::println!("DEAD_DROP: Session {} wiped", session_id);
    }
    
    pub fn check_stale_compartments(&mut self) {
        let now = time();
        let stale_threshold = now - DEAD_DROP_TIMEOUT;
        
        let to_wipe: Vec<String> = self.active.iter()
            .filter(|(_, comp)| comp.created_at < stale_threshold && comp.threat_score > 0)
            .map(|(id, _)| id.clone())
            .collect();

        for id in to_wipe {
            self.trigger_dead_drop(&id);
        }
    }

    fn recycle_oldest(&mut self) -> Result<(), TacticalError> {
        let oldest = self.active.iter()
            .min_by_key(|(_, c)| c.created_at)
            .map(|(id, _)| id.clone());
        
        if let Some(id) = oldest {
            self.trigger_dead_drop(&id);
            Ok(())
        } else {
            Err(TacticalError::Unauthorized) // Should not happen
        }
    }
}

impl TacticalLevel {
    pub fn memory_quota(&self) -> usize {
        match self {
            TacticalLevel::Standard => 10_000_000,
            TacticalLevel::Elevated => 50_000_000,
            TacticalLevel::Ghost => 1_000_000,
            TacticalLevel::Black => 100_000_000,
        }
    }
    
    pub fn cycle_quota(&self) -> u64 {
        match self {
            TacticalLevel::Standard => 10_000_000_000,
            TacticalLevel::Elevated => 50_000_000_000,
            TacticalLevel::Ghost => 1_000_000_000,
            TacticalLevel::Black => 100_000_000_000,
        }
    }
    
    pub fn allowlist(&self) -> Vec<String> {
        match self {
            TacticalLevel::Ghost => vec![],
            TacticalLevel::Black => vec!["tee-proxy.azrael.local".to_string()],
            _ => vec!["proxy.azrael.local".to_string()],
        }
    }
}
