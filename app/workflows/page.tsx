'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Sparkles, Plus, Play, Trash2, Copy, Globe, Lock, Loader2 } from 'lucide-react';
import { ProGate } from '@/components/ProGate';

type Workflow = {
    id: string;
    name: string;
    description: string;
    steps: any[];
    is_public: boolean;
    created_at: string;
    user_id: string;
};

export default function WorkflowsPage() {
    const router = useRouter();
    const { user } = useUser();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPublic, setShowPublic] = useState(false);
    const [credits, setCredits] = useState<number>(0);

    const loadCredits = useCallback(async () => {
        try {
            const res = await fetch('/api/user/credits');
            if (res.ok) {
                const data = await res.json();
                setCredits(data.credits || 0);
            }
        } catch (error) {
            console.error('Failed to load credits:', error);
        }
    }, []);

    const loadWorkflows = useCallback(async () => {
        try {
            setLoading(true);
            const url = showPublic ? '/api/workflows?public=true' : '/api/workflows';
            const res = await fetch(url);
            const data = await res.json();
            setWorkflows(data.workflows || []);
        } catch (error) {
            console.error('Failed to load workflows:', error);
        } finally {
            setLoading(false);
        }
    }, [showPublic]);

    useEffect(() => {
        loadWorkflows();
        loadCredits();
    }, [loadWorkflows, loadCredits]);

    async function deleteWorkflow(id: string) {
        if (!confirm('Are you sure you want to delete this workflow?')) return;

        try {
            const res = await fetch(`/api/workflows/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setWorkflows(workflows.filter(w => w.id !== id));
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to delete workflow');
            }
        } catch (error) {
            console.error('Failed to delete workflow:', error);
            alert('Failed to delete workflow');
        }
    }

    async function cloneWorkflow(id: string) {
        try {
            const res = await fetch(`/api/workflows/${id}/clone`, {
                method: 'POST',
            });

            if (res.ok) {
                const { workflow } = await res.json();
                router.push(`/workflows/${workflow.id}/edit`);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to clone workflow');
            }
        } catch (error) {
            console.error('Failed to clone workflow:', error);
            alert('Failed to clone workflow');
        }
    }

    const myWorkflows = workflows.filter(w => w.user_id === user?.id);
    const publicWorkflows = workflows.filter(w => w.user_id !== user?.id && w.is_public);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                <ProGate feature="Workflows">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 bg-gray-900/60 backdrop-blur-sm border-2 border-gray-800 rounded-lg p-6">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">⚡ WORKFLOWS</h1>
                            <p className="text-gray-300">
                                Create and manage AI-powered workflow automations
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm border-2 border-gray-600 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded">
                                <span className="text-gray-400">Credits: </span>
                                <span className="text-cyan-400 font-bold">{credits}</span>
                                {credits === 0 && (
                                    <Link
                                        href="/pricing"
                                        className="ml-2 text-fuchsia-400 hover:text-fuchsia-300 underline text-xs"
                                    >
                                        Buy More
                                    </Link>
                                )}
                            </div>
                            <button
                                onClick={() => router.push('/workflows/new')}
                                className="flex items-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-4 py-2 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                NEW WORKFLOW
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 border-b-2 border-gray-700 bg-gray-900/40 backdrop-blur-sm px-4 py-2 rounded-t-lg">
                        <button
                            onClick={() => setShowPublic(false)}
                            className={`pb-2 px-1 font-bold transition ${
                                !showPublic
                                    ? 'text-cyan-500 border-b-2 border-cyan-500'
                                    : 'text-gray-600 hover:text-gray-400'
                            }`}
                        >
                            MY WORKFLOWS ({myWorkflows.length})
                        </button>
                        <button
                            onClick={() => setShowPublic(true)}
                            className={`pb-2 px-1 font-bold transition ${
                                showPublic
                                    ? 'text-fuchsia-500 border-b-2 border-fuchsia-500'
                                    : 'text-gray-600 hover:text-gray-400'
                            }`}
                        >
                            PUBLIC LIBRARY ({publicWorkflows.length})
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-500" />
                            <p className="text-gray-400">Loading workflows...</p>
                        </div>
                    )}

                    {/* Workflow Grid */}
                    {!loading && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!showPublic && myWorkflows.length === 0 && (
                            <div className="col-span-full border-2 border-dashed border-gray-700 bg-gray-900/80 backdrop-blur-sm p-16 text-center">
                                    <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        No workflows yet
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        Create your first AI workflow to get started
                                    </p>
                                    <button
                                        onClick={() => router.push('/workflows/new')}
                                        className="inline-flex items-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-4 py-2 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        CREATE WORKFLOW
                                    </button>
                                </div>
                            )}

                        {showPublic && publicWorkflows.length === 0 && (
                            <div className="col-span-full border-2 border-dashed border-gray-700 bg-gray-900/80 backdrop-blur-sm p-16 text-center">
                                    <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        No public workflows
                                    </h3>
                                    <p className="text-gray-500">
                                        Public workflows will appear here when available
                                    </p>
                                </div>
                            )}

                            {(showPublic ? publicWorkflows : myWorkflows).map((workflow) => (
                                <WorkflowCard
                                    key={workflow.id}
                                    workflow={workflow}
                                    isOwner={workflow.user_id === user?.id}
                                    onDelete={deleteWorkflow}
                                    onClone={cloneWorkflow}
                                    onRun={(id) => router.push(`/workflows/${id}/run`)}
                                    onEdit={(id) => router.push(`/workflows/${id}/edit`)}
                                />
                            ))}
                        </div>
                    )}
                </ProGate>
            </div>
        </div>
    );
}

function WorkflowCard({
    workflow,
    isOwner,
    onDelete,
    onClone,
    onRun,
    onEdit,
}: {
    workflow: Workflow;
    isOwner: boolean;
    onDelete: (id: string) => void;
    onClone: (id: string) => void;
    onRun: (id: string) => void;
    onEdit: (id: string) => void;
}) {
    return (
        <div className="border-2 border-fuchsia-500/50 bg-gray-900/90 backdrop-blur-sm shadow-lg hover:border-fuchsia-500 transition-all">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-white">{workflow.name}</h3>
                            {workflow.is_public ? (
                                <Globe className="w-4 h-4 text-green-500" />
                            ) : (
                                <Lock className="w-4 h-4 text-gray-500" />
                            )}
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">
                            {workflow.description || 'No description'}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="font-bold">{workflow.steps.length} STEPS</span>
                    <span>•</span>
                    <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onRun(workflow.id)}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-3 py-2 transition-all text-sm"
                    >
                        <Play className="w-4 h-4" />
                        RUN
                    </button>

                    {isOwner ? (
                        <>
                            <button
                                onClick={() => onEdit(workflow.id)}
                                className="px-3 py-2 border-2 border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white transition-all text-sm font-bold"
                            >
                                EDIT
                            </button>
                            <button
                                onClick={() => onDelete(workflow.id)}
                                className="p-2 border-2 border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onClone(workflow.id)}
                            className="px-3 py-2 border-2 border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white transition-all text-sm font-bold flex items-center gap-1"
                        >
                            <Copy className="w-4 h-4" />
                            CLONE
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

