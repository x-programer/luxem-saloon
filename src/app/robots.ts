import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: "/admin/",
            },
            {
                userAgent: "GPTBot",
                allow: "/",
            },
        ],
        sitemap: "https://saloon-book.vercel.app/sitemap.xml",
    };
}
