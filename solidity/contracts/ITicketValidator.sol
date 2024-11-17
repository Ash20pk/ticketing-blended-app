// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITicketValidator {
    function createTicket(uint256 event_id, uint256 ticket_id) external returns (bool);
    function getTicketStatus(uint256 ticket_id) external view returns (bool, bool);
    function useTicket(uint256 ticket_id) external returns (bool);
    function getTotalTickets() external view returns (uint256);
}