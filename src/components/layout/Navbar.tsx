'use client';

import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Define navigation items as a constant to ensure consistency
const navigationItems = ['Dashboard', 'Player', 'Pricing', 'About'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  // Add scroll event listener to detect when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Subtle animations for Navbar items
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.4,
        ease: "easeOut" 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-800/50 shadow-lg' 
          : 'bg-gray-900 border-b border-gray-800'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <motion.div 
          className="flex items-center justify-between"
          variants={navVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md group-hover:blur-xl transition-all duration-300"></div>
                <Icon icon="fluent-emoji-high-contrast:musical-notes" className="w-8 h-8 text-purple-500 relative z-10" />
              </motion.div>
              <span className="ml-2 text-xl font-bold text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Mind</span>
                Sync
              </span>
            </Link>
          </motion.div>
          
          <motion.nav variants={itemVariants} className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`} 
                className="text-gray-300 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </motion.nav>
          
          <motion.div variants={itemVariants} className="flex items-center space-x-4">
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9",
                    userButtonTrigger: "rounded-full ring-2 ring-purple-500 hover:ring-purple-400 transition-all duration-300"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign in
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-all duration-300"
                >
                  Sign up
                </motion.button>
              </SignUpButton>
            </SignedOut>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
} 