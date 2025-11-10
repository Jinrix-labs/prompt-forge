'use client';

import { useEffect, useState } from 'react';
import { Copy, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProGate } from '@/components/ProGate';

type SavedPrompt = {
    id: number;
    prompt: string;
    timestamp?: number;
    platform?: string;
    contentType?: string;
};

export default function SavedPromptsPage() {
    const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('zunno_prompts');
        if (stored) setPrompts(JSON.parse(stored));
    }, []);

    const deletePrompt = (id: number) => {
        const updated = prompts.filter(p => p.id !== id);
        setPrompts(updated);
        localStorage.setItem('zunno_prompts', JSON.stringify(updated));
    };

    const copyPrompt = async (text: string, id: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                <ProGate feature="Saved Prompts">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/"
                            className="p-2 border-2 border-gray-700 hover:border-cyan-500 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-white">📂 SAVED PROMPTS</h1>
                            <p className="text-gray-400">Manage your saved prompts</p>
                        </div>
                    </div>

                    {prompts.length === 0 ? (
                    <div className="border-2 border-gray-800 bg-gray-900/50 p-16 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-500 text-lg">No prompts saved yet.</p>
                        <p className="text-gray-600 text-sm mt-2">Generate some prompts and save your favorites!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {prompts.map(({ id, prompt, platform, contentType, timestamp }) => (
                            <div
                                key={id}
                                className="border-2 border-fuchsia-500/30 bg-gray-900/50 backdrop-blur hover:border-fuchsia-500 transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex gap-2 mb-2">
                                                {platform && (
                                                    <span className="text-xs font-bold px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700">
                                                        {platform.toUpperCase()}
                                                    </span>
                                                )}
                                                {contentType && (
                                                    <span className={`text-xs font-bold px-2 py-1 border ${contentType === 'image'
                                                        ? 'bg-cyan-500/20 text-cyan-500 border-cyan-500'
                                                        : 'bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500'
                                                        }`}>
                                                        {contentType.toUpperCase()}
                                                    </span>
                                                )}
                                                {timestamp && (
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(timestamp).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyPrompt(prompt, id)}
                                                className="px-4 py-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                            >
                                                {copiedId === id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-current rounded-full animate-spin"></div>
                                                        COPIED
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        COPY
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => deletePrompt(id)}
                                                className="p-2 border-2 border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-xs font-bold text-fuchsia-500 mb-2 tracking-wider">↳ SAVED PROMPT</div>
                                    <div className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed">
                                        {prompt}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </ProGate>
            </div>
        </div>
    );
}
