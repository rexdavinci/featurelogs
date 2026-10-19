import type {NextConfig} from 'next';
import { EventEmitter } from 'events';

// Increase EventEmitter limit for dev tooling and HMR to avoid MaxListeners warnings.
EventEmitter.defaultMaxListeners = 20;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Auth actions include passwords/tokens; never log invocation arguments in development.
  logging: { serverFunctions: false },
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {},
  // Allow access to remote image placeholder.
  images: {
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;


