'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, Copy, Check, Loader2, Star, Trash2, Image as ImageIcon, Video, Sparkles, Film, Wrench } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UsageDisplay } from "@/components/UsageDisplay";
import { ProGate } from "@/components/ProGate";
import { UpgradeButton } from "@/components/UpgradeButton";

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
    const [outputFormat, setOutputFormat] = useState('text'); // 'text' or 'json'

    // Playground specific state
    const [playgroundScene, setPlaygroundScene] = useState('');
    const [playgroundStyle, setPlaygroundStyle] = useState('');
    const [playgroundCamera, setPlaygroundCamera] = useState('');
    const [playgroundMood, setPlaygroundMood] = useState('');
    const [playgroundResult, setPlaygroundResult] = useState('');
    const [playgroundCopied, setPlaygroundCopied] = useState(false);
    const [playgroundRefining, setPlaygroundRefining] = useState(false);
    const [refiningIndex, setRefiningIndex] = useState(null);
    const [savedPromptId, setSavedPromptId] = useState(null);

    // Playground presets for shuffle
    const playgroundPresets = useMemo(() => ({
        scene: [
            "K-pop idol walking through neon-lit alley",
            "Anime girl at a cozy café",
            "Idol rehearsing in a studio",
            "K-pop group performing on rooftop",
            "Solo artist in a vintage record store",
            "Idol dancing in a rain-soaked street",
            "K-pop star at a high-end fashion show",
            "Group practicing choreography in mirror room"
        ],
        style: [
            "dreamcore", "cinematic", "studio ghibli", "90s aesthetic",
            "cyberpunk", "vaporwave", "korean street fashion", "retro-futuristic",
            "soft grunge", "kawaii", "dark academia", "y2k aesthetic"
        ],
        camera: [
            "wide shot", "over-the-shoulder", "dolly zoom", "low angle",
            "close-up", "bird's eye view", "tracking shot", "dutch angle",
            "panning shot", "tilt shot", "handheld", "crane shot"
        ],
        mood: [
            "mysterious", "nostalgic", "melancholy", "energetic",
            "dreamy", "intense", "playful", "dramatic",
            "romantic", "rebellious", "hopeful", "moody"
        ]
    }), []);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [usageInfo, setUsageInfo] = useState({ regular: null, ugc: null });

    // New UGC AI state
    const [ugcScript, setUgcScript] = useState('');
    const [ugcTimeline, setUgcTimeline] = useState([]);
    const [ugcPromptIdeas, setUgcPromptIdeas] = useState(null);
    const [ugcAILoading, setUgcAILoading] = useState(false);

    // Enhanced UGC fields
    const [ugcHeroMessage, setUgcHeroMessage] = useState('');
    const [ugcCTA, setUgcCTA] = useState('');
    const [ugcTone, setUgcTone] = useState('friendly');
    const [suggesting, setSuggesting] = useState(false);

    // Advanced Fields state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [promptAdherence, setPromptAdherence] = useState('');
    const [promptStyle, setPromptStyle] = useState('');
    const [sceneIntent, setSceneIntent] = useState('');
    const [narrationStyle, setNarrationStyle] = useState('');

    // User authentication state
    const [user, setUser] = useState({
        isPro: false, // This will be set based on actual auth logic
        email: null,
        subscription: null
    });

    // Upgrade modal state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [rateLimited, setRateLimited] = useState(null);

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
                body: JSON.stringify({ userInput, contentType, platform, creativeMode, outputFormat })
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

            // Not signed in
            if (response.status === 401) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData?.error || "Please sign in to generate prompts.";
                alert("🔐 " + msg);
                return;
            }

            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                setRateLimited({ scope: 'regular', error: errorData });

                // Friendlier explanation for free users hitting the limit
                const baseMsg = errorData?.error ||
                    "You've hit your free prompt limit for today.";
                const upgradeHint = errorData?.upgrade
                    ? "\n\nUpgrade to Pro for higher or unlimited usage."
                    : "";
                alert("⏳ " + baseMsg + upgradeHint);
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
            // Handle response - both text and variations formats now return prompts array
            if (data.prompts && Array.isArray(data.prompts)) {
                // Both text and variations formats return prompts array
                setPrompts(data.prompts);
            } else if (data.prompt) {
                // Fallback for old single prompt format (shouldn't happen with new backend)
                setPrompts([{ title: 'Generated Prompt', prompt: data.prompt, negative: data.negative || '' }]);
            } else {
                console.error('Unexpected response format:', data);
                alert('Unexpected response format from server');
            }
        } catch (error) {
            console.error("Error generating prompts:", error);
            alert("Failed to generate prompts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [userInput, contentType, platform, creativeMode, outputFormat]);

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
                setRateLimited({ scope: 'ugc', error: errorData });
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

    // New UGC AI generation function
    const generateUGCWithAI = useCallback(async () => {
        if (!ugcBrand.trim()) {
            alert("Please enter a product/brand name");
            return;
        }

        setUgcAILoading(true);
        setUgcScript('');
        setUgcTimeline([]);
        setUgcPromptIdeas(null);

        try {
            const response = await fetch("/api/ugc-gen", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productName: ugcBrand,
                    productCategory: ugcCategory,
                    creatorDemo: ugcCreator,
                    videoLength: ugcLength,
                    platform: ugcPlatform,
                    ctaMessage: ugcMessage,
                    heroMessage: ugcHeroMessage,
                    cta: ugcCTA,
                    tone: ugcTone,
                    style: 'authentic and engaging',
                    // Advanced fields (only send if user is Pro)
                    ...(user.isPro && {
                        promptAdherence,
                        promptStyle,
                        sceneIntent,
                        narrationStyle
                    })
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate UGC content');
            }

            const data = await response.json();

            if (data.success && data.result) {
                if (data.raw) {
                    // If it's raw text, just set as script
                    setUgcScript(data.result);
                } else {
                    // If it's parsed JSON
                    setUgcScript(data.result.script || '');
                    setUgcTimeline(data.result.timeline || []);
                    setUgcPromptIdeas(data.result.promptIdeas || null);
                }
            } else {
                throw new Error(data.error || 'Failed to generate UGC content');
            }
        } catch (error) {
            console.error("Error generating UGC with AI:", error);
            alert("Failed to generate UGC content. Please try again.");
        } finally {
            setUgcAILoading(false);
        }
    }, [ugcBrand, ugcCategory, ugcCreator, ugcLength, ugcPlatform, ugcMessage, ugcHeroMessage, ugcCTA, ugcTone, narrationStyle, promptAdherence, promptStyle, sceneIntent, user.isPro]);

    // Suggestion function for auto-filling fields (using UGC API)
    const suggestContent = useCallback(async (type) => {
        if (!ugcBrand.trim()) {
            alert("Please enter a product/brand name first");
            return;
        }

        setSuggesting(true);

        try {
            console.log('Sending suggestion request:', { type, ugcBrand, ugcCategory, ugcPlatform });

            const response = await fetch("/api/ugc-gen", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productName: ugcBrand,
                    productCategory: ugcCategory,
                    creatorDemo: ugcCreator,
                    videoLength: ugcLength,
                    platform: ugcPlatform,
                    ctaMessage: '',
                    heroMessage: type === 'hero' ? 'SUGGEST_HERO' : '',
                    cta: type === 'cta' ? 'SUGGEST_CTA' : '',
                    tone: ugcTone,
                    style: 'suggestion only'
                })
            });

            console.log('Suggestion response status:', response.status);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Suggestion response data:', data);

            if (data.success && data.result) {
                if (type === 'hero') {
                    // For suggestions, the result is the direct text
                    setUgcHeroMessage(data.result);
                } else {
                    // For CTA suggestions, the result is the direct text
                    setUgcCTA(data.result);
                }
            } else {
                throw new Error('No suggestion data received');
            }
        } catch (error) {
            console.error("Error getting suggestion:", error);
            // Fallback to simple suggestions
            if (type === 'hero') {
                const fallbackHero = `${ugcBrand} delivers amazing results for ${ugcCategory} lovers`;
                setUgcHeroMessage(fallbackHero);
            } else {
                const fallbackCTA = `Try ${ugcBrand} today – link in bio!`;
                setUgcCTA(fallbackCTA);
            }
        } finally {
            setSuggesting(false);
        }
    }, [ugcBrand, ugcCategory, ugcCreator, ugcLength, ugcPlatform, ugcTone]);

    const copyToClipboard = useCallback(async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    // Copy all UGC results in one go
    const copyAllUGCResults = useCallback(async () => {
        try {
            let allContent = '';

            if (ugcScript) {
                allContent += '🎬 AI-GENERATED SCRIPT\n';
                allContent += '='.repeat(50) + '\n';
                allContent += ugcScript + '\n\n';
            }

            if (ugcTimeline.length > 0) {
                allContent += '⏱️ TIMELINE BREAKDOWN\n';
                allContent += '='.repeat(50) + '\n';
                ugcTimeline.forEach(segment => {
                    allContent += `${segment.time}: ${segment.action} (${segment.camera})\n`;
                });
                allContent += '\n';
            }

            if (ugcPromptIdeas) {
                allContent += '🎨 AI PROMPT IDEAS\n';
                allContent += '='.repeat(50) + '\n';
                if (ugcPromptIdeas.image) {
                    allContent += 'IMAGE PROMPT:\n';
                    allContent += ugcPromptIdeas.image + '\n\n';
                }
                if (ugcPromptIdeas.video) {
                    allContent += 'VIDEO PROMPT:\n';
                    allContent += ugcPromptIdeas.video + '\n\n';
                }
            }

            await navigator.clipboard.writeText(allContent);
            setCopiedIndex('ugc-all');
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy all UGC results: ', err);
        }
    }, [ugcScript, ugcTimeline, ugcPromptIdeas]);

    const toggleFavorite = useCallback(async (item) => {
        // Check if user is Pro
        try {
            const proCheck = await fetch('/api/check-pro');
            const { isPro } = await proCheck.json();

            if (!isPro) {
                alert('Upgrade to Pro to save favorites!');
                return;
            }
        } catch (error) {
            console.error('Failed to check pro status:', error);
            alert('Unable to verify Pro status. Please try again.');
            return;
        }

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

    // const deleteFavorite = useCallback((item) => {
    //     setFavorites(favorites.filter(fav => !(fav.prompt === item.prompt && fav.title === item.title)));
    // }, [favorites]);

    // Playground functions
    const generatePlaygroundPrompt = useCallback(() => {
        const prompt = `${playgroundScene}, styled in ${playgroundStyle}, with a ${playgroundCamera} angle, evoking a ${playgroundMood} mood.`;
        setPlaygroundResult(prompt);
    }, [playgroundScene, playgroundStyle, playgroundCamera, playgroundMood]);

    const copyPlaygroundToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(playgroundResult);
            setPlaygroundCopied(true);
            setTimeout(() => setPlaygroundCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [playgroundResult]);

    // Shuffle function for random inspiration
    const shufflePlayground = useCallback(() => {
        const randomScene = playgroundPresets.scene[Math.floor(Math.random() * playgroundPresets.scene.length)];
        const randomStyle = playgroundPresets.style[Math.floor(Math.random() * playgroundPresets.style.length)];
        const randomCamera = playgroundPresets.camera[Math.floor(Math.random() * playgroundPresets.camera.length)];
        const randomMood = playgroundPresets.mood[Math.floor(Math.random() * playgroundPresets.mood.length)];

        setPlaygroundScene(randomScene);
        setPlaygroundStyle(randomStyle);
        setPlaygroundCamera(randomCamera);
        setPlaygroundMood(randomMood);
    }, [playgroundPresets]);

    // Shuffle function for main input
    const shuffleMainInput = useCallback(() => {
        const randomScene = playgroundPresets.scene[Math.floor(Math.random() * playgroundPresets.scene.length)];
        const randomStyle = playgroundPresets.style[Math.floor(Math.random() * playgroundPresets.style.length)];
        const randomCamera = playgroundPresets.camera[Math.floor(Math.random() * playgroundPresets.camera.length)];
        const randomMood = playgroundPresets.mood[Math.floor(Math.random() * playgroundPresets.mood.length)];

        const combinedPrompt = `${randomScene}, styled in ${randomStyle}, with a ${randomCamera} angle, evoking a ${randomMood} mood.`;
        setUserInput(combinedPrompt);
    }, [playgroundPresets]);

    // AI refinement function
    const refinePlaygroundPrompt = useCallback(async (refinementType) => {
        if (!playgroundResult) return;

        setPlaygroundRefining(true);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userInput: `Refine this prompt to be ${refinementType}: "${playgroundResult}"`,
                    contentType: 'image',
                    platform: 'leonardo',
                    creativeMode: false
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refine prompt');
            }

            const data = await response.json();
            if (data.prompts && data.prompts.length > 0) {
                setPlaygroundResult(data.prompts[0].prompt);
            }
        } catch (error) {
            console.error("Error refining prompt:", error);
            alert("Failed to refine prompt. Please try again.");
        } finally {
            setPlaygroundRefining(false);
        }
    }, [playgroundResult]);

    // AI refinement function for main results
    const refineMainPrompt = useCallback(async (refinementType, promptIndex) => {
        if (!prompts[promptIndex]) return;

        setRefiningIndex(promptIndex);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userInput: `Refine this prompt to be ${refinementType}: "${prompts[promptIndex].prompt}"`,
                    contentType,
                    platform,
                    creativeMode
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refine prompt');
            }

            const data = await response.json();
            if (data.prompts && data.prompts.length > 0) {
                // Update the specific prompt in the array
                setPrompts(prev => prev.map((item, index) =>
                    index === promptIndex
                        ? { ...item, prompt: data.prompts[0].prompt }
                        : item
                ));
            }
        } catch (error) {
            console.error("Error refining prompt:", error);
            alert("Failed to refine prompt. Please try again.");
        } finally {
            setRefiningIndex(null);
        }
    }, [prompts, contentType, platform, creativeMode]);

    // Save prompt function
    const savePrompt = useCallback(async (prompt, platform = null, contentType = null) => {
        // Check if user is Pro
        try {
            const proCheck = await fetch('/api/check-pro');
            const { isPro } = await proCheck.json();

            if (!isPro) {
                alert('Upgrade to Pro to save prompts!');
                return;
            }
        } catch (error) {
            console.error('Failed to check pro status:', error);
            alert('Unable to verify Pro status. Please try again.');
            return;
        }

        const stored = JSON.parse(localStorage.getItem('zunno_prompts') || '[]');
        const newPrompt = {
            id: Date.now(),
            prompt,
            platform: platform || 'unknown',
            contentType: contentType || 'unknown',
            timestamp: Date.now()
        };
        const updated = [newPrompt, ...stored];
        localStorage.setItem('zunno_prompts', JSON.stringify(updated));
        setSavedPromptId(newPrompt.id);
        setTimeout(() => setSavedPromptId(null), 3000);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                {/* Auth Header */}
                <div className="flex justify-end mb-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded transition-colors">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>

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

                {/* Usage Display (auth only) */}
                <SignedIn>
                    <div className="mb-8">
                        <UsageDisplay />
                    </div>
                </SignedIn>

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
                        onClick={() => setActiveTab('playground')}
                        className={`px-6 py-3 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'playground'
                            ? 'border-green-500 text-green-500'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Wrench className="w-4 h-4" />
                        PLAYGROUND
                    </button>
                    <a
                        href="/saved"
                        className="px-6 py-3 font-bold transition-all border-b-2 flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-300 hover:border-fuchsia-500"
                    >
                        <Star className="w-4 h-4" />
                        SAVED PROMPTS
                    </a>
                </div>

                {/* Upgrade CTA when rate limited */}
                {rateLimited && (
                    <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="font-bold text-yellow-400">You&apos;re out of {rateLimited.scope === 'ugc' ? 'UGC' : 'regular'} prompts</div>
                                <div className="text-sm text-gray-300">Upgrade to Pro to keep going without interruptions.</div>
                            </div>
                            <UpgradeButton />
                        </div>
                    </div>
                )}

                {/* UGC Generator Tab */}
                {activeTab === 'ugc' && (
                    <ProGate feature="UGC Generator">
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

                                    {/* Enhanced UGC Fields */}
                                    <div className="space-y-4">
                                        {/* Hero Message */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">HERO MESSAGE (What&apos;s the main benefit?)</label>
                                            <input
                                                type="text"
                                                value={ugcHeroMessage}
                                                onChange={(e) => setUgcHeroMessage(e.target.value)}
                                                placeholder="Hydrates all day without feeling greasy"
                                                className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                                            />
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-gray-400">
                                                    Ex: &quot;Lasts 12 hours&quot;, &quot;Eco-friendly&quot;, &quot;100% natural&quot;, etc.
                                                </p>
                                                <button
                                                    onClick={() => suggestContent('hero')}
                                                    disabled={suggesting}
                                                    className="text-xs text-cyan-400 underline hover:text-cyan-300 disabled:opacity-50"
                                                >
                                                    {suggesting ? "..." : "Need ideas? Tap to auto-fill!"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Call-to-Action */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">CALL TO ACTION (What should the viewer do?)</label>
                                            <input
                                                type="text"
                                                value={ugcCTA}
                                                onChange={(e) => setUgcCTA(e.target.value)}
                                                placeholder="Shop now – link in bio!"
                                                className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                                            />
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-gray-400">
                                                    Ex: &quot;Try for free&quot;, &quot;Limited time offer&quot;, &quot;Get yours today!&quot;
                                                </p>
                                                <button
                                                    onClick={() => suggestContent('cta')}
                                                    disabled={suggesting}
                                                    className="text-xs text-cyan-400 underline hover:text-cyan-300 disabled:opacity-50"
                                                >
                                                    {suggesting ? "..." : "Need ideas? Tap to auto-fill!"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Legacy Key Message (Optional) */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">ADDITIONAL MESSAGE (OPTIONAL)</label>
                                            <input
                                                type="text"
                                                value={ugcMessage}
                                                onChange={(e) => setUgcMessage(e.target.value)}
                                                placeholder="e.g., Shows transformation, Emphasizes natural ingredients"
                                                className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                                            />
                                        </div>

                                        {/* Tone/Vibe */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">TONE & VIBE</label>
                                            <select
                                                value={ugcTone}
                                                onChange={(e) => setUgcTone(e.target.value)}
                                                className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                                            >
                                                <option value="friendly">Friendly & Bubbly</option>
                                                <option value="professional">Professional & Trustworthy</option>
                                                <option value="energetic">Energetic & Exciting</option>
                                                <option value="calm">Calm & Relaxing</option>
                                                <option value="dramatic">Dramatic & Intense</option>
                                                <option value="playful">Playful & Fun</option>
                                                <option value="authentic">Authentic & Genuine</option>
                                            </select>
                                        </div>
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
                                                            <ImageIcon className="w-6 h-6 text-yellow-500" />
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
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
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

                                    {/* Advanced Fields Toggle */}
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                        >
                                            {showAdvanced ? "Hide Advanced Fields" : "Show Advanced Fields (Pro)"}
                                        </button>
                                    </div>

                                    {/* Advanced Fields Section */}
                                    {showAdvanced && (
                                        <ProGate feature="advanced UGC prompt customization">
                                            {/* Advanced Fields Content */}
                                            <div className="mt-4 grid gap-4 border-t border-gray-700 pt-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">PROMPT ADHERENCE (1-10)</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={promptAdherence}
                                                        onChange={(e) => setPromptAdherence(e.target.value)}
                                                        placeholder="1-10"
                                                        className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <p className="text-sm text-gray-500 italic mt-1">
                                                        🎯 Higher numbers = stricter adherence to your style choices (10 = exact match, 1 = loose inspiration)
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">PROMPT STYLE</label>
                                                    <select
                                                        value={promptStyle}
                                                        onChange={(e) => setPromptStyle(e.target.value)}
                                                        className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">Select style...</option>
                                                        <option value="cinematic">Cinematic</option>
                                                        <option value="studio">Studio</option>
                                                        <option value="selfie">Selfie</option>
                                                        <option value="before-after">Before/After</option>
                                                    </select>
                                                    <p className="text-sm text-gray-500 italic mt-1">
                                                        🎯 Use Prompt Style to shape how your video feels — &quot;Cinematic&quot; = smooth panning, &quot;Selfie&quot; = raw + authentic
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">SCENE INTENT</label>
                                                    <input
                                                        type="text"
                                                        value={sceneIntent}
                                                        onChange={(e) => setSceneIntent(e.target.value)}
                                                        placeholder="e.g., Transformation, Lifestyle Demo, Reaction"
                                                        disabled={!user.isPro}
                                                        className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <p className="text-sm text-gray-500 italic mt-1">
                                                        💡 What&apos;s the main goal? &quot;Transformation&quot; = before/after shots, &quot;Reaction&quot; = genuine surprise moments
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">NARRATION STYLE</label>
                                                    <textarea
                                                        value={narrationStyle}
                                                        onChange={(e) => setNarrationStyle(e.target.value)}
                                                        placeholder="Casual, Witty, Dramatic"
                                                        rows="2"
                                                        disabled={!user.isPro}
                                                        className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <p className="text-sm text-gray-500 italic mt-1">
                                                        🗣️ Match your brand voice — &quot;Witty&quot; = clever one-liners, &quot;Dramatic&quot; = emotional storytelling
                                                    </p>
                                                </div>
                                            </div>
                                        </ProGate>
                                    )}

                                    {/* Safety Notice */}
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded">
                                        <div className="flex items-start gap-2">
                                            <div className="text-yellow-500 text-sm">⚠️</div>
                                            <div className="text-xs text-yellow-300">
                                                <strong>Safety Notice:</strong> Generated content avoids celebrity names and public figures to prevent platform violations. All content focuses on authentic everyday people.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Generate Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={generateUGCWithAI}
                                            disabled={!ugcBrand.trim() || ugcAILoading}
                                            className="flex-1 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-black text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {ugcAILoading ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    AI GENERATING...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-6 h-6" />
                                                    AI SCRIPT & TIMELINE
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={generateUGCPrompts}
                                            disabled={!ugcBrand.trim() || loading}
                                            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black font-black text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    GENERATING...
                                                </>
                                            ) : (
                                                <>
                                                    <Film className="w-6 h-6" />
                                                    SORA PROMPTS
                                                </>
                                            )}
                                        </button>
                                    </div>
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

                            {/* UGC AI Results */}
                            {(ugcScript || ugcTimeline.length > 0 || ugcPromptIdeas) && (
                                <div className="space-y-4">
                                    {/* Copy All Button */}
                                    <div className="flex justify-center mb-6">
                                        <button
                                            onClick={() => copyAllUGCResults()}
                                            className="px-6 py-3 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                        >
                                            {copiedIndex === 'ugc-all' ? (
                                                <>
                                                    <Check className="w-5 h-5" />
                                                    ALL COPIED
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-5 h-5" />
                                                    COPY ALL UGC RESULTS
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {/* Script */}
                                    {ugcScript && (
                                        <div className="border-2 border-purple-500/30 bg-gray-900/50 backdrop-blur">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-xl font-bold text-purple-500">🎬 AI-Generated Script</h3>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => savePrompt(ugcScript, ugcPlatform, 'ugc-script')}
                                                            className="px-4 py-2 border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                        >
                                                            {savedPromptId ? (
                                                                <>
                                                                    <Check className="w-4 h-4" />
                                                                    SAVED
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Star className="w-4 h-4" />
                                                                    SAVE
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => copyToClipboard(ugcScript, 'ugc-script')}
                                                            className="px-4 py-2 border-2 border-purple-500 bg-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                        >
                                                            {copiedIndex === 'ugc-script' ? (
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
                                                <div className="text-xs font-bold text-purple-500 mb-2 tracking-wider">↳ FULL SCRIPT</div>
                                                <div className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed whitespace-pre-line">
                                                    {ugcScript}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    {ugcTimeline.length > 0 && (
                                        <div className="border-2 border-cyan-500/30 bg-gray-900/50 backdrop-blur">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-xl font-bold text-cyan-500">⏱️ Timeline Breakdown</h3>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => savePrompt(JSON.stringify(ugcTimeline, null, 2), ugcPlatform, 'ugc-timeline')}
                                                            className="px-4 py-2 border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                        >
                                                            {savedPromptId ? (
                                                                <>
                                                                    <Check className="w-4 h-4" />
                                                                    SAVED
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Star className="w-4 h-4" />
                                                                    SAVE
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => copyToClipboard(JSON.stringify(ugcTimeline, null, 2), 'ugc-timeline')}
                                                            className="px-4 py-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                        >
                                                            {copiedIndex === 'ugc-timeline' ? (
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
                                                <div className="bg-black/50 p-4 border border-gray-800 space-y-3">
                                                    {ugcTimeline.map((segment, i) => (
                                                        <div key={i} className="flex items-start gap-3">
                                                            <span className="text-cyan-500 font-mono font-bold text-sm min-w-[60px]">{segment.time}</span>
                                                            <div className="flex-1">
                                                                <div className="text-gray-300 text-sm font-medium">{segment.action}</div>
                                                                <div className="text-gray-500 text-xs">📹 {segment.camera}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Prompt Ideas */}
                                    {ugcPromptIdeas && (
                                        <div className="border-2 border-green-500/30 bg-gray-900/50 backdrop-blur">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-xl font-bold text-green-500">🎨 AI Prompt Ideas</h3>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => savePrompt(JSON.stringify(ugcPromptIdeas, null, 2), ugcPlatform, 'ugc-prompts')}
                                                            className="px-4 py-2 border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                        >
                                                            {savedPromptId ? (
                                                                <>
                                                                    <Check className="w-4 h-4" />
                                                                    SAVED
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Star className="w-4 h-4" />
                                                                    SAVE
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => copyToClipboard(JSON.stringify(ugcPromptIdeas, null, 2), 'ugc-prompts')}
                                                            className="px-4 py-2 border-2 border-green-500 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                        >
                                                            {copiedIndex === 'ugc-prompts' ? (
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
                                                <div className="space-y-4">
                                                    {ugcPromptIdeas.image && (
                                                        <div>
                                                            <div className="text-xs font-bold text-green-500 mb-2 tracking-wider">↳ IMAGE PROMPT</div>
                                                            <div className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed">
                                                                {ugcPromptIdeas.image}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {ugcPromptIdeas.video && (
                                                        <div>
                                                            <div className="text-xs font-bold text-green-500 mb-2 tracking-wider">↳ VIDEO PROMPT</div>
                                                            <div className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed">
                                                                {ugcPromptIdeas.video}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    </ProGate>
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
                                        <ImageIcon className="w-5 h-5" />
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
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-xs font-bold text-gray-500 tracking-wider">YOUR IDEA</label>
                                        <button
                                            onClick={shuffleMainInput}
                                            className="px-3 py-1 border border-purple-500 bg-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-black text-xs font-bold transition-all flex items-center gap-1"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            SHUFFLE
                                        </button>
                                    </div>
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
                                                    <h3 className="text-xl font-bold text-white mb-2">
                                                        {item.title || `Variation ${index + 1}`}
                                                    </h3>
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
                                                        onClick={() => savePrompt(item.prompt || JSON.stringify(item, null, 2), platform, contentType)}
                                                        className="px-4 py-2 border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                    >
                                                        {savedPromptId ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                SAVED
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Star className="w-4 h-4" />
                                                                SAVE
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(item.prompt || JSON.stringify(item, null, 2), `prompt-${index}`)}
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
                                                {item.scene ? (
                                                    // Structured JSON format
                                                    <div className="space-y-3">
                                                        {Object.entries(item).map(([key, value]) => {
                                                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                                                return (
                                                                    <div key={key} className="bg-black/50 p-4 border border-gray-800 rounded">
                                                                        <div className="text-xs font-bold text-cyan-500 mb-2 tracking-wider capitalize">
                                                                            ↳ {key.replace(/_/g, ' ')}
                                                                        </div>
                                                                        <div className="space-y-1 ml-4">
                                                                            {Object.entries(value).map(([subKey, subValue]) => (
                                                                                <div key={subKey} className="text-gray-300 text-sm">
                                                                                    <span className="text-cyan-400">{subKey.replace(/_/g, ' ')}:</span>{' '}
                                                                                    {subValue}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div key={key} className="bg-black/50 p-4 border border-gray-800 rounded">
                                                                    <div className="text-xs font-bold text-cyan-500 mb-1 tracking-wider capitalize">
                                                                        ↳ {key.replace(/_/g, ' ')}
                                                                    </div>
                                                                    <div className="text-gray-300 text-sm ml-4">{value}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    // Old format (backward compatibility)
                                                    <>
                                                        <div className="text-xs font-bold text-cyan-500 mb-2 tracking-wider">↳ PROMPT</div>
                                                        <p className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed">
                                                            {item.prompt}
                                                        </p>
                                                    </>
                                                )}

                                                {/* AI Refinement Buttons */}
                                                <div className="mt-3">
                                                    <div className="text-xs font-bold text-cyan-500 mb-2 tracking-wider">↳ AI REFINEMENTS</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => refineMainPrompt("more intense and dramatic", index)}
                                                            disabled={refiningIndex === index}
                                                            className="px-3 py-1 border border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            {refiningIndex === index ? "..." : "🔥 More Intense"}
                                                        </button>
                                                        <button
                                                            onClick={() => refineMainPrompt("styled like Vogue Korea magazine", index)}
                                                            disabled={refiningIndex === index}
                                                            className="px-3 py-1 border border-pink-500 bg-pink-500/20 text-pink-500 hover:bg-pink-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            {refiningIndex === index ? "..." : "📸 Vogue Korea"}
                                                        </button>
                                                        <button
                                                            onClick={() => refineMainPrompt("more cinematic and professional", index)}
                                                            disabled={refiningIndex === index}
                                                            className="px-3 py-1 border border-purple-500 bg-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            {refiningIndex === index ? "..." : "🎬 Cinematic"}
                                                        </button>
                                                        <button
                                                            onClick={() => refineMainPrompt("more dreamy and ethereal", index)}
                                                            disabled={refiningIndex === index}
                                                            className="px-3 py-1 border border-yellow-500 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            {refiningIndex === index ? "..." : "✨ Dreamy"}
                                                        </button>
                                                    </div>
                                                </div>
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

                {/* Playground Tab */}
                {activeTab === 'playground' && (
                    <ProGate feature="Playground">
                        <>
                            <div className="mb-6 p-4 border-2 border-green-500/30 bg-green-500/10">
                                <div className="flex items-start gap-3">
                                    <Wrench className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-green-500 mb-1">PROMPT PLAYGROUND</h3>
                                        <p className="text-sm text-gray-300">Build prompts step by step. Perfect for learning prompt engineering and fine-tuning specific aspects.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Playground Input Section */}
                            <div className="mb-8 border-2 border-gray-800 bg-gray-900/50 backdrop-blur">
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">SCENE</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Idol walking in the rain"
                                            value={playgroundScene}
                                            onChange={e => setPlaygroundScene(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">STYLE</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Cinematic, Anime, Dreamcore"
                                            value={playgroundStyle}
                                            onChange={e => setPlaygroundStyle(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">CAMERA ANGLE</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Wide shot, Close-up"
                                            value={playgroundCamera}
                                            onChange={e => setPlaygroundCamera(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">MOOD</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Hopeful, Melancholic, Intense"
                                            value={playgroundMood}
                                            onChange={e => setPlaygroundMood(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-800 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={shufflePlayground}
                                            className="flex-1 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-6 h-6" />
                                            SHUFFLE
                                        </button>
                                        <button
                                            onClick={generatePlaygroundPrompt}
                                            disabled={!playgroundScene.trim() || !playgroundStyle.trim() || !playgroundCamera.trim() || !playgroundMood.trim()}
                                            className="flex-1 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-black font-black text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            <Wrench className="w-6 h-6" />
                                            GENERATE
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Playground Results */}
                            {playgroundResult && (
                                <div className="border-2 border-green-500/30 bg-gray-900/50 backdrop-blur">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-xl font-bold text-green-500">Generated Prompt</h3>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => savePrompt(playgroundResult, 'playground', 'image')}
                                                    className="px-4 py-2 border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                >
                                                    {savedPromptId ? (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            SAVED
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Star className="w-4 h-4" />
                                                            SAVE
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={copyPlaygroundToClipboard}
                                                    className="px-4 py-2 border-2 border-green-500 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-black font-bold transition-all flex items-center gap-2"
                                                >
                                                    {playgroundCopied ? (
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

                                        {/* AI Refinement Buttons */}
                                        <div className="mb-4">
                                            <div className="text-xs font-bold text-cyan-500 mb-2 tracking-wider">↳ AI REFINEMENTS</div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => refinePlaygroundPrompt("more intense and dramatic")}
                                                    disabled={playgroundRefining}
                                                    className="px-3 py-1 border border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    {playgroundRefining ? "..." : "🔥 More Intense"}
                                                </button>
                                                <button
                                                    onClick={() => refinePlaygroundPrompt("styled like Vogue Korea magazine")}
                                                    disabled={playgroundRefining}
                                                    className="px-3 py-1 border border-pink-500 bg-pink-500/20 text-pink-500 hover:bg-pink-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    {playgroundRefining ? "..." : "📸 Vogue Korea"}
                                                </button>
                                                <button
                                                    onClick={() => refinePlaygroundPrompt("more cinematic and professional")}
                                                    disabled={playgroundRefining}
                                                    className="px-3 py-1 border border-purple-500 bg-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    {playgroundRefining ? "..." : "🎬 Cinematic"}
                                                </button>
                                                <button
                                                    onClick={() => refinePlaygroundPrompt("more dreamy and ethereal")}
                                                    disabled={playgroundRefining}
                                                    className="px-3 py-1 border border-yellow-500 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    {playgroundRefining ? "..." : "✨ Dreamy"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-xs font-bold text-green-500 mb-2 tracking-wider">↳ RESULTING PROMPT</div>
                                        <div className="text-gray-300 bg-black/50 p-4 border border-gray-800 font-mono text-sm leading-relaxed">
                                            {playgroundResult}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    </ProGate>
                )}

            </div>

            {/* Upgrade Modal */}
            {
                showUpgradeModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border-2 border-purple-500/30 rounded-lg max-w-md w-full p-6">
                            <div className="text-center">
                                <div className="text-4xl mb-4">🚀</div>
                                <h2 className="text-2xl font-bold text-purple-400 mb-2">Upgrade to Zunno Pro</h2>
                                <p className="text-gray-300 mb-6">
                                    Unlock Advanced Fields and get more precise AI-generated content
                                </p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Advanced prompt customization</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Style-specific generation</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Enhanced scene control</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Priority support</span>
                                    </div>
                                </div>

                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-purple-400">$19/month</div>
                                    <div className="text-sm text-gray-400">Cancel anytime</div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowUpgradeModal(false)}
                                        className="flex-1 py-3 px-4 border-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white font-bold transition-all"
                                    >
                                        Maybe Later
                                    </button>
                                    <button
                                        onClick={() => {
                                            // TODO: Implement actual upgrade logic
                                            setUser(prev => ({ ...prev, isPro: true }));
                                            setShowUpgradeModal(false);
                                        }}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity"
                                    >
                                        Upgrade Now (Demo)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}