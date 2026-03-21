/**
 * RumbleTipper content script — runs on rumble.com
 * On hover over video/creator cards: fetch alpha score, show overlay, "Tip via Agent" button.
 */

(function () {
  const API_BASE = "http://localhost:3000"; // Set to your deployed URL in production (e.g. https://yourapp.vercel.app)

  // Selectors for Rumble — adjust after inspecting rumble.com/browse and watch pages
  const VIDEO_LINK_SELECTOR = 'a[href*="/videos/"]';
  const CARD_SELECTOR = ".video-item, .listing-item, [class*='video'], [class*='listing']";

  let overlayEl = null;
  let currentTarget = null;
  let hideTimeout = null;

  function getReadInfoFromDOM(el) {
    if (typeof RumbleTipperDOM !== "undefined" && RumbleTipperDOM.readCardInfo) {
      return RumbleTipperDOM.readCardInfo(el);
    }
    const link = el.closest("a") || el.querySelector("a");
    let creatorId = "demo-creator-" + Math.random().toString(36).slice(2, 9);
    if (link && link.href) {
      try {
        const path = new URL(link.href).pathname;
        const match = path.match(/\/videos?\/([^/]+)/) || path.match(/\/([^/]+)$/);
        if (match) creatorId = match[1];
      } catch (_) {}
    }
    return { creatorId, title: "", creatorName: "", views: null, rawText: "" };
  }

  function createOverlay() {
    if (overlayEl) return overlayEl;
    const div = document.createElement("div");
    div.id = "rumbletip-overlay";
    div.className = "rumbletip-overlay";
    div.innerHTML = `
      <div class="rumbletip-card">
        <div class="rumbletip-loading">Loading…</div>
        <div class="rumbletip-content" style="display:none">
          <div class="rumbletip-title">RumbleTipper</div>
          <div class="rumbletip-read-from-page"></div>
          <div class="rumbletip-score"></div>
          <div class="rumbletip-metrics"></div>
          <div class="rumbletip-suggested"></div>
          <div class="rumbletip-form" style="margin-top:8px">
            <input type="number" class="rumbletip-amount" placeholder="Amount (USD)" min="1" max="100" step="1" />
            <input type="text" class="rumbletip-recipient" placeholder="Recipient 0x…" />
            <button type="button" class="rumbletip-btn">Tip via Agent</button>
          </div>
          <div class="rumbletip-result" style="display:none; margin-top:6px; font-size:11px"></div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    overlayEl = div;
    return div;
  }

  function showOverlay(x, y, hoveredEl) {
    const readInfo = getReadInfoFromDOM(hoveredEl);
    const creatorId = readInfo.creatorId;

    const overlay = createOverlay();
    const card = overlay.querySelector(".rumbletip-card");
    const loading = overlay.querySelector(".rumbletip-loading");
    const content = overlay.querySelector(".rumbletip-content");
    const readEl = overlay.querySelector(".rumbletip-read-from-page");
    const scoreEl = overlay.querySelector(".rumbletip-score");
    const metricsEl = overlay.querySelector(".rumbletip-metrics");
    const suggestedEl = overlay.querySelector(".rumbletip-suggested");
    const amountInput = overlay.querySelector(".rumbletip-amount");
    const recipientInput = overlay.querySelector(".rumbletip-recipient");
    const resultEl = overlay.querySelector(".rumbletip-result");
    const btn = overlay.querySelector(".rumbletip-btn");

    content.style.display = "none";
    loading.style.display = "block";
    resultEl.style.display = "none";
    overlay.classList.add("rumbletip-visible");
    card.style.left = x + "px";
    card.style.top = y + "px";

    var readLines = [];
    if (readInfo.title) readLines.push("Video: " + readInfo.title);
    if (readInfo.creatorName) readLines.push("Creator: " + readInfo.creatorName);
    if (readInfo.views != null) readLines.push("Views: " + (readInfo.views >= 1000 ? (readInfo.views / 1000).toFixed(1) + "K" : readInfo.views));
    if (readInfo.subscribers != null) readLines.push("Subs: " + (readInfo.subscribers >= 1000 ? (readInfo.subscribers / 1000).toFixed(1) + "K" : readInfo.subscribers));
    if (readInfo.videoId) readLines.push("ID: " + readInfo.videoId);
    readEl.textContent = readLines.length ? readLines.join(" · ") : "(read from page)";
    readEl.style.color = "#a3a3a3";
    readEl.style.fontSize = "11px";
    readEl.style.marginBottom = "6px";

    fetch(`${API_BASE}/api/creator/${encodeURIComponent(creatorId)}/alpha`)
      .then((r) => r.json())
      .then((data) => {
        loading.style.display = "none";
        content.style.display = "block";
        scoreEl.textContent = `Alpha Score: ${Math.round(data.alphaScore * 100)}/100 – ${data.alphaScore >= 0.7 ? "High potential" : "Rising"}`;
        metricsEl.textContent = `Views: ${data.metrics?.views ?? "—"} · Engagement: ${(data.metrics?.engagement ?? 0) * 100}%`;
        suggestedEl.textContent = `Suggested tip: ${data.suggestedTip} ${data.token || "USD₮"}`;
        amountInput.value = data.suggestedTip || 5;
        amountInput.dataset.creatorId = creatorId;

        btn.onclick = function () {
          const amount = parseFloat(amountInput.value);
          const recipient = recipientInput.value.trim();
          if (!amount || amount <= 0) {
            resultEl.style.display = "block";
            resultEl.textContent = "Enter a valid amount.";
            resultEl.style.color = "#c00";
            return;
          }
          if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
            resultEl.style.display = "block";
            resultEl.textContent = "Enter a valid 0x recipient address.";
            resultEl.style.color = "#c00";
            return;
          }
          btn.disabled = true;
          resultEl.textContent = "Sending tip…";
          resultEl.style.color = "";
          resultEl.style.display = "block";

          fetch(`${API_BASE}/api/creator/${encodeURIComponent(creatorId)}/tip`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, recipient }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.ok) {
                resultEl.textContent = `Tipped ${res.amount} USD₮ ✅ Tx: ${(res.txHash || "").slice(0, 10)}…`;
                resultEl.style.color = "#0a0";
              } else {
                resultEl.textContent = "Error: " + (res.error || "Tip failed");
                resultEl.style.color = "#c00";
              }
            })
            .catch((e) => {
              resultEl.textContent = "Error: " + e.message;
              resultEl.style.color = "#c00";
            })
            .finally(() => {
              btn.disabled = false;
            });
        };
      })
      .catch((e) => {
        loading.style.display = "none";
        content.style.display = "block";
        scoreEl.textContent = "Could not load Alpha score.";
        metricsEl.textContent = e.message || "Check API_BASE and CORS.";
      });
  }

  function hideOverlay() {
    if (overlayEl) {
      overlayEl.classList.remove("rumbletip-visible");
    }
    currentTarget = null;
  }

  function onMouseEnter(e) {
    if (hideTimeout) clearTimeout(hideTimeout);
    const card = e.target.closest(CARD_SELECTOR) || e.target.closest("a[href*='/videos/']");
    const link = e.target.closest(VIDEO_LINK_SELECTOR) || (card && card.querySelector(VIDEO_LINK_SELECTOR)) || card;
    const el = link || card || e.target;
    if (!el) return;
    currentTarget = el;
    const rect = el.getBoundingClientRect();
    showOverlay(rect.left, rect.bottom + 4, el);
  }

  function onMouseLeave(e) {
    const related = e.relatedTarget;
    if (overlayEl && related && overlayEl.contains(related)) return;
    hideTimeout = setTimeout(hideOverlay, 300);
  }

  function init() {
    const nodes = document.querySelectorAll(VIDEO_LINK_SELECTOR + ", " + CARD_SELECTOR);
    nodes.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnter, true);
      el.addEventListener("mouseleave", onMouseLeave, true);
    });
    if (nodes.length === 0) {
      const fallback = document.querySelector("main, [role='main'], .content") || document.body;
      fallback.addEventListener("mouseenter", onMouseEnter, true);
      fallback.addEventListener("mouseleave", onMouseLeave, true);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  const observer = new MutationObserver(() => init());
  observer.observe(document.body, { childList: true, subtree: true });
})();
