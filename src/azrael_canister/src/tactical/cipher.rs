use rand::{Rng, SeedableRng};
use rand::rngs::StdRng;

pub struct TrafficCipher {
    rng: StdRng,
}

impl TrafficCipher {
    pub fn new(seed: [u8; 32]) -> Self {
        Self {
            rng: StdRng::from_seed(seed),
        }
    }
    
    pub fn pad_response(&mut self, content: &[u8]) -> Vec<u8> {
        const TARGET_SIZE: usize = 4096;
        
        let mut padded = content.to_vec();
        
        if content.len() < TARGET_SIZE {
            let padding_needed = TARGET_SIZE - content.len() - 4;
            let padding: Vec<u8> = (0..padding_needed)
                .map(|_| self.rng.gen())
                .collect();
            
            padded.extend_from_slice(&(padding.len() as u32).to_le_bytes());
            padded.extend(padding);
        }
        
        padded
    }
    
    pub fn generate_decoy(&mut self) -> Vec<u8> {
        let size = self.rng.gen_range(100..4000);
        (0..size).map(|_| self.rng.gen()).collect()
    }
}
