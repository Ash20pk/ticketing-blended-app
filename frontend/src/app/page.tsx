"use client"

import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { ModeToggle } from "../components/mode-toggle"

const contractAddress = "0xeCFbF86d722Bc6AfD802Bb526A8e30Da63Bd98EA"
const contractABI = [
  "function createTicket(uint256 event_id, uint256 ticket_id) public",
  "function getTicketStatus(uint256 ticket_id) public view returns (bool)",
  "function useTicket(uint256 ticket_id) public",
  "function getTotalTickets() public view returns (uint256)",
]

// Fluent network configuration
const fluentNetwork = {
  chainId: "0x5201",
  chainName: "Fluent Devnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.dev.gblend.xyz"],
  blockExplorerUrls: ["https://blockscout.dev.gblend.xyz/"],
}

export default function Home() {
  const [account, setAccount] = useState<string>("")
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [eventId, setEventId] = useState("")
  const [ticketId, setTicketId] = useState("")
  const [totalTickets, setTotalTickets] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function switchToFluentNetwork() {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask!")
      return false
    }

    try {
      // Try to switch to the Fluent network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: fluentNetwork.chainId }],
      })
      return true
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [fluentNetwork],
          })
          return true
        } catch (addError) {
          console.error("Error adding network:", addError)
          setError("Failed to add Fluent network")
          return false
        }
      } else {
        console.error("Error switching network:", switchError)
        setError("Failed to switch network")
        return false
      }
    }
  }

  async function connectWallet() {
    try {
      setError("")
      if (typeof window.ethereum !== "undefined") {
        // First switch to Fluent network
        const switched = await switchToFluentNetwork()
        if (!switched) return

        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        setAccount(accounts[0])
        setSigner(signer)
        const contract = new ethers.Contract(contractAddress, contractABI, signer)
        setContract(contract)
        updateTotalTickets(contract)
      } else {
        setError("Please install MetaMask!")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to connect wallet")
    }
  }

  async function updateTotalTickets(contract: ethers.Contract) {
    try {
      const total = await contract.getTotalTickets()
      setTotalTickets(Number(total))
    } catch (err) {
      console.error(err)
    }
  }

  async function createTicket() {
    if (!contract || !eventId || !ticketId) return
    setLoading(true)
    setError("")
    try {
      const tx = await contract.createTicket(eventId, ticketId)
      await tx.wait()
      setEventId("")
      setTicketId("")
      updateTotalTickets(contract)
    } catch (err) {
      console.error(err)
      setError("Failed to create ticket")
    }
    setLoading(false)
  }

  async function checkTicketStatus() {
    if (!contract || !ticketId) return
    setLoading(true)
    setError("")
    try {
      const status = await contract.getTicketStatus(ticketId)
      alert(status ? "Ticket is valid" : "Ticket is used or invalid")
    } catch (err) {
      console.error(err)
      setError("Failed to check ticket status")
    }
    setLoading(false)
  }

  async function useTicket() {
    if (!contract || !ticketId) return
    setLoading(true)
    setError("")
    try {
      const tx = await contract.useTicket(ticketId)
      await tx.wait()
      alert("Ticket used successfully!")
    } catch (err) {
      console.error(err)
      setError("Failed to use ticket")
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Ticketing dApp</h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {!account ? (
              <Button onClick={connectWallet}>Connect Wallet</Button>
            ) : (
              <Button variant="outline">
                {account.slice(0, 6)}...{account.slice(-4)}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold">Create Ticket</h2>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Event ID"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-4 py-2 rounded-md border bg-background"
              />
              <input
                type="number"
                placeholder="Ticket ID"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full px-4 py-2 rounded-md border bg-background"
              />
              <Button 
                onClick={createTicket} 
                disabled={!account || loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold">Manage Tickets</h2>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Ticket ID"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full px-4 py-2 rounded-md border bg-background"
              />
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={checkTicketStatus}
                  disabled={!account || loading}
                  variant="outline"
                >
                  Check Status
                </Button>
                <Button 
                  onClick={useTicket}
                  disabled={!account || loading}
                >
                  Use Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Total Tickets: {totalTickets}
        </div>
      </div>
    </main>
  )
}
