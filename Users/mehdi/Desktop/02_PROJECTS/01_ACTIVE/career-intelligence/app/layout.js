import "./globals.css";

export const metadata = {
  title: "Career Intelligence Platform",
  description: "AI powered co-op operations and student success platform",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
