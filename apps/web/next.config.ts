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
      // Here rather than as a page calling redirect(): a page's redirect is
      // streamed into the document and followed by the client router while the
      // app is still hydrating, and the language provider - which reads the
      // learner's choice only after hydration - stayed on Vietnamese. A real
      // 307 loads the destination fresh.
      {
        source: "/study/quiz",
        destination: "/study/daily-path?tab=quizzes",
        permanent: false,
      },
      {
        source: "/dictation",
        destination: "/study/dictation",
        permanent: false,
      },
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
