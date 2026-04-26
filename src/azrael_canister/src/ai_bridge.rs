use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse,
};
use candid::{Principal, CandidType};
use serde::{Deserialize, Serialize};
use crate::state::{Session, AzraelError};
use ic_cdk::api::time;

const GEMINI_API_HOST: &str = "generativelanguage.googleapis.com";
const MAX_DIRECT_LENGTH: usize = 4000; // Stay under limits

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum AIPath {
    Direct,      // Canister makes HTTP outcall
    Proxied,     // Route through Express server
    Cached,      // Use embedded vector store (future)
}

#[derive(Serialize, Deserialize)]
struct ProxyRequest {
    session_id: String,
    content: String,
    timestamp: u64,
    nonce: String,
}

pub struct AIBridge {
    pub api_key: String, // Stored encrypted, decrypted per-call
    pub proxy_principal: Option<Principal>, // Trusted proxy canister/server
}

impl AIBridge {
    pub fn route(&self, content: &str, context_size: usize) -> AIPath {
        let total_size = content.len() + context_size;
        
        if total_size > MAX_DIRECT_LENGTH {
            AIPath::Proxied
        } else if self.is_cache_hit(content) {
            AIPath::Cached
        } else {
            AIPath::Direct
        }
    }

    fn is_cache_hit(&self, _content: &str) -> bool {
        false
    }
    
    // Direct outcall: zero external dependencies, higher cycle cost
    pub async fn call_direct(&self, prompt: String) -> Result<String, AzraelError> {
        let url = format!(
            "https://{}/v1beta/models/gemini-2.0-flash:generateContent?key={}",
            GEMINI_API_HOST,
            self.decrypt_key()
        );
        
        let request_body = serde_json::json!({
            "contents": [{"parts": [{"text": prompt}]}],
            "safetySettings": [
                {"category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_NONE"},
            ]
        });
        
        let request = CanisterHttpRequestArgument {
            url,
            method: HttpMethod::POST,
            body: Some(request_body.to_string().into_bytes()),
            max_response_bytes: Some(500_000), // 500KB max
            transform: None,
            headers: vec![
                HttpHeader {
                    name: "Content-Type".to_string(),
                    value: "application/json".to_string(),
                },
            ],
        };
        
        // Cycles: ~200M-400M depending on response size
        match http_request(request, 400_000_000).await {
            Ok((response,)) => self.parse_gemini_response(response),
            Err((code, msg)) => {
                ic_cdk::println!("HTTP outcall failed: {:?} - {}", code, msg);
                Err(AzraelError::AIUnavailable)
            }
        }
    }
    
    // Proxied: lower cycles, higher throughput, requires trusted server
    pub fn call_proxied(&self, session: &Session, content: String) -> Result<String, AzraelError> {
        let request = ProxyRequest {
            session_id: session.id.clone(),
            content,
            timestamp: time(),
            nonce: self.generate_nonce(),
        };
        
        Ok(serde_json::to_string(&request).unwrap())
    }
    
    fn parse_gemini_response(&self, response: HttpResponse) -> Result<String, AzraelError> {
        let body = String::from_utf8(response.body)
            .map_err(|_| AzraelError::AIUnavailable)?;
        
        let parsed: serde_json::Value = serde_json::from_str(&body)
            .map_err(|_| AzraelError::AIUnavailable)?;
            
        parsed["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or(AzraelError::AIUnavailable)
    }
    
    fn decrypt_key(&self) -> String {
        self.api_key.clone()
    }

    fn generate_nonce(&self) -> String {
        format!("{}", time())
    }
}
