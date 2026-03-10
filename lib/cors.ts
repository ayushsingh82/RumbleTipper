/**
 * CORS headers for API routes called from the RumbleTip browser extension (origin: chrome-extension://*).
 */

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*", // Extension may use any origin; restrict in production if needed
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
