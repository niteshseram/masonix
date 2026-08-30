import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['masonix'],
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/guide/getting-started',
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
