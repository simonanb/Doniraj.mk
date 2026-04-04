import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/%D0%BF%D0%BE%D1%80%D0%B0%D0%BA%D0%B8',
        destination: '/messages',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
