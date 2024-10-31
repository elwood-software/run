import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { default as mdx } from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  redirects: async () => {
    return [
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
