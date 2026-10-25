import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: "/placements",
                destination: process.env.PLACEMENTS_URL || "/",
                permanent: true,
            },
        ];
    }
};

export default nextConfig;
