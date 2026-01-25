module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#171717",
                },
                popover: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#171717",
                },
                primary: {
                    DEFAULT: "#8B5CF6", // Soft Vivid Violet
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#F3F0FF", // Very Pale Lavender
                    foreground: "#2E1065",
                },
                muted: {
                    DEFAULT: "#F3F0FF",
                    foreground: "#6D28D9",
                },
                accent: {
                    DEFAULT: "#F3F0FF",
                    foreground: "#2E1065",
                },
                destructive: {
                    DEFAULT: "#EF4444",
                    foreground: "#FFFFFF",
                },
                border: "#E5E7EB",
                input: "#E5E7EB",
                ring: "#8B5CF6",
                surface: "#FFFFFF",
                textMain: "#2E1065", // Deep Dark Violet
                textMuted: "#6D28D9", // Muted Purple
                luxe: {
                    primary: "#6F2DBD", // Royal Purple
                    secondary: "#A663CC", // Orchid
                    dark: "#171123", // Midnight
                    surface: "#FBFBFF", // White/Blueish
                },
                // DYNAMIC BRANDING
                brand: {
                    DEFAULT: "var(--brand-primary)",
                    soft: "var(--brand-primary-soft)",
                    hover: "var(--brand-primary-hover)",
                    foreground: "#FFFFFF",
                },
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)',
                'glow': '0 0 15px rgba(139, 92, 246, 0.3)',
            },
        },
    },
    plugins: [],
};