import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { DynamicThemeProvider } from "@/components/DynamicThemeProvider";
import { fetchSettings } from "@/lib/api";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "YouthCamping — Adventure Tours for Young India",
  description: "Book Himachal Pradesh, Ladakh, Kashmir, Kerala group tours. Best adventure trips for young adults from Gujarat.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "YouthCamping — Adventure Tours for Young India",
    description: "Book group adventure tours across India.",
    url: "https://youthcamping.in",
    siteName: "YouthCamping",
    images: [{ url: "https://youthcamping.in/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "YouthCamping — Adventure Tours for Young India",
    description: "Book group adventure tours across India.",
    images: ["https://youthcamping.in/og-image.jpg"]
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    settings = await fetchSettings();
  } catch (error) {
    console.error("Layout fetch error:", error);
  }
  
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-montserrat relative">
        <DynamicThemeProvider>
          <Navbar 
            logoUrl={settings?.navbar?.logoUrl} 
            navLinks={settings?.navbar?.links} 
          />
          <main className="flex-grow">{children}</main>
          <Footer 
            logoUrl={settings?.navbar?.logoUrl || settings?.footer?.logoUrl} 
            address={settings?.footer?.address} 
            phone={settings?.footer?.phone} 
          />
          <FloatingWhatsApp />
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
