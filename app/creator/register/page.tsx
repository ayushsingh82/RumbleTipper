import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Register as Creator — RumbleTip",
  description: "Link your Rumble channel to a wallet so the RumbleTip agent can route tips directly to you.",
}

export default function CreatorRegisterPage() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="px-6 pt-8 pb-16 lg:px-24 lg:pt-12">
        <section className="max-w-3xl mx-auto">
          <h1 className="font-pixel text-3xl sm:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
            Register as Creator
          </h1>
          <p className="text-sm text-muted-foreground font-mono mb-8">
            Link your Rumble channel to an on-chain wallet so the RumbleTip agent can send tips directly to you.
            This page is a demo for the hackathon — it does not modify any real Rumble account.
          </p>

          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] mb-10">
            <div className="rounded-xl border border-foreground/15 bg-background/80 p-5">
              <h2 className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Link channel to wallet
              </h2>
              <div className="space-y-4 text-sm font-mono">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                    Rumble channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://rumble.com/c/your-channel"
                    className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-xs outline-none focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                    Wallet address to receive tips
                  </label>
                  <input
                    type="text"
                    placeholder="0x… (EVM address)"
                    className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-xs outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                      Network (demo)
                    </label>
                    <div className="rounded border border-foreground/20 bg-background px-3 py-2 text-[11px] text-muted-foreground">
                      Sepolia · Testnet
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                      Payout token
                    </label>
                    <div className="rounded border border-foreground/20 bg-background px-3 py-2 text-[11px] text-muted-foreground">
                      USD₮ (demo)
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center justify-center rounded border border-[#ea580c] bg-[#ea580c] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-background"
                >
                  Save mapping (demo only)
                </button>
                <p className="text-[11px] text-muted-foreground">
                  In a full build, this would store a mapping between your Rumble channel and wallet so the agent can
                  route tips automatically. For the hackathon we keep this read-only / illustrative.
                </p>
              </div>
            </div>

            <aside className="rounded-xl border border-foreground/15 bg-background/80 p-5 text-xs font-mono">
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Creator earnings (demo)
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Total tipped to you (demo)</div>
                  <div className="text-base font-semibold text-foreground">$342.75 USD₮</div>
                  <div className="text-[11px] text-muted-foreground">From 57 agent-driven supporters</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Most tipped video</div>
                  <div className="text-[12px] text-foreground">
                    It&apos;s not just a stream... it&apos;s an experience
                  </div>
                  <div className="text-[11px] text-muted-foreground">Dr Disrespect · $87.10 USD₮ via agents</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-1">Last 7 days</div>
                    <div className="text-[13px] font-semibold text-foreground">$128.30 USD₮</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-1">Best day</div>
                    <div className="text-[13px] font-semibold text-foreground">$54.00 USD₮</div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Numbers above are mock data for the hackathon. In production they would be derived from on-chain
                  transfers from the RumbleTip agent wallet to your wallet.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

