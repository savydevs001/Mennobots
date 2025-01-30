import localFont from "next/font/local";
import { ProgressBar, ProgressBarProvider } from "react-transition-progress";
import Head from "next/head";
import { constructMetadata } from "@/lib/utils";
import "./globals.css";
import { register } from "@/app/instrumentation";




const nunito = localFont({
  src: "./fonts/Nunito.ttf",
  variable: "--font-nunito",
  weight: "100 900",
  display: "swap",
});

export const metadata = constructMetadata();

export default function RootLayout({ children }) {


  if (typeof window === "undefined") {
    console.log("Registering instrumentation...");
    register();
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href={metadata.icons} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta
          property="og:image:url"
          content="https://mennobots.vercel.app/opengraph-image.png"
        />
        <meta property="og:url" content={metadata.metadataBase} />
      </Head>
      <body className={`min-h-screen ${nunito.variable} antialiased`}>
        <ProgressBarProvider>
          <ProgressBar className="fixed h-2 shadow-lg bg-blue-700 top-0 z-[10000]" />
      
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}
