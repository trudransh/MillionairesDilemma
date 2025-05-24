import { Inter, Roboto_Mono } from 'next/font/google';
import "./globals.css";
import { Web3Provider } from "@/provider/web3-provider";
import { ChainBalanceProvider } from "@/provider/balance-provider";
import NavBar from "@/components/NavBar";

// Replace local fonts with Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export const metadata = {
  title: "Millionaire's Dilemma",
  description: "A secure wealth comparison app built with Inco FHE",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <Web3Provider>
          <ChainBalanceProvider>
            <div className="min-h-screen bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700">
              <NavBar />
              <main>
                {children}
              </main>
            </div>
          </ChainBalanceProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
