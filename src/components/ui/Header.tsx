import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackground?: boolean;
}

export function Header({ 
  title = "🗽 EndorseNYC", 
  subtitle = "Illuminate the coalition behind each candidate",
  showBackground = true 
}: HeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Background Blobs */}
      {showBackground && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/" className="block">
                <h1 className="text-4xl font-bold text-gray-900 hover:text-yellow-600 transition-colors duration-300">
                  {title}
                </h1>
                <p className="text-gray-600 mt-1">{subtitle}</p>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/about" 
                className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive('/about') 
                    ? 'text-yellow-700 bg-yellow-100 border border-yellow-300' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                About
              </Link>
              <Link 
                href="/demo" 
                className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive('/demo') 
                    ? 'text-yellow-700 bg-yellow-100 border border-yellow-300' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Demo
              </Link>
              <Link 
                href="/sources" 
                className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive('/sources') 
                    ? 'text-yellow-700 bg-yellow-100 border border-yellow-300' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Data Sources
              </Link>
              <Link 
                href="/admin" 
                className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 shadow-lg ${
                  isActive('/admin') 
                    ? 'text-yellow-700 bg-yellow-100 border border-yellow-300' 
                    : 'text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600'
                }`}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
