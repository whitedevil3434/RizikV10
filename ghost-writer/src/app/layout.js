import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: '--font-jetbrains' });

export const metadata = {
  title: "Rizik Writer | Official Voice DNA Engine",
  description: "Extract your unique writing fingerprint and inject it into AI-generated text. A Rizik Tech Subsidiary Product.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
