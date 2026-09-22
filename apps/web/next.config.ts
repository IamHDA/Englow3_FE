import type { NextConfig } from "next";

import { SECURITY_HEADERS } from "./src/config/securityHeaders";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Announcing the framework tells an attacker which CVE list to read first.
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Every route, including API routes and static assets - a header that
        // applies to pages but not to what pages load is half a policy.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/mock-test",
        destination: "/exams",
        permanent: true,
      },
      {
        source: "/mock-test/:id",
        destination: "/exams/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
