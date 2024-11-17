import { task } from "hardhat/config";

// Create Ticket Task
task("create-ticket", "Creates a new ticket")
  .addParam("contract", "The address of the TicketingApp contract")
  .addParam("eventId", "The ID of the event")
  .addParam("ticketId", "The ID for the new ticket")
  .setAction(async ({ contract, eventId, ticketId }, hre) => {
    const { ethers } = hre;
    const TicketingApp = await ethers.getContractAt("TicketingApp", contract);
    const tx = await TicketingApp.createTicket(eventId, ticketId);
    await tx.wait();
    console.log(`Ticket ${ticketId} created for event ${eventId}`);
  });

// Check Ticket Status Task
task("check-ticket", "Checks the status of a ticket")
  .addParam("contract", "The address of the TicketingApp contract")
  .addParam("ticketId", "The ID of the ticket to check")
  .setAction(async ({ contract, ticketId }, hre) => {
    const { ethers } = hre;
    const TicketingApp = await ethers.getContractAt("TicketingApp", contract);
    const [isUsed, isValid] = await TicketingApp.getTicketStatus(ticketId);
    
    console.log({
      ticketId,
      isValid,
      isUsed
    });
  });

// Use Ticket Task
task("use-ticket", "Uses a ticket for entry")
  .addParam("contract", "The address of the TicketingApp contract")
  .addParam("ticketId", "The ID of the ticket to use")
  .setAction(async ({ contract, ticketId }, hre) => {
    const { ethers } = hre;
    const TicketingApp = await ethers.getContractAt("TicketingApp", contract);
    const tx = await TicketingApp.useTicket(ticketId);
    await tx.wait();
    console.log(`Ticket ${ticketId} has been used`);
  });

// Get Total Tickets Task
task("get-total-tickets", "Gets the total number of tickets issued")
  .addParam("contract", "The address of the TicketingApp contract")
  .setAction(async ({ contract }, hre) => {
    const { ethers } = hre;
    const TicketingApp = await ethers.getContractAt("TicketingApp", contract);
    const total = await TicketingApp.getTotalTickets();
    console.log(`Total tickets issued: ${total.toString()}`);
  });