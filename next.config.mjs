/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export — served by Apache on Hostinger; data comes from the PHP API in /api.
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // Lint/type warnings must never block producing site.zip.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
