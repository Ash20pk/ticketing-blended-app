#![cfg_attr(target_arch = "wasm32", no_std)]
#![no_std]

extern crate alloc;

use alloc::string::{String, ToString};
use fluentbase_sdk::{
    basic_entrypoint,
    derive::{function_id, router, Contract},
    SharedAPI,
    U256,
};

// Removed serde dependencies since we'll store data directly
#[derive(Clone)]
struct Ticket {
    id: U256,
    event_id: U256,
    used: bool,
    valid: bool,
}

#[derive(Contract)]
struct ROUTER<SDK> {
    sdk: SDK,
}

pub trait RouterAPI {
    fn create_ticket(&mut self, event_id: U256, ticket_id: U256) -> bool;
    fn get_ticket_status(&self, ticket_id: U256) -> (bool, bool); // returns (used, valid)
    fn use_ticket(&mut self, ticket_id: U256) -> bool;
    fn get_total_tickets(&self) -> U256;
}

#[router(mode = "solidity")]
impl<SDK: SharedAPI> RouterAPI for ROUTER<SDK> {

    #[function_id("createTicket(uint256,uint256)")]
    fn create_ticket(&mut self, event_id: U256, ticket_id: U256) -> bool {
        // Check if ticket already exists
        let base_key = self.get_ticket_key(ticket_id);
        if !self.sdk.storage(&base_key).is_zero() {
            return false;
        }

        // Store ticket data
        self.sdk.write_storage(base_key, U256::from(1)); // Existence flag
        self.sdk.write_storage(base_key + U256::from(1), event_id);
        self.sdk.write_storage(base_key + U256::from(2), U256::from(0)); // not used
        self.sdk.write_storage(base_key + U256::from(3), U256::from(1)); // valid

        // Increment total tickets
        let total_key = U256::from(1);
        let current_total = self.sdk.storage(&total_key);
        self.sdk.write_storage(total_key, current_total + U256::from(1));

        true
    }

    #[function_id("getTicketStatus(uint256)")]
    fn get_ticket_status(&self, ticket_id: U256) -> (bool, bool) {
        let base_key = self.get_ticket_key(ticket_id);
        
        // Check if ticket exists
        if self.sdk.storage(&base_key).is_zero() {
            return (false, false);
        }

        let used = !self.sdk.storage(&(base_key + U256::from(2))).is_zero();
        let valid = !self.sdk.storage(&(base_key + U256::from(3))).is_zero();

        (used, valid)
    }

    #[function_id("useTicket(uint256)")]
    fn use_ticket(&mut self, ticket_id: U256) -> bool {
        let base_key = self.get_ticket_key(ticket_id);
        
        // Check if ticket exists and is valid
        if self.sdk.storage(&base_key).is_zero() {
            return false;
        }

        let used = !self.sdk.storage(&(base_key + U256::from(2))).is_zero();
        let valid = !self.sdk.storage(&(base_key + U256::from(3))).is_zero();

        if !used && valid {
            // Mark ticket as used
            self.sdk.write_storage(base_key + U256::from(2), U256::from(1));
            true
        } else {
            false
        }
    }

    #[function_id("getTotalTickets()")]
    fn get_total_tickets(&self) -> U256 {
        self.sdk.storage(&U256::from(1))
    }
}

impl<SDK: SharedAPI> ROUTER<SDK> {
    fn deploy(&mut self) {
        // Initialize total tickets counter
        self.sdk.write_storage(U256::from(1), U256::from(0));
    }

    // Helper function to generate storage key for a ticket
    fn get_ticket_key(&self, ticket_id: U256) -> U256 {
        // Start from key 1000 to avoid conflicts with other storage
        U256::from(1000) + (ticket_id * U256::from(10))
    }
}

basic_entrypoint!(ROUTER);