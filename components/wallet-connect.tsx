"use client"

import { useState, useCallback } from "react"
import { Wallet, Copy, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type WalletState = {
  address: string
  balanceEth: number
} | null

function truncateAddress(address: string) {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletConnect() {
  const [wallet, setWallet] = useState<WalletState>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/wallet")
      const data = await res.json()
      if (data.connected && data.address) {
        setWallet({
          address: data.address,
          balanceEth: data.balanceEth ?? 0,
        })
        setError(null)
        setOpen(true)
      } else {
        setWallet(null)
        setError(data.error || "Wallet not configured")
        setOpen(true)
      }
    } catch (e) {
      setWallet(null)
      setError("Could not reach wallet API")
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleConnect = () => {
    if (wallet) return
    fetchWallet()
  }

  const handleDisconnect = () => {
    setWallet(null)
    setError(null)
    setOpen(false)
  }

  const copyAddress = () => {
    if (!wallet?.address) return
    navigator.clipboard.writeText(wallet.address)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={wallet ? "secondary" : "default"}
          size="sm"
          className="gap-2 text-xs font-mono tracking-widest uppercase"
          onClick={handleConnect}
          disabled={loading}
        >
          <Wallet className="h-3.5 w-3.5" />
          {loading
            ? "Connecting..."
            : wallet
              ? truncateAddress(wallet.address)
              : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {wallet ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">EVM (WDK)</span>
                <span className="font-mono text-xs break-all">
                  {wallet.address}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {wallet.balanceEth.toFixed(4)} ETH
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyAddress} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-2">
                {loading ? (
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                ) : error ? (
                  <>
                    <span className="text-xs text-destructive font-medium">
                      {error}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Add WDK_SEED_PHRASE to .env.local (and optionally
                      WDK_RPC_URL) in the project root, then restart the dev
                      server.
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Click Connect Wallet to load your WDK EVM wallet.
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            {!loading && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={fetchWallet}>
                  {error ? "Try again" : "Refresh"}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
