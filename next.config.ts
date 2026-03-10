import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't bundle native addons (e.g. sodium-native used by WDK) — load them in Node at runtime
  serverExternalPackages: ["sodium-native", "@tetherto/wdk", "@tetherto/wdk-wallet-evm"],
};

export default nextConfig;
