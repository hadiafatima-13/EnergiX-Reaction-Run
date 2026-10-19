import type { NextConfig } from 'next';

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const repositoryBasePath = isGitHubActions ? '/EnergiX-Reaction-Run' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: repositoryBasePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
