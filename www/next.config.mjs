import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from 'remark-gfm'
import { default as mdx } from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  redirects: async () => {
    return [
      {
        source: '/ffr',
        destination: '/ffremote',
        permanent: true
      },
      {
        source: '/ffr/:slug',
        destination: '/ffremote/:slug',
        permanent: true
      }
    ]
  }
};

export default mdx({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrettyCode],
  },
})(nextConfig);
