import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { MasterDataProvider } from "@/contexts/master-data-context";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { DocumentPreviewProvider } from "@/contexts/document-preview-context";
import { DocumentPreviewOffcanvas } from "@/components/ui/document-preview-offcanvas";
import { GlobalErrorHandler } from "@/components/global-error-handler";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Senior Citizen Portal - Delhi Police",
  description: "Kutumb Portal for Senior Citizens - Delhi Police",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Delhi Police Citizen App",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <GlobalErrorHandler />
        <ErrorBoundary>
          <AuthProvider>
            <MasterDataProvider>
              <TooltipProvider>
                <DocumentPreviewProvider>
                  <AccessibilityToolbar />
                  {children}
                  <Toaster />
                  <DocumentPreviewOffcanvas />
                </DocumentPreviewProvider>
              </TooltipProvider>
            </MasterDataProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
