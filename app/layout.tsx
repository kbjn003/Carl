import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--nf-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--nf-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--nf-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Carl",
  description: "Let creatives be creative. Let Carl handle the admin.",
  appleWebApp: {
    capable: true,
    title: "Carl",
    statusBarStyle: "black-translucent",
  },
  // Next only emits `mobile-web-app-capable`; older iOS still looks for the Apple name.
  other: { "apple-mobile-web-app-capable": "yes" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#131211",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
