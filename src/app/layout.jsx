// app/layout.js
import "./globals.css";
import SessionWrapperClient from "@/components/SessionWrapperClient";
import UmamiAnalytics from "@/components/analytics/UmamiAnalytics";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>Guardian Inventory</title>
            </head>

            <body className="antialiased bg-neutral-900 text-neutral-200">
                <SessionWrapperClient>{children}</SessionWrapperClient>
                <UmamiAnalytics />
            </body>
        </html>
    );
}
