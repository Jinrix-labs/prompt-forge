'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function WorkflowTestPage() {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testWorkflow = {
        name: 'Test Workflow',
        description: 'A simple test workflow',
        steps: [
            {
                id: 'step1',
                name: 'Generate Prompt',
                type: 'prompt_generation',
                config: {
                    model: 'claude',
                    promptTemplate: 'Generate a creative prompt for: {{userInput}}',
                },
                inputs: {
                    userInput: 'user_input.topic',
                },
                outputKey: 'generatedPrompt',
            },
            {
                id: 'step2',
                name: 'Transform Text',
                type: 'text_transform',
                config: {
                    operation: 'uppercase',
                },
                inputs: {
                    text: 'step1.generatedPrompt',
                },
                outputKey: 'finalOutput',
            },
        ],
        is_public: false,
    };

    const testInputs = {
        topic: 'a cyberpunk city at night',
    };

    const testCreate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testWorkflow),
            });
            const data = await res.json();
            setResults({ type: 'create', data, status: res.status });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testList = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/workflows');
            const data = await res.json();
            setResults({ type: 'list', data, status: res.status });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testGet = async (id: string) => {
        if (!id) {
            setError('Please provide a workflow ID');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/workflows/${id}`);
            const data = await res.json();
            setResults({ type: 'get', data, status: res.status });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testExecute = async (id: string) => {
        if (!id) {
            setError('Please provide a workflow ID');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/workflows/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId: id,
                    inputs: testInputs,
                }),
            });
            const data = await res.json();
            setResults({ type: 'execute', data, status: res.status });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-500 bg-clip-text text-transparent">
                    Workflow API Test
                </h1>

                <SignedOut>
                    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                        <p className="mb-4">Please sign in to test workflows</p>
                        <SignInButton />
                    </div>
                </SignedOut>

                <SignedIn>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={testCreate}
                                disabled={loading}
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Testing...' : '1. Create Workflow'}
                            </button>

                            <button
                                onClick={testList}
                                disabled={loading}
                                className="px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Testing...' : '2. List Workflows'}
                            </button>
                        </div>

                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                            <label className="block text-sm mb-2">Test Get/Execute (enter workflow ID):</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="workflowId"
                                    placeholder="workflow-id-here"
                                    className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded text-white"
                                />
                                <button
                                    onClick={() => {
                                        const id = (document.getElementById('workflowId') as HTMLInputElement)?.value;
                                        testGet(id);
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded disabled:opacity-50"
                                >
                                    Get
                                </button>
                                <button
                                    onClick={() => {
                                        const id = (document.getElementById('workflowId') as HTMLInputElement)?.value;
                                        testExecute(id);
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded disabled:opacity-50"
                                >
                                    Execute
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
                                <p className="text-red-400 font-bold">Error:</p>
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}

                        {results && (
                            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                                <p className="text-cyan-400 font-bold mb-2">
                                    Results ({results.type}) - Status: {results.status}
                                </p>
                                <pre className="text-xs bg-black p-4 rounded overflow-auto max-h-96">
                                    {JSON.stringify(results.data, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                            <p className="text-sm text-gray-400 mb-2">Test Workflow Structure:</p>
                            <pre className="text-xs bg-black p-4 rounded overflow-auto">
                                {JSON.stringify(testWorkflow, null, 2)}
                            </pre>
                        </div>
                    </div>
                </SignedIn>
            </div>
        </div>
    );
}

