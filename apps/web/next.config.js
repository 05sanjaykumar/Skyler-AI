// apps/web/next.config.js
import transpileModules from 'next-transpile-modules';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals.map((external) => {
        if (typeof external !== 'function') return external;
        return (ctx, cb) => {
          if (
            ctx.request === '@prisma/client' ||
            ctx.request.includes('.prisma/client')
          ) {
            return cb();
          }
          return external(ctx, cb);
        };
      });
    }
    return config;
  },
};

export default transpileModules(['@skyler-ai/prisma'])(nextConfig);
