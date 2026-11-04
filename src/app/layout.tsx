import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { DM_Sans, Fraunces, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getContactEmail, siteConfig } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  ...createPageMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  category: "writing tools",
};

export const viewport: Viewport = {
  themeColor: "#eef2f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
  };

  const contactEmail = getContactEmail();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    ...(contactEmail
      ? {
          email: contactEmail,
          contactPoint: {
            "@type": "ContactPoint",
            email: contactEmail,
            contactType: "customer support",
            availableLanguage: ["English"],
          },
        }
      : {}),
    ...(siteConfig.sameAs.length > 0 ? { sameAs: siteConfig.sameAs } : {}),
  };

  return (
    <html lang={siteConfig.language}>
      <body
        className={`${display.variable} ${sans.variable} ${serif.variable} font-sans antialiased`}
      >
        <JsonLd data={[websiteJsonLd, organizationJsonLd]} />
        <SiteShell>{children}</SiteShell>
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-MR6GRV4J"
          strategy="afterInteractive"
        />
        <Script id="google-tag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
