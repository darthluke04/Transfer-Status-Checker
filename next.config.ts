import type {NextConfig} from 'next';

/**
 * Configuration for Next.js.
 * This file is set up for deploying to GitHub Pages.
 * @see https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
 */
const nextConfig: NextConfig = {
  /**
   * The `output: 'export'` property is configured automatically
   * by the build process when deploying to GitHub Pages.
   * Removing it from here can resolve 404 errors in the dev environment.
   */

  /**
   * Set the base path to your repository name.
   * This is required for GitHub Pages to correctly resolve assets.
   *
   * IMPORTANT: You MUST replace 'your-repo-name' with the actual name
   * of your GitHub repository. For example, if your repository URL is
   * https://github.com/johndoe/my-awesome-app, you should set this
   * to '/my-awesome-app'.
   */
  basePath: '/Transfer-Status-Check',

  /**
   * Disable Next.js's default image optimization, which is not compatible
   * with `output: 'export'`.
   */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  /* Other configs */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
