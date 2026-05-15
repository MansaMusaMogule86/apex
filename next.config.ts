import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // Redirect old routes to new canonical routes
      {
        source: "/dashboard",
        destination: "/command-center",
        permanent: true,
      },
      {
        source: "/analytics",
        destination: "/market-intelligence",
        permanent: true,
      },
      {
        source: "/leads",
        destination: "/lead-intelligence",
        permanent: true,
      },
      {
        source: "/influencers",
        destination: "/influence-network",
        permanent: true,
      },
      {
        source: "/reports",
        destination: "/executive-reports",
        permanent: true,
      },
      {
        source: "/ai",
        destination: "/ai-recommendation-engine",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
