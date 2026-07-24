import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "better-sqlite3"],
  allowedDevOrigins: ["192.168.74.1"],
};

export default nextConfig;