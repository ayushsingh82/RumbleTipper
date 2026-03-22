document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");
  const walletState = document.getElementById("walletState");
  const connectWalletBtn = document.getElementById("connectWalletBtn");
  const createWalletBtn = document.getElementById("createWalletBtn");
  const openRumbleBtn = document.getElementById("openRumbleBtn");
  const openSiteBtn = document.getElementById("openSiteBtn");
  const autoRulesForm = document.getElementById("autoRulesForm");
  const autoRulesStatus = document.getElementById("autoRulesStatus");

  /** Live deployment — API + landing. Change to http://localhost:3000 for local backend only. */
  const SITE_ORIGIN = "https://rumble-tipper.vercel.app";
  const API_BASE = SITE_ORIGIN;

  const STORAGE = {
    autoTipEnabled: "rumbletip_auto_enabled",
    autoTipAmountEth: "rumbletip_auto_amount_eth",
    minWatchMinutes: "rumbletip_min_watch_min",
    minAlphaScore: "rumbletip_min_alpha",
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      if (!target) return;

      tabs.forEach((item) => item.classList.remove("active"));
      views.forEach((view) => view.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(target)?.classList.add("active");
    });
  });

  function networkLabel(data) {
    if (data.chainId === 84532) return "Base Sepolia";
    if (data.chainId === 8453) return "Base";
    return data.network || "Unknown";
  }

  function formatBalanceEth(n) {
    if (typeof n !== "number" || Number.isNaN(n)) return "0";
    if (n === 0) return "0";
    if (n < 0.0001) return n.toExponential(2);
    return n.toFixed(n < 0.01 ? 6 : 4);
  }

  async function connectWallet() {
    if (!walletState || !connectWalletBtn) return;
    connectWalletBtn.textContent = "Connecting…";
    connectWalletBtn.disabled = true;
    walletState.classList.remove("muted");
    walletState.textContent = "Connecting to WDK wallet…";

    try {
      const response = await fetch(`${API_BASE}/api/wallet`, { method: "GET" });
      const data = await response.json();

      if (data.connected && data.address) {
        const short = `${data.address.slice(0, 8)}…${data.address.slice(-6)}`;
        const net = networkLabel(data);
        const bal = formatBalanceEth(data.balanceEth);
        let hint = "";
        if (data.chainId === 1) {
          hint =
            '<br/><span style="color:var(--warn);font-size:10px">RPC is Ethereum mainnet. On Vercel set <code style="color:var(--accent)">WDK_RPC_URL=https://sepolia.base.org</code> in project env.</span>';
        }
        walletState.innerHTML = `<strong>Connected</strong> ${short}<br/><span style="color:var(--muted)">${bal} ETH · ${net}</span>${hint}`;
      } else {
        walletState.classList.add("muted");
        walletState.textContent = data.error || "Wallet not configured. Add WDK_SEED_PHRASE in .env.local or use Make wallet.";
      }
    } catch (_error) {
      walletState.classList.add("muted");
      walletState.textContent =
        "Could not reach /api/wallet. Check https://rumble-tipper.vercel.app is up, or run the Next app locally.";
    } finally {
      connectWalletBtn.textContent = "Connect wallet";
      connectWalletBtn.disabled = false;
    }
  }

  function openWalletSetup() {
    chrome.tabs.create({ url: `${SITE_ORIGIN}/creator/register` });
  }

  function openRumble() {
    chrome.tabs.create({ url: "https://rumble.com/" });
  }

  function openSite() {
    chrome.tabs.create({ url: `${SITE_ORIGIN}/` });
  }

  connectWalletBtn?.addEventListener("click", connectWallet);
  createWalletBtn?.addEventListener("click", openWalletSetup);
  openRumbleBtn?.addEventListener("click", openRumble);
  openSiteBtn?.addEventListener("click", openSite);

  /** Load auto-tip rules from chrome.storage */
  chrome.storage?.local.get(
    {
      [STORAGE.autoTipEnabled]: false,
      [STORAGE.autoTipAmountEth]: 0.001,
      [STORAGE.minWatchMinutes]: 3,
      [STORAGE.minAlphaScore]: 0,
    },
    (r) => {
      const el = (id) => document.getElementById(id);
      const en = el("autoTipEnabled");
      const amt = el("autoTipAmountEth");
      const min = el("minWatchMinutes");
      const al = el("minAlphaScore");
      if (en) en.checked = !!r[STORAGE.autoTipEnabled];
      if (amt) amt.value = String(r[STORAGE.autoTipAmountEth] ?? 0.001);
      if (min) min.value = String(r[STORAGE.minWatchMinutes] ?? 3);
      if (al) al.value = String(r[STORAGE.minAlphaScore] ?? 0);
    }
  );

  autoRulesForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const enabled = document.getElementById("autoTipEnabled")?.checked ?? false;
    const amount = parseFloat(document.getElementById("autoTipAmountEth")?.value ?? "0");
    const minWatch = parseInt(document.getElementById("minWatchMinutes")?.value ?? "0", 10);
    const minAlpha = parseFloat(document.getElementById("minAlphaScore")?.value ?? "0");

    if (!chrome.storage?.local) {
      if (autoRulesStatus) autoRulesStatus.textContent = "Storage API unavailable.";
      return;
    }

    chrome.storage.local.set(
      {
        [STORAGE.autoTipEnabled]: enabled,
        [STORAGE.autoTipAmountEth]: Number.isFinite(amount) ? amount : 0.001,
        [STORAGE.minWatchMinutes]: Number.isFinite(minWatch) ? minWatch : 0,
        [STORAGE.minAlphaScore]: Number.isFinite(minAlpha) ? minAlpha : 0,
      },
      () => {
        if (autoRulesStatus) {
          autoRulesStatus.textContent = "Saved — rules apply on Rumble when you open the tip overlay.";
        }
      }
    );
  });
});
