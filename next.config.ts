import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // allows easy Vercel deploy + future scaling
  output: "standalone",

  // optional: expose backend URL (can override in Vercel env)
  env: {
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
  },
};

export default nextConfig;
