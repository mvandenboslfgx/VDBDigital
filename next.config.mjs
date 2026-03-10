// CSP: strict; Next.js hydration may require 'unsafe-inline' for scripts in dev. Prefer nonces in production.
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://embed.tawk.to https://*.tawk.to https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tawk.to https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https: https://pageshot.site https://*.tawk.to https://tawk.link https://s3.amazonaws.com",
  "font-src 'self' data: https://fonts.gstatic.com https://*.tawk.to",
  "connect-src 'self' ws: wss: https: wss://*.tawk.to https://api.stripe.com https://*.supabase.co",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://embed.tawk.to https://*.tawk.to",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://api.stripe.com https://*.tawk.to",
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
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/logo-vdb.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/products/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
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
      { source: "/website-scan-gratis", destination: "/website-scan", permanent: true },
      { source: "/seo-analyse-webshop", destination: "/seo/seo-analyse-webshop", permanent: true },
      { source: "/seo-analyse-wordpress", destination: "/seo/seo-analyse-wordpress", permanent: true },
      { source: "/seo-analyse-shopify", destination: "/seo/seo-analyse-shopify", permanent: true },
      { source: "/seo-analyse-saas", destination: "/seo/seo-analyse-saas", permanent: true },
    ];
  },
};

export default nextConfig;

