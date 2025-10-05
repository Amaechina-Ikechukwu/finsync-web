import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnimatedPattern from "@/components/AnimatedPattern";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/toast/ToastProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Finsync Digital Services",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo.png`,
  sameAs: [
    "https://facebook.com",
    "https://twitter.com",
    "https://instagram.com",
    "https://linkedin.com",
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Finsync Digital Services — All Services Working Together",
    template: "%s | Finsync Digital Services",
  },
  description:
    "Finsync Digital Services helps businesses keep financial operations secure, fast, and in perfect sync.",
  applicationName: "Finsync Digital Services",
  keywords: [
    "financial operations",
    "fintech",
    "financial services",
    "accounts payable",
    "accounts receivable",
  ],
  authors: [{ name: "Finsync Digital Services" }],
  openGraph: {
    title: "Finsync Digital Services",
    description:
      "Keep your financial operations secure, fast, and in perfect sync with Finsync Digital Services.",
    url: SITE_URL,
    siteName: "Finsync Digital Services",
    images: [
      {
        url: `${SITE_URL}/assets/logo.png`,
        alt: "Finsync preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finsync Digital Services",
    description:
      "Keep your financial operations secure, fast, and in perfect sync with Finsync Digital Services.",
    images: [`${SITE_URL}/assets/logo.png`],
  },
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
    other: [{ rel: "shortcut icon", url: "/assets/logo.png" }],
  },
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <AnimatedPattern />
        {/* biome-ignore lint/security/noDangerouslySetInnerHTML: Required for SEO JSON-LD schema */}
        <script
          type="application/ld+json"
          // JSON-LD for Organization structured data
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <AuthProvider>
          <ToastProvider>
            <div className="relative z-10">{children}</div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
