import Link from "next/link";
import WalletButton from "./WalletButton";

export default function NavBar() {
  return (
    <nav className="bg-gradient-to-r from-violet-900/80 to-indigo-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-xl">
              Millionaire's Dilemma
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/games" 
                className="text-white/80 hover:text-white px-3 py-2 rounded-md transition-colors"
              >
                Games
              </Link>
              <Link 
                href="/games/create" 
                className="text-white/80 hover:text-white px-3 py-2 rounded-md transition-colors"
              >
                Create Game
              </Link>
            </div>
          </div>
          
          <WalletButton />
        </div>
      </div>
    </nav>
  );
} 