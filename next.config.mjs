/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `next dev` and `next build` share .next by default, so running a build
  // while the dev server is up corrupts it (MODULE_NOT_FOUND on every route).
  // Set NEXT_DIST_DIR to build into a separate folder instead.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Docker/Dokploy builds emit a self-contained server bundle. Left unset on
  // Vercel, which supplies its own output target.
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  experimental: {
    // Rewrites barrel imports to deep paths so only the icons/components
    // actually used end up in the bundle.
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'date-fns'],
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'renderways.in' },
    ],
  },
};

export default nextConfig;
