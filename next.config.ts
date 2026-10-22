import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // Plain static files (out/): no Node server. Nginx serves them at kisetsuspa.com/book
    output: "export",
    // The site lives under /book (change both if it moves, e.g. to book.kisetsuspa.com: "")
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/book",
    // /book/setup/ -> out/setup/index.html, which any static server can serve
    trailingSlash: true,
    images: { unoptimized: true },
};

export default nextConfig;
