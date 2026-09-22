/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // Enables a self-contained build bundle for Docker / containerised deployments.
  // Does NOT affect `npm run dev` or Vercel/Render deployments.
  output: 'standalone',
};

export default nextConfig;
