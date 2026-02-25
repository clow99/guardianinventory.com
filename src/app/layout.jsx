// app/layout.js
import "./globals.css";
import UmamiAnalytics from "@/components/analytics/UmamiAnalytics";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>Guardian Inventory</title>
                <script
                    async
                    src="https://dashboard.nexuswebportal.com/script.js"
                    data-website-id="89b98372-8c25-4702-b4f9-6b53d5083bc9"
                ></script>
            </head>

            <body className="antialiased bg-neutral-900 text-neutral-200">
                {children}
                <UmamiAnalytics />
            </body>
        </html>
    );
}
