import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O Claude Agent SDK roda como dependência de servidor (Node), nunca no bundle do cliente.
  serverExternalPackages: ["@anthropic-ai/claude-agent-sdk"],
};

export default nextConfig;
