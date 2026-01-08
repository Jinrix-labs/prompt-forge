'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Loader2, CheckCircle, XCircle, ArrowLeft, Copy, Check, History } from 'lucide-react';

type Workflow = {
    id: string;
    name: string;
    description: string;
    steps: any[];
    requiredInputs?: string[];
};

type StepResult = {
    stepId: string;
    stepName: string;
    output: string;
    tokensUsed: number;
    success?: boolean;
    error?: string;
};

export default function RunWorkflowPage() {
    const params = useParams();
    const router = useRouter();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [results, setResults] = useState<{
        success?: boolean;
        output?: string;
        stepResults?: StepResult[];
        error?: string;
        tokensUsed?: number;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const loadWorkflow = useCallback(async () => {
        try {
            const res = await fetch(`/api/workflows/${workflowId}`);
            const data = await res.json();
            
            if (data.workflow) {
                setWorkflow(data.workflow);
                // Use requiredInputs if defined, otherwise empty
                const inputFields: string[] = data.workflow.requiredInputs || [];
                const initialInputs: Record<string, string> = {};
                inputFields.forEach(field => {
                    initialInputs[field] = '';
                });
                setInputs(initialInputs);
            }
        } catch (error) {
            console.error('Failed to load workflow:', error);
        } finally {
            setLoading(false);
        }
    }, [workflowId]);

    useEffect(() => {
        if (workflowId) {
            loadWorkflow();
        }
    }, [workflowId, loadWorkflow]);


    async function runWorkflow() {
        setRunning(true);
        setResults(null);

        try {
            const res = await fetch('/api/workflows/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId,
                    inputs,
                }),
            });

            const data = await res.json();
            
            if (res.ok) {
                setResults({
                    success: true,
                    output: data.output,
                    stepResults: data.stepResults,
                    tokensUsed: data.tokensUsed,
                });
            } else {
                setResults({
                    success: false,
                    error: data.error || 'Failed to execute workflow',
                    stepResults: data.stepResults,
                });
            }
        } catch (error: any) {
            setResults({
                success: false,
                error: error.message || 'Failed to execute workflow',
            });
        } finally {
            setRunning(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
                    <p className="text-gray-400">Loading workflow...</p>
                </div>
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Workflow not found</p>
                    <button
                        onClick={() => router.push('/workflows')}
                        className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                        Back to Workflows
                    </button>
                </div>
            </div>
        );
    }

    const inputFields = Object.keys(inputs);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.push('/workflows')}
                            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-bold">BACK TO WORKFLOWS</span>
                        </button>
                        <button
                            onClick={() => router.push(`/workflows/${workflowId}/history`)}
                            className="flex items-center gap-2 border-2 border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white transition-all font-bold px-4 py-2"
                        >
                            <History className="w-4 h-4" />
                            HISTORY
                        </button>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">
                            {workflow.name}
                        </h1>
                        {workflow.description && (
                            <p className="text-gray-400">{workflow.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2 font-bold">
                            {workflow.steps.length} STEPS
                        </p>
                    </div>

                    {/* Input Form */}
                    <div className="border-2 border-fuchsia-500/30 bg-gray-900/50 backdrop-blur p-6 mb-6">
                        <h2 className="text-lg font-black text-cyan-400 mb-4">INPUTS</h2>
                        
                        {inputFields.length === 0 ? (
                            <p className="text-gray-400">This workflow doesn&apos;t require any inputs</p>
                        ) : (
                            <div className="space-y-4">
                                {inputFields.map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-bold text-cyan-400 mb-2">
                                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </label>
                                        <textarea
                                            value={inputs[field]}
                                            onChange={(e) =>
                                                setInputs({ ...inputs, [field]: e.target.value })
                                            }
                                            rows={3}
                                            className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
                                            placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={runWorkflow}
                            disabled={running}
                            className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-6 py-3 transition-all disabled:opacity-50"
                        >
                            {running ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    RUNNING WORKFLOW...
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    RUN WORKFLOW
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="border-2 border-fuchsia-500/30 bg-gray-900/50 backdrop-blur p-6">
                            <div className="flex items-center gap-3 mb-6">
                                {results.success ? (
                                    <>
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                        <h2 className="text-lg font-black text-white">
                                            WORKFLOW COMPLETED SUCCESSFULLY
                                        </h2>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-6 h-6 text-red-500" />
                                        <h2 className="text-lg font-black text-white">
                                            WORKFLOW FAILED
                                        </h2>
                                    </>
                                )}
                            </div>

                            {results.error && (
                                <div className="border-2 border-red-500/50 bg-red-900/20 rounded-md p-4 mb-4">
                                    <p className="text-red-400 font-bold">{results.error}</p>
                                </div>
                            )}

                            {results.tokensUsed && results.tokensUsed > 0 && (
                                <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded">
                                    <p className="text-sm text-gray-400">
                                        <span className="font-bold text-cyan-400">Total Tokens Used:</span>{' '}
                                        {results.tokensUsed.toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {results.stepResults && results.stepResults.length > 0 && (
                                <div className="space-y-4 mb-6">
                                    <h3 className="font-black text-cyan-400">STEP RESULTS:</h3>
                                    {results.stepResults.map((step, idx) => (
                                        <div key={idx} className="border-2 border-gray-800 bg-black/50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-white">
                                                    {idx + 1}. {step.stepName}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    {step.output && (
                                                        <span className="text-xs text-gray-500 font-bold">
                                                            {step.output.length} chars / {step.output.split(/\s+/).filter(w => w).length} words
                                                        </span>
                                                    )}
                                                    {step.success === false && (
                                                        <span className="text-xs text-red-400 font-bold">FAILED</span>
                                                    )}
                                                    {step.tokensUsed > 0 && (
                                                        <span className="text-xs text-gray-500 font-bold">
                                                            {step.tokensUsed.toLocaleString()} TOKENS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {step.error ? (
                                                <div className="border-2 border-red-500/50 bg-red-900/20 rounded p-3 mt-2">
                                                    <p className="text-red-400 text-sm">{step.error}</p>
                                                </div>
                                            ) : (
                                                <pre className="bg-black/50 border border-gray-800 p-3 rounded text-sm whitespace-pre-wrap break-words text-gray-300 font-mono">
                                                    {step.output}
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.output && (
                                <div className="pt-6 border-t-2 border-gray-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-black text-cyan-400">FINAL OUTPUT:</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-bold">
                                                {results.output.length} chars / {results.output.split(/\s+/).filter(w => w).length} words
                                            </span>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(results.output || '');
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    } catch (error) {
                                                        console.error('Failed to copy:', error);
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-3 py-1 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold text-sm transition-all"
                                            >
                                                {copied ? (
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
                                    <div className="border-2 border-cyan-500/30 bg-cyan-900/10 rounded-lg p-4">
                                        <pre className="whitespace-pre-wrap break-words text-white font-mono text-sm">
                                            {results.output}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
}

