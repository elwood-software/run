import remarkGfm from 'remark-gfm'
import { default as mdx } from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

export default mdx({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})(nextConfig);
