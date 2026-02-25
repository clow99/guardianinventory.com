/** @type {import('next').NextConfig} */
const nextConfig = {
  // Treat next-auth as external to avoid Turbopack export detection issues.
  serverExternalPackages: ["next-auth"],
};

export default nextConfig;
