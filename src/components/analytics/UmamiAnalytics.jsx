import Script from "next/script";

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_HOST_URL = process.env.NEXT_PUBLIC_UMAMI_HOST_URL || "";

function resolveScriptSrc() {
    if (!UMAMI_HOST_URL) {
        return "https://analytics.umami.is/script.js";
    }
    const base = UMAMI_HOST_URL.replace(/\/$/, "");
    return `${base}/script.js`;
}

export default function UmamiAnalytics() {
    if (!UMAMI_WEBSITE_ID) return null;

    const scriptSrc = resolveScriptSrc();
    const dataProps = {};
    if (UMAMI_HOST_URL) {
        dataProps["data-host-url"] = UMAMI_HOST_URL;
    }

    return (
        <Script
            async
            src={scriptSrc}
            data-website-id={UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
            {...dataProps}
        />
    );
}
