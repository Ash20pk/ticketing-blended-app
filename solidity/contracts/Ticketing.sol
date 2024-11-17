// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ITicketValidator.sol";

contract TicketingApp {
    ITicketValidator public ticketValidator;

    constructor(address _ticketValidator) {
        ticketValidator = ITicketValidator(_ticketValidator);
    }

    function createTicket(uint256 event_id, uint256 ticket_id) public returns (bool) {
        return ticketValidator.createTicket(event_id, ticket_id);
    }

    function getTicketStatus(uint256 ticket_id) public view returns (bool, bool) {
        return ticketValidator.getTicketStatus(ticket_id);
    }

    function useTicket(uint256 ticket_id) public returns (bool) {
        return ticketValidator.useTicket(ticket_id);
    }

    function getTotalTickets() public view returns (uint256) {
        return ticketValidator.getTotalTickets();
    }
}
