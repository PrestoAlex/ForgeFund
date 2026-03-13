import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Menu, X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/guide', label: 'Guide' },
  { to: '/test-contract', label: 'Test Contracts' },
];

export default function Navbar() {
  const { wallet, walletLoading, connectWallet, disconnectWallet } = useApp();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleWallet = async () => {
    if (wallet.connected) {
      await disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <nav className="sticky top-0 z-40 border-b border-surface-600/50 bg-surface-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group overflow-visible">
            <img
              src="/assets/logo.png"
              alt="ForgeFund Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]"
              style={{ transform: 'translateY(8px) scale(3.15)', transformOrigin: 'left center' }}
              loading="lazy"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'text-btc-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-btc-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/create-project"
              className="btn-secondary flex items-center gap-2 text-sm !py-2 !px-4"
            >
              <Plus size={16} />
              Create Project
            </Link>

            <button
              onClick={handleWallet}
              disabled={walletLoading}
              className="btn-primary flex items-center gap-2 text-sm !py-2 !px-4"
            >
              <Wallet size={16} />
              {walletLoading
                ? 'Connecting...'
                : wallet.connected
                ? truncateAddress(wallet.address!)
                : 'Connect Wallet'}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-surface-600/50 bg-surface-800/95 backdrop-blur-xl"
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-btc-500/10 text-btc-500'
                    : 'text-gray-400 hover:text-white hover:bg-surface-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/create-project"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-btc-500 hover:bg-btc-500/10"
            >
              + Create Project
            </Link>
            <button
              onClick={() => { handleWallet(); setMenuOpen(false); }}
              className="w-full btn-primary flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Wallet size={16} />
              {wallet.connected ? truncateAddress(wallet.address!) : 'Connect Wallet'}
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
