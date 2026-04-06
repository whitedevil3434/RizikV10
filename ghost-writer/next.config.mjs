/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Google Font optimization — CF Pages edge cannot fetch fonts at build time
  optimizeFonts: false,
};

export default nextConfig;

