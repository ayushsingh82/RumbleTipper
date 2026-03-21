import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Creator Dashboard — RumbleTipper",
  description: "View creator video tip totals and latest transactions from RumbleTipper activity.",
}

const creatorVideos = [
  { id: "vid-1", title: "Breaking macro moves for this week", tipsReceived: 12, totalUsd: 48.2, lastTipAt: "2m ago" },
  { id: "vid-2", title: "How I research altcoin narratives", tipsReceived: 9, totalUsd: 34.6, lastTipAt: "17m ago" },
  { id: "vid-3", title: "Daily market open stream", tipsReceived: 6, totalUsd: 19.5, lastTipAt: "44m ago" },
  { id: "vid-4", title: "Top 5 projects to watch", tipsReceived: 4, totalUsd: 11.8, lastTipAt: "1h ago" },
]

const latestTxns = [
  { txHash: "0xa132...92be", video: "Breaking macro moves for this week", amount: "$5.00", network: "Base Sepolia", status: "Confirmed" },
  { txHash: "0x9fa1...0cab", video: "How I research altcoin narratives", amount: "$3.50", network: "Base Sepolia", status: "Confirmed" },
  { txHash: "0x82cd...7ed1", video: "Daily market open stream", amount: "$2.00", network: "Base Sepolia", status: "Confirmed" },
  { txHash: "0xd7e2...1a5f", video: "Top 5 projects to watch", amount: "$1.75", network: "Base Sepolia", status: "Pending" },
]

export default function CreatorDashboardPage() {
  const totalUsd = creatorVideos.reduce((sum, item) => sum + item.totalUsd, 0)
  const totalTips = creatorVideos.reduce((sum, item) => sum + item.tipsReceived, 0)

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="px-6 pt-8 pb-16 lg:px-24 lg:pt-12">
        <section className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h1 className="font-pixel text-3xl sm:text-4xl tracking-tight text-foreground mb-2">Creator Dashboard</h1>
              <p className="text-sm text-muted-foreground font-mono">
                Track tips per video, total earnings, and latest extension transactions.
              </p>
            </div>
            <Link
              href="/creator/register"
              className="inline-flex items-center justify-center rounded border border-[#ea580c] bg-[#ea580c] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-background"
            >
              Update Creator Mapping
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-xl border border-foreground/15 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono mb-1">Total received</p>
              <p className="text-2xl font-semibold">${totalUsd.toFixed(2)} USDt</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-1">Network: Base Sepolia (testing)</p>
            </div>
            <div className="rounded-xl border border-foreground/15 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono mb-1">Total tips</p>
              <p className="text-2xl font-semibold">{totalTips}</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-1">Across {creatorVideos.length} videos</p>
            </div>
            <div className="rounded-xl border border-foreground/15 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono mb-1">Latest payout</p>
              <p className="text-2xl font-semibold">$5.00</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-1">2 minutes ago</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section className="rounded-xl border border-foreground/15 bg-background/80 p-5">
              <h2 className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">Tips by video</h2>
              <div className="space-y-3">
                {creatorVideos.map((video) => (
                  <article key={video.id} className="rounded border border-foreground/15 bg-background p-3">
                    <p className="text-sm text-foreground">{video.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>{video.tipsReceived} tips</span>
                      <span>${video.totalUsd.toFixed(2)} USDt</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground font-mono">Last tip: {video.lastTipAt}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="rounded-xl border border-foreground/15 bg-background/80 p-5">
              <h2 className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">Latest transactions</h2>
              <div className="space-y-3">
                {latestTxns.map((txn) => (
                  <article key={txn.txHash} className="rounded border border-foreground/15 bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-mono text-foreground">{txn.txHash}</p>
                      <span className="text-[10px] font-mono rounded border border-foreground/20 px-2 py-0.5 text-muted-foreground">
                        {txn.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-foreground">{txn.video}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>{txn.network}</span>
                      <span>{txn.amount}</span>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

