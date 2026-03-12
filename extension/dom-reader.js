/**
 * Read creator/video info from Rumble DOM — no API, just parse the page.
 * Works on any social/video layout: find card container, extract links, text, numbers.
 */

(function (global) {
  function getText(node) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || "").trim();
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = (node.tagName || "").toLowerCase();
    if (["script", "style", "noscript"].includes(tag)) return "";
    return (node.textContent || "").trim();
  }

  function getAllText(root, maxLen) {
    const chunks = [];
    const walk = (el) => {
      if (chunks.join(" ").length > (maxLen || 2000)) return;
      if (el.nodeType === Node.TEXT_NODE) {
        const t = (el.textContent || "").trim();
        if (t) chunks.push(t);
        return;
      }
      if (el.nodeType !== Node.ELEMENT_NODE) return;
      const tag = (el.tagName || "").toLowerCase();
      if (["script", "style", "noscript", "svg"].includes(tag)) return;
      for (let i = 0; i < el.childNodes.length; i++) walk(el.childNodes[i]);
    };
    walk(root);
    return chunks.join(" ");
  }

  function getAllLinks(root) {
    const links = [];
    root.querySelectorAll("a[href]").forEach((a) => {
      try {
        const href = a.href;
        const text = getText(a);
        const path = new URL(href).pathname;
        links.push({ href, path, text });
      } catch (_) {}
    });
    return links;
  }

  function parseViewsLike(str) {
    if (!str || typeof str !== "string") return null;
    const lower = str.toLowerCase();
    const numMatch = str.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/);
    if (!numMatch) return null;
    let n = parseFloat(numMatch[1]);
    if (numMatch[2] === "K") n *= 1000;
    else if (numMatch[2] === "M") n *= 1000000;
    else if (numMatch[2] === "B") n *= 1000000000;
    if (lower.includes("view")) return { type: "views", value: n };
    if (lower.includes("subscriber") || lower.includes("follower")) return { type: "subscribers", value: n };
    if (lower.includes("comment")) return { type: "comments", value: n };
    if (lower.includes("like")) return { type: "likes", value: n };
    return { type: "number", value: n };
  }

  function findNumbersAndStats(fullText) {
    const stats = {};
    const patterns = [
      /([\d,.]+\s*[KMB]?)\s*views?/gi,
      /([\d,.]+\s*[KMB]?)\s*subscribers?/gi,
      /([\d,.]+\s*[KMB]?)\s*followers?/gi,
      /([\d,.]+\s*[KMB]?)\s*comments?/gi,
      /([\d,.]+\s*[KMB]?)\s*likes?/gi,
      /views?\s*([\d,.]+\s*[KMB]?)/gi,
      /([\d,]{1,10})\s*views?/gi,
    ];
    patterns.forEach((re) => {
      let m;
      while ((m = re.exec(fullText)) !== null) {
        const parsed = parseViewsLike(m[0]);
        if (parsed && parsed.type !== "number") stats[parsed.type] = parsed.value;
      }
    });
    return stats;
  }

  function getCardRoot(el) {
    if (!el) return null;
    let root = el;
    for (let i = 0; i < 8; i++) {
      if (!root || root === document.body) break;
      const text = getAllText(root, 500);
      const links = root.querySelectorAll ? root.querySelectorAll("a[href]").length : 0;
      if (links >= 1 && text.length >= 10) return root;
      root = root.parentElement;
    }
    return el;
  }

  /**
   * Read all visible info from the DOM for the hovered card.
   * @param {Element} el - Hovered element
   * @returns {{ creatorId: string, videoId: string, title: string, creatorName: string, views: number|null, subscribers: number|null, links: Array<{href,path,text}>, rawText: string, stats: object }}
   */
  function readCardInfo(el) {
    const root = getCardRoot(el);
    const fullText = getAllText(root, 3000);
    const links = getAllLinks(root);
    const stats = findNumbersAndStats(fullText);

    let creatorId = "";
    let videoId = "";
    let title = "";
    let creatorName = "";

    for (const l of links) {
      const path = l.path || "";
      const videoMatch = path.match(/\/videos?\/([^/?#]+)/);
      const userMatch = path.match(/\/(user|channel|c)\/([^/?#]+)/);
      if (videoMatch && !videoId) {
        videoId = videoMatch[1];
        if (l.text && l.text.length > 2 && l.text.length < 200) title = title || l.text;
      }
      if (userMatch && !creatorId) {
        creatorId = userMatch[2];
        if (l.text && l.text.length > 1 && l.text.length < 100) creatorName = creatorName || l.text;
      }
    }

    if (!creatorId && videoId) creatorId = videoId;
    if (!creatorId && links.length) {
      const first = links[0];
      const seg = (first.path || "").split("/").filter(Boolean);
      if (seg.length) creatorId = seg[seg.length - 1];
    }
    if (!creatorId) creatorId = "page-" + (root ? root.innerText.slice(0, 20).replace(/\W/g, "-") : "unknown").slice(0, 30);

    if (!title && fullText) {
      const firstLine = fullText.split(/\n/)[0] || fullText.slice(0, 80);
      if (firstLine.length > 3) title = firstLine;
    }

    return {
      creatorId: creatorId.replace(/\s+/g, "-").slice(0, 120),
      videoId,
      title: title.slice(0, 150),
      creatorName: creatorName.slice(0, 80),
      views: stats.views != null ? stats.views : null,
      subscribers: stats.subscribers != null ? stats.subscribers : null,
      links: links.map((l) => ({ href: l.href, path: l.path, text: (l.text || "").slice(0, 80) })),
      rawText: fullText.slice(0, 500),
      stats,
    };
  }

  global.RumbleTipDOM = { readCardInfo, getCardRoot, getAllText, getAllLinks };
})(typeof window !== "undefined" ? window : globalThis);
