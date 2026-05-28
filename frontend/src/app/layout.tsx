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
  title: "Youthcamping | Your Story Starts Here",
  description: "Join the community of 10,000+ travelers. Authentic adventure experiences since 2019.",
  icons: {
    icon: "/favicon.ico",
  },
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
