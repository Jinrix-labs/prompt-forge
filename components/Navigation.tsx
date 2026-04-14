'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Sparkles, DollarSign, Menu, X, FileText } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useState } from 'react';

export function Navigation() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const navItems = [
        { href: '/templates', label: 'TEMPLATES', icon: FileText },
        { href: '/prompts', label: 'PROMPTS', icon: Zap },
        { href: '/saved', label: 'SAVED', icon: Sparkles },
        { href: '/pricing', label: 'PRICING', icon: DollarSign },
    ];

    return (
        <nav className="border-b-2 border-gray-800 bg-black/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link 
                        href="/" 
                        className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-cyan-400 to-magenta-400 bg-clip-text text-transparent hover:opacity-90 transition-all"
                    >
                        ZUNNO
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 font-bold transition-all ${
                                        isActive
                                            ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1'
                                            : 'text-gray-400 hover:text-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-4 py-2 transition-all">
                                    SIGN IN
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-400 hover:text-white transition-all"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
                        <div className="flex flex-col gap-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 font-bold transition-all py-2 ${
                                            isActive
                                                ? 'text-cyan-400'
                                                : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-4 py-2 transition-all text-left">
                                        SIGN IN
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

