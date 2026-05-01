/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // ES modules are fetched with CORS; static files skip middleware — headers must be here.
        source: "/buzzy.js",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
      {
        source: "/buzzy/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
