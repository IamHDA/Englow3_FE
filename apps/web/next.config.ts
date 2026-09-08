import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
