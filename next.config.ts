import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  // basePath matches the GitHub repo name for correct asset paths on GitHub Pages
  basePath: isGitHubActions ? "/pae-prototype" : "",
  images: { unoptimized: true },
};

export default nextConfig;
