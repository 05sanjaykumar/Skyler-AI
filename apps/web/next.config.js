// apps/web/next.config.js
import transpileModules from 'next-transpile-modules'

/** @type {import("next").NextConfig} */
const nextConfig = {
  // ✅ proper Turbopack config object
  turbopack: {
    // you can leave empty `{}` if you don't need custom alias/loaders
    // Or use something like:
    // resolveAlias: { "@skyler-ai/prisma": "../../packages/prisma/src" },
    // rules: { '*.mdx': { loaders: ['@mdx-js/loader'], as: '*.js' } }
  },

  // ✅ optional serverActions, if needed (turned on by default in v15 anyway)
  experimental: {
    serverActions: {
      // bodySizeLimit?: '2mb'
      // serverComponentsExternalPackages?: ['some-package']
    },
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals?.map((external) => {
        if (typeof external !== "function") return external
        return (ctx, cb) => {
          if (
            ctx.request === "@prisma/client" ||
            ctx.request.includes(".prisma/client")
          ) {
            return cb()
          }
          return external(ctx, cb)
        }
      })
    }
    return config
  },
}

export default transpileModules(["@skyler-ai/prisma"])(nextConfig)