/** @type {import('next').NextConfig} */
const nextConfig = {
   //basePath: '/out',
  //assetPrefix: '/out',
  output: 'export',
  trailingSlash: true,
  experimental: {
    appDir: false,
  },  
  images: {
    //domains: ['localhost'],
     unoptimized: true
  },
   typescript: {
    ignoreBuildErrors: true, // ← Ignora errores de TypeScript en build
  },
  //env: {
   // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
 // },
}

module.exports = nextConfig
