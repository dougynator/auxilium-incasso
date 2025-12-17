const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: false,
  },
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
}

module.exports = withNextIntl(nextConfig)

