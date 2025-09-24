import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_API_URL || '',
        pathname: "/images/**",
      },
    ],
    domains: [ 'localhost', 'localhost:10345'] 
  },
};

export default nextConfig;
