/**
 * Rumble Tipper — content script on rumble.com
 * Hover overlay: local Alpha only (no network). Tip uses POST to API_BASE.
 */

(function () {
  /** Tip API — same host as the Rumble Tipper web app (override for local dev). */
  const API_BASE = "https://rumble-tipper.vercel.app";

  /** Must match keys in popup.js (chrome.storage.local). */
  const STORAGE_KEYS = {
    autoTipEnabled: "rumbletip_auto_enabled",
    autoTipAmountEth: "rumbletip_auto_amount_eth",
    minWatchMinutes: "rumbletip_min_watch_min",
    minAlphaScore: "rumbletip_min_alpha",
  };

  /** Rough session watch seconds while a Rumble <video> is playing (tick every 2s). */
  let sessionWatchSec = 0;
  let lastPageHref = typeof location !== "undefined" ? location.href : "";
  setInterval(function () {
    if (typeof location !== "undefined" && location.href !== lastPageHref) {
      lastPageHref = location.href;
      sessionWatchSec = 0;
    }
    var v = document.querySelector("video");
    if (v && !v.paused && !v.ended) {
      sessionWatchSec += 2;
    }
  }, 2000);

  /** Same logic as lib/creator-score.ts — deterministic from creator id. No alpha fetch on hover. */
  function localAlphaFromCreatorId(creatorId) {
    var id = String(creatorId == null || creatorId === "" ? "unknown" : creatorId);
    var hash = id.split("").reduce(function (acc, c) {
      return acc + c.charCodeAt(0);
    }, 0);
    var alphaScore = 0.5 + (hash % 50) / 100;
    var suggestedTip = [0.0005, 0.001, 0.002, 0.005][hash % 4];
    var views = 5000 + (hash % 20000);
    var engagement = 0.02 + (hash % 30) / 1000;
    return {
      creatorId: id,
      alphaScore: Math.round(alphaScore * 100) / 100,
      suggestedTip: suggestedTip,
      metrics: {
        views: views,
        engagement: Math.round(engagement * 100) / 100,
      },
      network: "Base Sepolia",
      token: "ETH",
    };
  }

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
    div.id = "rumbletipper-wdk-overlay";
    div.className = "rumbletipper-wdk-overlay";
    div.innerHTML = `
      <div class="rumbletip-card">
        <div class="rumbletip-content">
          <div class="rumbletip-title">Rumble Tipper</div>
          <div class="rumbletip-read-from-page"></div>
          <div class="rumbletip-score"></div>
          <div class="rumbletip-metrics"></div>
          <div class="rumbletip-suggested"></div>
          <div class="rumbletip-form" style="margin-top:8px">
            <input type="number" class="rumbletip-amount" placeholder="Amount (ETH)" min="0.000000000000000001" max="1" step="0.0001" />
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

  function wireTipButton(btn, creatorId, amountInput, recipientInput, resultEl) {
    btn.onclick = function () {
      const amount = parseFloat(amountInput.value);
      const recipient = recipientInput.value.trim();
      if (!amount || amount <= 0 || !Number.isFinite(amount)) {
        resultEl.style.display = "block";
        resultEl.textContent = "Enter a valid ETH amount.";
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
            resultEl.textContent = `Sent ${res.amount} ETH (Base Sepolia) ✅ Tx: ${(res.txHash || "").slice(0, 10)}…`;
            resultEl.style.color = "#0a0";
          } else {
            resultEl.textContent = "Error: " + (res.error || "Tip failed");
            resultEl.style.color = "#c00";
          }
        })
        .catch(() => {
          resultEl.textContent = "Can't reach tip API. Try again or check the site.";
          resultEl.style.color = "#c00";
        })
        .finally(() => {
          btn.disabled = false;
        });
    };
  }

  function applyAlphaToOverlay(
    data,
    creatorId,
    content,
    scoreEl,
    metricsEl,
    suggestedEl,
    amountInput,
    recipientInput,
    resultEl,
    btn
  ) {
    if (content) content.style.display = "block";
    scoreEl.style.display = "";
    metricsEl.style.display = "";

    try {
      var scorePct = Math.round((Number(data.alphaScore) || 0) * 100);
      var label = (data.alphaScore || 0) >= 0.7 ? "High potential" : "Rising";
      scoreEl.textContent = "Alpha: " + scorePct + "/100 — " + label;

      const eng =
        data.metrics && data.metrics.engagement != null
          ? (Number(data.metrics.engagement) * 100).toFixed(1)
          : "—";
      metricsEl.textContent =
        "Views: " + (data.metrics && data.metrics.views != null ? data.metrics.views : "—") +
        " · Engagement: " +
        eng +
        "% · " +
        (data.network || "Base Sepolia");

      const suggested = data.suggestedTip != null ? data.suggestedTip : 0.001;
      const tok = data.token || "ETH";
      suggestedEl.textContent = "Suggested tip: " + suggested + " " + tok;

      amountInput.value = suggested;
      amountInput.dataset.creatorId = creatorId;

      wireTipButton(btn, creatorId, amountInput, recipientInput, resultEl);

      applyAutoRules(amountInput, suggestedEl, data);
    } catch (_err) {
      scoreEl.textContent = "";
      scoreEl.style.display = "none";
      metricsEl.textContent = "";
      metricsEl.style.display = "none";
      suggestedEl.textContent = "Suggested tip: 0.001 ETH";
      amountInput.value = "0.001";
      amountInput.dataset.creatorId = creatorId;
      wireTipButton(btn, creatorId, amountInput, recipientInput, resultEl);
    }
  }

  function applyAutoRules(amountInput, suggestedEl, alphaData) {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get(
      {
        [STORAGE_KEYS.autoTipEnabled]: false,
        [STORAGE_KEYS.autoTipAmountEth]: 0.001,
        [STORAGE_KEYS.minWatchMinutes]: 3,
        [STORAGE_KEYS.minAlphaScore]: 0,
      },
      function (r) {
        if (!r[STORAGE_KEYS.autoTipEnabled]) return;
        var minMin = Number(r[STORAGE_KEYS.minWatchMinutes]) || 0;
        var minAlpha = Number(r[STORAGE_KEYS.minAlphaScore]) || 0;
        var amt = parseFloat(r[STORAGE_KEYS.autoTipAmountEth]);
        if (!amt || amt <= 0 || !Number.isFinite(amt)) return;
        if (sessionWatchSec < minMin * 60) return;
        if (minAlpha > 0 && (alphaData.alphaScore || 0) < minAlpha) return;
        amountInput.value = String(amt);
        var base = suggestedEl.textContent || "";
        suggestedEl.textContent = base.indexOf("Auto rule") >= 0 ? base : base + " · Auto rule (watch ≥ " + minMin + "m)";
      }
    );
  }

  function showOverlay(x, y, hoveredEl) {
    const readInfo = getReadInfoFromDOM(hoveredEl);
    const creatorId = readInfo.creatorId;

    const overlay = createOverlay();
    const card = overlay.querySelector(".rumbletip-card");
    const content = overlay.querySelector(".rumbletip-content");
    const readEl = overlay.querySelector(".rumbletip-read-from-page");
    const scoreEl = overlay.querySelector(".rumbletip-score");
    const metricsEl = overlay.querySelector(".rumbletip-metrics");
    const suggestedEl = overlay.querySelector(".rumbletip-suggested");
    const amountInput = overlay.querySelector(".rumbletip-amount");
    const recipientInput = overlay.querySelector(".rumbletip-recipient");
    const resultEl = overlay.querySelector(".rumbletip-result");
    const btn = overlay.querySelector(".rumbletip-btn");

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

    try {
      var local = localAlphaFromCreatorId(creatorId);
      applyAlphaToOverlay(local, creatorId, content, scoreEl, metricsEl, suggestedEl, amountInput, recipientInput, resultEl, btn);
    } catch (_e) {
      content.style.display = "block";
      scoreEl.textContent = "";
      scoreEl.style.display = "none";
      metricsEl.textContent = "";
      metricsEl.style.display = "none";
      suggestedEl.textContent = "Suggested tip: 0.001 ETH";
      amountInput.value = "0.001";
      amountInput.dataset.creatorId = creatorId;
      wireTipButton(btn, creatorId, amountInput, recipientInput, resultEl);
    }
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
