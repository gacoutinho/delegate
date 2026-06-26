import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Claude Agent SDK runs as a server-only (Node) dependency, never in the client bundle.
  serverExternalPackages: ["@anthropic-ai/claude-agent-sdk"],
};

export default nextConfig;
