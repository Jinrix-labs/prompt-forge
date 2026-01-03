'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Execution = {
    id: string;
    status: string;
    input_data: any;
    output_data: any;
    step_results: any[];
    tokens_used: number;
    error_message?: string;
    started_at: string;
    completed_at?: string;
};

export default function WorkflowHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<any>(null);
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(true);

    const loadWorkflow = useCallback(async () => {
        try {
            const res = await fetch(`/api/workflows/${workflowId}`);
            const data = await res.json();
            if (data.workflow) {
                setWorkflow(data.workflow);
            }
        } catch (error) {
            console.error('Failed to load workflow:', error);
        }
    }, [workflowId]);

    const loadExecutions = useCallback(async () => {
        try {
            const res = await fetch(`/api/workflows/${workflowId}/executions`);
            const data = await res.json();
            setExecutions(data.executions || []);
        } catch (error) {
            console.error('Failed to load executions:', error);
        } finally {
            setLoading(false);
        }
    }, [workflowId]);

    useEffect(() => {
        if (workflowId) {
            loadWorkflow();
            loadExecutions();
        }
    }, [workflowId, loadWorkflow, loadExecutions]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
                    <p className="text-gray-400">Loading execution history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                    {/* Header */}
                    <button
                        onClick={() => router.push(`/workflows/${workflowId}/run`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-bold">BACK TO WORKFLOW</span>
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">
                            {workflow?.name || 'Workflow'} - EXECUTION HISTORY
                        </h1>
                        <p className="text-gray-400">
                            View past runs and their outputs
                        </p>
                    </div>

                    {executions.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-800 bg-gray-900/50 p-12 text-center">
                            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-white mb-1">
                                No executions yet
                            </h3>
                            <p className="text-gray-500">
                                Run this workflow to see execution history here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {executions.map((execution) => (
                                <div
                                    key={execution.id}
                                    className="border-2 border-fuchsia-500/30 bg-gray-900/50 backdrop-blur p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {execution.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : execution.status === 'failed' ? (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                                            )}
                                            <span className="font-bold text-white uppercase">
                                                {execution.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {new Date(execution.started_at).toLocaleString()}
                                        </div>
                                    </div>

                                    {execution.error_message && (
                                        <div className="border-2 border-red-500/50 bg-red-900/20 rounded-md p-4 mb-4">
                                            <p className="text-red-400 font-bold">{execution.error_message}</p>
                                        </div>
                                    )}

                                    {execution.tokens_used > 0 && (
                                        <div className="mb-4 text-sm text-gray-400">
                                            <span className="font-bold text-cyan-400">Tokens Used:</span>{' '}
                                            {execution.tokens_used.toLocaleString()}
                                        </div>
                                    )}

                                    {execution.step_results && execution.step_results.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            <h3 className="font-bold text-cyan-400">STEP RESULTS:</h3>
                                            {execution.step_results.map((step: any, idx: number) => (
                                                <div key={idx} className="border-2 border-gray-800 bg-black/50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-white">
                                                            {idx + 1}. {step.stepName}
                                                        </h4>
                                                        {step.output && (
                                                            <span className="text-xs text-gray-500 font-bold">
                                                                {step.output.length} chars / {step.output.split(/\s+/).filter((w: string) => w).length} words
                                                            </span>
                                                        )}
                                                    </div>
                                                    {step.error ? (
                                                        <p className="text-red-400 text-sm">{step.error}</p>
                                                    ) : (
                                                        <pre className="bg-black/50 border border-gray-800 p-3 rounded text-sm whitespace-pre-wrap break-words text-gray-300 font-mono max-h-40 overflow-auto">
                                                            {step.output}
                                                        </pre>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {execution.output_data?.result && (
                                        <div className="pt-4 border-t-2 border-gray-800">
                                            <h3 className="font-bold text-cyan-400 mb-2">FINAL OUTPUT:</h3>
                                            <div className="border-2 border-cyan-500/30 bg-cyan-900/10 rounded-lg p-4">
                                                <pre className="whitespace-pre-wrap break-words text-white font-mono text-sm">
                                                    {execution.output_data.result}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}

