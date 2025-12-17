/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: false,
  },
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
}

module.exports = nextConfig

