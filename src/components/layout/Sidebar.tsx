'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

// Define navigation items outside the component for consistency
const navItems = [
  { name: 'Home', path: '/dashboard', icon: 'lucide:home' },
  { name: 'Player', path: '/player', icon: 'lucide:music' },
  { name: 'Library', path: '/dashboard/library', icon: 'lucide:library' },
  { name: 'History', path: '/dashboard/history', icon: 'lucide:history' },
  { name: 'Settings', path: '/dashboard/settings', icon: 'lucide:settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 pt-16 bg-gray-900 border-r border-gray-800 z-40">
      <div className="h-full flex flex-col py-6">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-2 py-2.5 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-purple-600/20 text-purple-400' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}
                `}
              >
                <Icon icon={item.icon} className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 hidden md:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-6 px-3">
          <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:block">
            Your Playlists
          </h3>
          <div className="mt-2 space-y-1">
            <button className="flex w-full items-center px-2 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg">
              <Icon icon="lucide:plus-circle" className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3 hidden md:inline">Create Playlist</span>
            </button>
          </div>
        </div>
        
        <div className="mt-auto px-3">
          <div className="space-y-1">
            <Link 
              href="/dashboard/help" 
              className="flex items-center px-2 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"
            >
              <Icon icon="lucide:help-circle" className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3 hidden md:inline">Help & Support</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
} 