'use client';

import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600">
            Music Designed for Your Brain
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Functional music to improve focus, relaxation, and sleep. Backed by neuroscience.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors text-center min-w-40"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors min-w-40">
                  Try For Free
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors min-w-40">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
        
        {/* Visualization */}
        <div className="relative h-48 md:h-64 bg-gray-800 rounded-xl overflow-hidden mx-auto max-w-4xl">
          <div className="absolute inset-0 flex items-end justify-center px-4 pb-6">
            <div className="flex items-end h-full space-x-1">
              {Array.from({ length: 80 }).map((_, i) => {
                const height = Math.sin(i * 0.2) * 60 + Math.random() * 20;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-t ${i % 3 === 0 ? 'bg-purple-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-indigo-500'}`}
                    style={{ 
                      height: `${Math.max(5, height)}%`,
                      opacity: Math.random() * 0.5 + 0.5
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-850">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How MindSync Helps You</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Icon icon="lucide:brain" className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Improve Focus</h3>
              <p className="text-gray-400">
                Our focus music is designed to help you get work done without distraction. Perfect for deep work sessions.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Icon icon="lucide:sparkles" className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Stress</h3>
              <p className="text-gray-400">
                Relax music helps calm your nervous system and reduce anxiety. Take a break and restore your energy.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Icon icon="lucide:moon" className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Better Sleep</h3>
              <p className="text-gray-400">
                Our sleep music helps you fall asleep faster and stay asleep longer. Wake up feeling refreshed.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon key={star} icon="lucide:star" className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-4">
                "MindSync has completely transformed my workday. I can focus for hours without getting distracted or tired."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                  <span className="font-bold">JD</span>
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-400">Software Engineer</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon key={star} icon="lucide:star" className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-4">
                "The sleep sessions have helped me overcome my insomnia. I now fall asleep within minutes instead of hours."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  <span className="font-bold">JS</span>
                </div>
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-400">Marketing Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Brain?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of users who have improved their focus, relaxation, and sleep quality with MindSync.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors min-w-40"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors min-w-40">
                  Start Free Trial
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 bg-gray-850 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Icon icon="fluent-emoji-high-contrast:musical-notes" className="w-8 h-8 text-purple-500 mr-2" />
            <span className="text-xl font-bold">MindSync</span>
          </div>
          
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-gray-300">
              Terms
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-300">
              Privacy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-300">
              Contact
            </Link>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MindSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
