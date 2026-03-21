document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");
  const walletState = document.getElementById("walletState");
  const connectWalletBtn = document.getElementById("connectWalletBtn");
  const createWalletBtn = document.getElementById("createWalletBtn");

  const API_BASE = "http://localhost:3000";

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

  async function connectWallet() {
    if (!walletState || !connectWalletBtn) return;
    connectWalletBtn.textContent = "Connecting...";
    connectWalletBtn.disabled = true;
    walletState.textContent = "Connecting to WDK wallet...";

    try {
      const response = await fetch(`${API_BASE}/api/wallet`, { method: "GET" });
      const data = await response.json();

      if (data.connected && data.address) {
        const shortAddress = `${data.address.slice(0, 8)}...${data.address.slice(-6)}`;
        walletState.textContent = `Connected ${shortAddress} • ${data.balanceEth ?? 0} ETH • ${data.network ?? "Unknown network"}`;
      } else {
        walletState.textContent = data.error || "Wallet not configured. Use Make wallet to set it up.";
      }
    } catch (_error) {
      walletState.textContent = "Could not reach wallet API. Ensure website is running on localhost:3000.";
    } finally {
      connectWalletBtn.textContent = "Connect wallet";
      connectWalletBtn.disabled = false;
    }
  }

  function openWalletSetup() {
    chrome.tabs.create({ url: `${API_BASE}/creator/register` });
  }

  connectWalletBtn?.addEventListener("click", connectWallet);
  createWalletBtn?.addEventListener("click", openWalletSetup);
});
