// app/layout.js
import "./globals.css";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>Guardian Inventory</title>
            </head>

            <body>{children}</body>
        </html>
    );
}
