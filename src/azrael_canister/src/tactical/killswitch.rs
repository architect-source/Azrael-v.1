use candid::Principal;
use ic_cdk::api::time;
use crate::state::{SwitchType, TacticalError};

pub struct KillSwitch {
    pub proxy_halt: bool,
    pub session_freeze: bool,
    pub ai_silence: bool,
    pub dead_drop_active: bool,
    pub triggered_by: Option<Principal>,
    pub trigger_reason: String,
    pub trigger_time: u64,
}

impl KillSwitch {
    pub fn new() -> Self {
        Self {
            proxy_halt: false,
            session_freeze: false,
            ai_silence: false,
            dead_drop_active: false,
            triggered_by: None,
            trigger_reason: String::new(),
            trigger_time: 0,
        }
    }

    pub fn trigger(
        &mut self,
        switch: SwitchType,
        reason: String,
        caller: Principal,
    ) -> Result<(), TacticalError> {
        match switch {
            SwitchType::ProxyHalt => self.proxy_halt = true,
            SwitchType::SessionFreeze => self.session_freeze = true,
            SwitchType::AISilence => self.ai_silence = true,
            SwitchType::DeadDrop => self.dead_drop_active = true,
            SwitchType::FullLockdown => {
                self.proxy_halt = true;
                self.session_freeze = true;
                self.ai_silence = true;
                self.dead_drop_active = true;
            }
        }
        
        self.triggered_by = Some(caller);
        self.trigger_reason = reason;
        self.trigger_time = time();
        Ok(())
    }
}
