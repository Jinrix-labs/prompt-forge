'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, Copy, Check, Loader2, Star, Trash2, Image, Video, Sparkles, Film } from 'lucide-react';

export default function PromptGenerator() {
    const [userInput, setUserInput] = useState('');
    const [contentType, setContentType] = useState('image');
    const [platform, setPlatform] = useState('leonardo');
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('generate');
    const [creativeMode, setCreativeMode] = useState(false);

    // UGC specific state
    const [ugcBrand, setUgcBrand] = useState('');
    const [ugcCategory, setUgcCategory] = useState('skincare');
    const [ugcCreator, setUgcCreator] = useState('female-20s');
    const [ugcLength, setUgcLength] = useState('15');
    const [ugcPlatform, setUgcPlatform] = useState('tiktok');
    const [ugcMessage, setUgcMessage] = useState('');
    const [ugcPrompts, setUgcPrompts] = useState([]);
    const [productImage, setProductImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [usageInfo, setUsageInfo] = useState({ regular: null, ugc: null });

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('zunno-favorites');
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
    }, []);

    // Save favorites to localStorage whenever favorites change
    useEffect(() => {
        try {
            localStorage.setItem('zunno-favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    }, [favorites]);

    const platforms = useMemo(() => ({
        image: [
            { value: 'leonardo', label: 'Leonardo', color: 'from-purple-500 to-pink-500', strict: true },
            { value: 'midjourney', label: 'Midjourney', color: 'from-blue-500 to-cyan-500', strict: false },
            { value: 'stable-diffusion', label: 'Stable Diff', color: 'from-green-500 to-emerald-500', strict: false },
            { value: 'dalle3', label: 'DALL-E 3', color: 'from-orange-500 to-red-500', strict: true },
            { value: 'flux', label: 'Flux', color: 'from-violet-500 to-purple-500', strict: false },
        ],
        video: [
            { value: 'sora2', label: 'Sora 2', color: 'from-blue-500 to-indigo-500', strict: false },
            { value: 'runway', label: 'Runway', color: 'from-green-500 to-teal-500', strict: false },
            { value: 'pika', label: 'Pika Labs', color: 'from-pink-500 to-rose-500', strict: false },
        ]
    }), []);

    const productCategories = useMemo(() => [
        { value: 'skincare', label: 'Skincare/Beauty' },
        { value: 'food', label: 'Food/Beverage' },
        { value: 'tech', label: 'Tech/Gadgets' },
        { value: 'fashion', label: 'Fashion/Apparel' },
        { value: 'fitness', label: 'Fitness/Wellness' },
        { value: 'saas', label: 'SaaS/Digital' },
    ], []);

    const creatorDemos = useMemo(() => [
        { value: 'female-20s', label: 'Female 20s' },
        { value: 'male-20s', label: 'Male 20s' },
        { value: 'female-30s', label: 'Female 30s' },
        { value: 'male-30s', label: 'Male 30s' },
        { value: 'diverse', label: 'Diverse/Any' },
    ], []);

    const generatePrompts = useCallback(async () => {
        if (!userInput.trim()) return;

        setLoading(true);
        setPrompts([]);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userInput, contentType, platform, creativeMode })
            });

            // Capture rate limit headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');
            const used = response.headers.get('X-RateLimit-Used');

            if (remaining && limit) {
                setUsageInfo(prev => ({
                    ...prev,
                    regular: { remaining: parseInt(remaining), limit: parseInt(limit), used: used ? parseInt(used) : undefined }
                }));
            }

            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || "Daily limit reached. Try again tomorrow or upgrade to Pro!");
                return;
            }

            if (response.status === 400) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.code === 'CONTENT_POLICY_VIOLATION') {
                    alert("🚫 " + errorData.error + "\n\nTry rephrasing your prompt with more appropriate language.");
                    return;
                }
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('Generate API error:', errorText || response.statusText);
                alert((() => {
                    try {
                        const parsed = JSON.parse(errorText);
                        return parsed?.error || parsed?.message || 'Failed to generate prompts';
                    } catch (_) {
                        return errorText || 'Failed to generate prompts';
                    }
                })());
                return;
            }

            const data = await response.json();
            setPrompts(data.prompts);
        } catch (error) {
            console.error("Error generating prompts:", error);
            alert("Failed to generate prompts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [userInput, contentType, platform, creativeMode]);

    const handleImageUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be less than 5MB");
                return;
            }
            setProductImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const removeImage = useCallback(() => {
        setProductImage(null);
        setImagePreview(null);
    }, []);

    const generateUGCPrompts = useCallback(async () => {
        if (!ugcBrand.trim()) {
            alert("Please enter a product/brand name");
            return;
        }

        setLoading(true);
        setUgcPrompts([]);

        try {
            let imageBase64 = null;

            // Convert image to base64 if uploaded
            if (productImage) {
                imageBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result.split(",")[1];
                        resolve(base64);
                    };
                    reader.onerror = () => reject(new Error("Failed to read image"));
                    reader.readAsDataURL(productImage);
                });
            }

            const response = await fetch("/api/generate-ugc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    brand: ugcBrand,
                    category: ugcCategory,
                    creator: ugcCreator,
                    length: ugcLength,
                    platform: ugcPlatform,
                    message: ugcMessage,
                    image: imageBase64,
                    imageType: productImage?.type
                })
            });

            // Capture rate limit headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');
            const used = response.headers.get('X-RateLimit-Used');

            if (remaining && limit) {
                setUsageInfo(prev => ({
                    ...prev,
                    ugc: { remaining: parseInt(remaining), limit: parseInt(limit), used: used ? parseInt(used) : undefined }
                }));
            }

            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || "Daily UGC limit reached. Upgrade to Pro for unlimited access!");
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to generate UGC prompts');
            }

            const data = await response.json();
            setUgcPrompts(data.prompts);
        } catch (error) {
            console.error("Error generating UGC prompts:", error);
            alert("Failed to generate UGC prompts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [ugcBrand, ugcCategory, ugcCreator, ugcLength, ugcPlatform, ugcMessage, productImage]);

    const copyToClipboard = useCallback(async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    const toggleFavorite = useCallback((item) => {
        const itemWithMeta = { ...item, platform, contentType, timestamp: Date.now() };
        const isFavorited = favorites.some(fav => fav.prompt === item.prompt && fav.title === item.title);

        if (isFavorited) {
            setFavorites(favorites.filter(fav => !(fav.prompt === item.prompt && fav.title === item.title)));
        } else {
            setFavorites([...favorites, itemWithMeta]);
        }
    }, [favorites, platform, contentType]);

    const isFavorited = useCallback((item) => {
        return favorites.some(fav => fav.prompt === item.prompt && fav.title === item.title);
    }, [favorites]);

    const deleteFavorite = useCallback((item) => {
        setFavorites(favorites.filter(fav => !(fav.prompt === item.prompt && fav.title === item.title)));
    }, [favorites]);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-yellow-500 rounded-full">
                            <Zap className="w-6 h-6 text-black" fill="black" />
                            <h1 className="text-3xl font-black text-black tracking-tight">ZUNNO</h1>
                        </div>
                    </div>
                    <p className="text-gray-400 text-lg">AI-Powered Prompt Generation for Creators</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'generate'
                            ? 'border-cyan-500 text-cyan-500'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        GENERATE
                    </button>
                    <button
                        onClick={() => setActiveTab('ugc')}
                        className={`px-6 py-3 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ugc'
                            ? 'border-yellow-500 text-yellow-500'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Film className="w-4 h-4" />
                        UGC GENERATOR
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded">PRO</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-6 py-3 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'favorites'
                            ? 'border-fuchsia-500 text-fuchsia-500'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Star className="w-4 h-4" fill={favorites.length > 0 ? 'currentColor' : 'none'} />
                        SAVED ({favorites.length})
                    </button>
                </div>

                {/* UGC Generator Tab */}
                {activeTab === 'ugc' && (
                    <>
                        <div className="mb-6 p-4 border-2 border-yellow-500/30 bg-yellow-500/10">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-yellow-500 mb-1">PREMIUM UGC VIDEO PROMPTS</h3>
                                    <p className="text-sm text-gray-300">Generate professional Sora 2 prompts with timeline breakdowns, shot composition, and UGC authenticity. Perfect for brands creating TikTok/Reels content.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 border-2 border-gray-800 bg-gray-900/50 backdrop-blur">
                            <div className="p-6 space-y-6">
                                {/* Product Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">PRODUCT/BRAND NAME*</label>
                                        <input
                                            type="text"
                                            value={ugcBrand}
                                            onChange={(e) => setUgcBrand(e.target.value)}
                                            placeholder="e.g., GlowUp Serum, ProBar, TechFlow App"
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">PRODUCT CATEGORY</label>
                                        <select
                                            value={ugcCategory}
                                            onChange={(e) => setUgcCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                                        >
                                            {productCategories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Creator & Platform */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">CREATOR DEMO</label>
                                        <select
                                            value={ugcCreator}
                                            onChange={(e) => setUgcCreator(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                                        >
                                            {creatorDemos.map(demo => (
                                                <option key={demo.value} value={demo.value}>{demo.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">VIDEO LENGTH</label>
                                        <select
                                            value={ugcLength}
                                            onChange={(e) => setUgcLength(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                                        >
                                            <option value="10">10 seconds</option>
                                            <option value="15">15 seconds</option>
                                            <option value="30">30 seconds</option>
                                            <option value="60">60 seconds</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">PLATFORM</label>
                                        <select
                                            value={ugcPlatform}
                                            onChange={(e) => setUgcPlatform(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                                        >
                                            <option value="tiktok">TikTok</option>
                                            <option value="reels">Instagram Reels</option>
                                            <option value="shorts">YouTube Shorts</option>
                                            <option value="sora2">Sora 2</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Key Message */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">KEY MESSAGE / CTA (OPTIONAL)</label>
                                    <input
                                        type="text"
                                        value={ugcMessage}
                                        onChange={(e) => setUgcMessage(e.target.value)}
                                        placeholder="e.g., Shows transformation, Emphasizes natural ingredients, Call to action to swipe up"
                                        className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>

                                {/* Product Image Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">
                                        PRODUCT IMAGE (OPTIONAL)
                                    </label>
                                    {!imagePreview ? (
                                        <div className="border-2 border-dashed border-gray-700 hover:border-yellow-500 transition-colors">
                                            <label className="block p-8 text-center cursor-pointer">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                        <Image className="w-6 h-6 text-yellow-500" />
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        <span className="text-yellow-500 font-bold">Click to upload</span> product photo
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        AI will analyze your product for better prompts (JPG, PNG, max 5MB)
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative border-2 border-yellow-500 bg-black p-4">
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="max-h-48 mx-auto"
                                            />
                                            <button
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="mt-2 text-xs text-center text-yellow-500">
                                                ✓ Image uploaded - AI will analyze this product
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={generateUGCPrompts}
                                    disabled={!ugcBrand.trim() || loading}
                                    className="w-full py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black font-black text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            GENERATING UGC PROMPTS...
                                        </>
                                    ) : (
                                        <>
                                            <Film className="w-6 h-6" />
                                            GENERATE UGC PROMPTS
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* UGC Results */}
                        {ugcPrompts.length > 0 && (
                            <div className="space-y-4">
                                {ugcPrompts.map((item, index) => (
                                    <div key={index} className="border-2 border-yellow-500/30 bg-gray-900/50 backdrop-blur">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-xl font-bold text-yellow-500">{item.title}</h3>
                                                <button
                                                    onClick={() => copyToClipboard(item.prompt, `ugc-${index}`)}
                                                    className="px-4 py-2 border-2 border-yellow-500 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                >
                                                    {copiedIndex === `ugc-${index}` ? (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            COPIED
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4" />
                                                            COPY
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="text-xs font-bold text-yellow-500 mb-2 tracking-wider">↳ FULL SORA 2 PROMPT</div>
                                            <p className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed whitespace-pre-line mb-4">
                                                {item.prompt}
                                            </p>

                                            {item.timeline && (
                                                <>
                                                    <div className="text-xs font-bold text-cyan-500 mb-2 tracking-wider">↳ TIMELINE BREAKDOWN</div>
                                                    <div className="bg-black/50 p-4 border border-gray-800 space-y-2">
                                                        {item.timeline.map((segment, i) => (
                                                            <div key={i} className="text-sm">
                                                                <span className="text-cyan-500 font-mono font-bold">{segment.time}</span>
                                                                <span className="text-gray-400"> → </span>
                                                                <span className="text-gray-300">{segment.description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Regular Generate Tab */}
                {activeTab === 'generate' && (
                    <>
                        {/* Input Section */}
                        <div className="mb-8 border-2 border-gray-800 bg-gray-900/50 backdrop-blur">
                            <div className="p-6 space-y-6">
                                {/* Content Type Toggle */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setContentType('image');
                                            setPlatform(platforms.image[0].value);
                                        }}
                                        className={`flex-1 py-4 font-bold border-2 transition-all flex items-center justify-center gap-2 ${contentType === 'image'
                                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-500'
                                            : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                            }`}
                                    >
                                        <Image className="w-5 h-5" />
                                        IMAGE
                                    </button>
                                    <button
                                        onClick={() => {
                                            setContentType('video');
                                            setPlatform(platforms.video[0].value);
                                        }}
                                        className={`flex-1 py-4 font-bold border-2 transition-all flex items-center justify-center gap-2 ${contentType === 'video'
                                            ? 'border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500'
                                            : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                            }`}
                                    >
                                        <Video className="w-5 h-5" />
                                        VIDEO
                                    </button>
                                </div>

                                {/* Platform Pills */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-xs font-bold text-gray-500 tracking-wider">SELECT PLATFORM</label>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${creativeMode ? 'text-gray-600' : 'text-cyan-500'}`}>
                                                SAFE
                                            </span>
                                            <button
                                                onClick={() => setCreativeMode(!creativeMode)}
                                                className={`relative w-14 h-7 rounded-full transition-colors ${creativeMode ? 'bg-fuchsia-500' : 'bg-gray-700'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${creativeMode ? 'translate-x-8' : 'translate-x-1'
                                                    }`}></div>
                                            </button>
                                            <span className={`text-xs font-bold ${creativeMode ? 'text-fuchsia-500' : 'text-gray-600'}`}>
                                                CREATIVE
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {platforms[contentType].map(p => (
                                            <button
                                                key={p.value}
                                                onClick={() => {
                                                    setPlatform(p.value);
                                                    if (p.strict) {
                                                        setCreativeMode(false);
                                                    } else if (!p.strict) {
                                                        setCreativeMode(true);
                                                    }
                                                }}
                                                className={`px-4 py-2 font-bold text-sm border-2 transition-all ${platform === p.value
                                                    ? `border-transparent bg-gradient-to-r ${p.color} text-black`
                                                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className={`mt-2 p-2 border text-xs ${creativeMode
                                        ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300'
                                        : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                                        }`}>
                                        {creativeMode
                                            ? '🎨 Creative mode: More expressive prompts. Best for Midjourney, Flux.'
                                            : '🛡️ Safe mode: Filter-friendly prompts. Best for Leonardo, DALL-E.'}
                                    </div>
                                </div>

                                {/* Input */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-3 tracking-wider">YOUR IDEA</label>
                                    <textarea
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="cyberpunk city at night, neon reflections..."
                                        className="w-full px-4 py-4 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none resize-none font-mono"
                                        rows={3}
                                    />
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={generatePrompts}
                                    disabled={!userInput.trim() || loading}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-yellow-500 text-black font-black text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            GENERATING...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-6 h-6" />
                                            FORGE PROMPTS
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        {prompts.length > 0 && (
                            <div className="grid gap-4">
                                {prompts.map((item, index) => (
                                    <div key={index} className="border-2 border-gray-800 bg-gray-900/50 backdrop-blur hover:border-cyan-500/50 transition-all">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                                    <div className="flex gap-2">
                                                        <span className="text-xs font-bold px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700">
                                                            {platform.toUpperCase()}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-1 border ${contentType === 'image'
                                                            ? 'bg-cyan-500/20 text-cyan-500 border-cyan-500'
                                                            : 'bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500'
                                                            }`}>
                                                            {contentType.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleFavorite(item)}
                                                        className={`p-2 border-2 transition-all ${isFavorited(item)
                                                            ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500'
                                                            : 'border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-500'
                                                            }`}
                                                    >
                                                        <Star className="w-5 h-5" fill={isFavorited(item) ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(item.prompt, `prompt-${index}`)}
                                                        className="px-4 py-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                    >
                                                        {copiedIndex === `prompt-${index}` ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                COPIED
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                COPY
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="text-xs font-bold text-cyan-500 mb-2 tracking-wider">↳ PROMPT</div>
                                                <p className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed">
                                                    {item.prompt}
                                                </p>
                                            </div>

                                            {contentType === 'image' && item.negative && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-xs font-bold text-red-500 tracking-wider">↳ NEGATIVE</div>
                                                        <button
                                                            onClick={() => copyToClipboard(item.negative, `negative-${index}`)}
                                                            className="px-3 py-1 border border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black text-xs font-bold transition-all flex items-center gap-1"
                                                        >
                                                            {copiedIndex === `negative-${index}` ? (
                                                                <>
                                                                    <Check className="w-3 h-3" />
                                                                    COPIED
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    COPY
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-400 bg-red-950/30 p-4 border border-red-900/50 font-mono text-sm">
                                                        {item.negative}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Favorites Tab */}
                {activeTab === 'favorites' && (
                    <div>
                        {favorites.length === 0 ? (
                            <div className="border-2 border-gray-800 bg-gray-900/50 p-16 text-center">
                                <Star className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                <p className="text-gray-500 text-lg">No saved prompts yet.</p>
                                <p className="text-gray-600 text-sm mt-2">Generate some prompts and star your favorites!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {favorites.map((item, index) => (
                                    <div key={index} className="border-2 border-yellow-500/30 bg-gray-900/50 backdrop-blur hover:border-yellow-500 transition-all">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                                    <div className="flex gap-2">
                                                        <span className="text-xs font-bold px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700">
                                                            {item.platform.toUpperCase()}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-1 border ${item.contentType === 'image'
                                                            ? 'bg-cyan-500/20 text-cyan-500 border-cyan-500'
                                                            : 'bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500'
                                                            }`}>
                                                            {item.contentType.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(item.prompt, `fav-prompt-${index}`)}
                                                        className="px-4 py-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                    >
                                                        {copiedIndex === `fav-prompt-${index}` ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
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
                                                        onClick={() => deleteFavorite(item)}
                                                        className="p-2 border-2 border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="text-xs font-bold text-cyan-500 mb-2 tracking-wider">↳ PROMPT</div>
                                                <p className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed">
                                                    {item.prompt}
                                                </p>
                                            </div>

                                            {item.contentType === 'image' && item.negative && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-xs font-bold text-red-500 tracking-wider">↳ NEGATIVE</div>
                                                        <button
                                                            onClick={() => copyToClipboard(item.negative, `fav-negative-${index}`)}
                                                            className="px-3 py-1 border border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black text-xs font-bold transition-all flex items-center gap-1"
                                                        >
                                                            {copiedIndex === `fav-negative-${index}` ? (
                                                                <>
                                                                    <Check className="w-3 h-3" />
                                                                    COPIED
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    COPY
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-400 bg-red-950/30 p-4 border border-red-900/50 font-mono text-sm">
                                                        {item.negative}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}