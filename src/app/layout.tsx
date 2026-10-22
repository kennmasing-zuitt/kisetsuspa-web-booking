import type { Metadata, Viewport } from "next";
import StoreProvider from "@/store/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Book online · Kisetsu Spa",
    description: "Book your massage at Kisetsu Spa.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f6f1e9" },
        { media: "(prefers-color-scheme: dark)", color: "#171512" },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <StoreProvider>
                    <div className="shell">
                        <header className="brand">
                            <p className="brand__name">
                                Kisetsu Spa
                                <small>Book online</small>
                            </p>
                            <div className="seasons" aria-hidden>
                                <i style={{ background: "var(--haru)" }} />
                                <i style={{ background: "var(--natsu)" }} />
                                <i style={{ background: "var(--aki)" }} />
                                <i style={{ background: "var(--fuyu)" }} />
                            </div>
                        </header>
                        <main className="main">{children}</main>
                        <footer className="footer">
                            To change or cancel a booking, please call us.
                        </footer>
                    </div>
                </StoreProvider>
            </body>
        </html>
    );
}
