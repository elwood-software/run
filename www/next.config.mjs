import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { default as mdx } from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    prefetch: false, // Disables prefetching entirely
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        port: "",
        pathname: "/avatar/**",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/plan",
        destination: "/account/subscription",
        permanent: true,
      },
      {
        source: "/plan/:slug",
        destination: "/account/subscription/:slug",
        permanent: true,
      },
      {
        source: "/ffr",
        destination: "/ffremote",
        permanent: true,
      },
      {
        source: "/ffr/:slug",
        destination: "/ffremote/:slug",
        permanent: true,
      },
      {
        source: "/ffr/docs/:slug",
        destination: "/docs/ffremote/:slug",
        permanent: true,
      },
      {
        source: "/ffr/docs",
        destination: "/docs/ffremote",
        permanent: true,
      },
      {
        source: "/ffremote/docs/:slug",
        destination: "/docs/ffremote/:slug",
        permanent: true,
      },
      {
        source: "/ffremote/docs",
        destination: "/docs/ffremote",
        permanent: true,
      },
    ];
  },
};

export default mdx({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrettyCode, rehypeSlug],
  },
})(nextConfig);
