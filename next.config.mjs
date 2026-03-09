// CSP: strict; Next.js hydration may require 'unsafe-inline' for scripts in dev. Prefer nonces in production.
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://embed.tawk.to",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: https://pageshot.site",
  "font-src 'self' data:",
  "connect-src 'self' ws: wss: https: https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://embed.tawk.to",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://api.stripe.com",
  "object-src 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/kennis", destination: "/kennisbank", permanent: true },
      { source: "/kennis/:path*", destination: "/kennisbank/:path*", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/legal-notice", destination: "/voorwaarden", permanent: true },
      { source: "/cookie-policy", destination: "/cookies", permanent: true },
      { source: "/pricing", destination: "/prijzen", permanent: true },
      { source: "/gratis-website-scan", destination: "/website-scan", permanent: true },
    ];
  },
};

export default nextConfig;

