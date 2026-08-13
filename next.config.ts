import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the app root so Next does not pick up Desktop/package-lock.json.
    root: projectRoot,
  },
};

export default nextConfig;
