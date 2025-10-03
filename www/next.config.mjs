import remarkGithubAlerts from "remark-github-alerts";
import { recmaCodeHike, remarkCodeHike } from "codehike/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { default as mdx } from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  rewrites: async () => {
    return [
      {
        source: "/:slug",
        destination: "/x/:slug",
        has: [
          {
            type: "header",
            key: "host",
            value: "x.elwood.run",
          },
        ],
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/bunny.mov",
        destination:
          "https://fly.storage.tigris.dev/elwood/big_buck_bunny_1080p_h264.mov",
        permanent: true,
      },
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
      {
        source: "/ffremote/discord",
        destination: "https://discord.gg/JQnas7MM",
        permanent: true,
      },
    ];
  },
};

/** @type {import('codehike/mdx').CodeHikeConfig} */
const opts = {
  components: { code: "Code" },
  syntaxHighlighting: {
    theme: "github-dark-dimmed",
  },
  lineNumbers: false,
  showCopyButton: true,
};

export default mdx({
  options: {
    remarkPlugins: [
      remarkGfm,
      remarkGithubAlerts,
      [
        remarkCodeHike,
        opts,
      ],
    ],
    recmaCodeHike: [[recmaCodeHike, opts]],
    rehypePlugins: [rehypeSlug],
  },
})(nextConfig);
