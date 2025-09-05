// app/layout.js
import "./globals.css";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>Guardian Inventory</title>
            </head>

            <body className="antialiased bg-neutral-900 text-neutral-200">
                {children}
            </body>
        </html>
    );
}
