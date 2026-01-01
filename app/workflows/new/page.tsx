'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Plus, 
    Trash2, 
    GripVertical, 
    Sparkles, 
    Save,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { ProGate } from '@/components/ProGate';

type StepType = 'prompt_generation' | 'text_transform' | 'text_combine';

type WorkflowStep = {
    id: string;
    type: StepType;
    name: string;
    config: {
        promptTemplate?: string;
        model?: 'claude' | 'groq';
        maxCharacters?: number;
        maxWords?: number;
        operation?: 'uppercase' | 'lowercase' | 'trim' | 'extract';
        separator?: string;
    };
    inputs: Record<string, string>;
    outputKey: string;
};

export default function NewWorkflowPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [saving, setSaving] = useState(false);

    function addStep() {
        const newStep: WorkflowStep = {
            id: `step_${Date.now()}`,
            type: 'prompt_generation',
            name: `Step ${steps.length + 1}`,
            config: {
                promptTemplate: '',
                model: 'claude',
            },
            inputs: {},
            outputKey: `output_${steps.length + 1}`,
        };
        setSteps([...steps, newStep]);
    }

    function updateStep(index: number, updates: Partial<WorkflowStep>) {
        const updated = [...steps];
        updated[index] = { ...updated[index], ...updates };
        setSteps(updated);
    }

    function deleteStep(index: number) {
        setSteps(steps.filter((_, i) => i !== index));
    }

    function moveStep(index: number, direction: 'up' | 'down') {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === steps.length - 1)
        ) {
            return;
        }

        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    }

    async function saveWorkflow() {
        if (!name.trim()) {
            alert('Please enter a workflow name');
            return;
        }

        if (steps.length === 0) {
            alert('Please add at least one step');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    steps,
                    is_public: false,
                }),
            });

            if (res.ok) {
                const { workflow } = await res.json();
                router.push(`/workflows/${workflow.id}/run`);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to save workflow');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save workflow');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                <ProGate feature="Workflow Builder">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => router.push('/workflows')}
                                className="p-2 border-2 border-gray-700 hover:border-cyan-500 transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-white">⚡ CREATE WORKFLOW</h1>
                                <p className="text-gray-400 mt-1">
                                    Build a multi-step AI workflow by chaining prompts together
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Info */}
                    <div className="border-2 border-fuchsia-500/30 bg-gray-900/50 backdrop-blur p-6 mb-6">
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-cyan-400 mb-2">
                                WORKFLOW NAME *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Blog Post Generator"
                                className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-cyan-400 mb-2">
                                DESCRIPTION
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What does this workflow do?"
                                rows={2}
                                className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-white">
                                WORKFLOW STEPS ({steps.length})
                            </h2>
                            <button
                                onClick={addStep}
                                className="flex items-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-4 py-2 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                ADD STEP
                            </button>
                        </div>

                        {steps.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-800 bg-gray-900/50 p-12 text-center">
                                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-1">
                                    No steps yet
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Add your first step to start building your workflow
                                </p>
                                <button
                                    onClick={addStep}
                                    className="inline-flex items-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-4 py-2 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    ADD FIRST STEP
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <StepCard
                                        key={step.id}
                                        step={step}
                                        index={index}
                                        totalSteps={steps.length}
                                        availableVariables={getAvailableVariables(steps, index)}
                                        onUpdate={(updates) => updateStep(index, updates)}
                                        onDelete={() => deleteStep(index)}
                                        onMove={moveStep}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/workflows')}
                            className="px-6 py-2 border-2 border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white transition-all font-bold"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={saveWorkflow}
                            disabled={saving}
                            className="flex items-center gap-2 border-2 border-cyan-500 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black font-bold px-6 py-2 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    SAVING...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    SAVE WORKFLOW
                                </>
                            )}
                        </button>
                    </div>
                </ProGate>
            </div>
        </div>
    );
}

function StepCard({
    step,
    index,
    totalSteps,
    availableVariables,
    onUpdate,
    onDelete,
    onMove,
}: {
    step: WorkflowStep;
    index: number;
    totalSteps: number;
    availableVariables: string[];
    onUpdate: (updates: Partial<WorkflowStep>) => void;
    onDelete: () => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
}) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border-2 border-fuchsia-500/30 bg-gray-900/50 backdrop-blur">
            {/* Header */}
            <div className="p-4 flex items-center gap-3 border-b-2 border-gray-800">
                <GripVertical className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                    <input
                        type="text"
                        value={step.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        className="font-bold text-white bg-transparent border-none outline-none focus:ring-0 w-full placeholder-gray-600"
                        placeholder="Step name"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-30 transition-all"
                        title="Move up"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onMove(index, 'down')}
                        disabled={index === totalSteps - 1}
                        className="p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-30 transition-all"
                        title="Move down"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1 text-gray-500 hover:text-cyan-400 transition-all font-bold text-lg"
                        title={expanded ? 'Collapse' : 'Expand'}
                    >
                        {expanded ? '−' : '+'}
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1 text-red-500 hover:text-red-400 transition-all"
                        title="Delete step"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Body */}
            {expanded && (
                <div className="p-4 space-y-4">
                    {/* Step Type */}
                    <div>
                        <label className="block text-sm font-bold text-cyan-400 mb-2">
                            STEP TYPE
                        </label>
                        <select
                            value={step.type}
                            onChange={(e) => onUpdate({ type: e.target.value as StepType })}
                            className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white focus:border-cyan-500 focus:outline-none font-bold"
                        >
                            <option value="prompt_generation">AI GENERATION</option>
                            <option value="text_transform">TEXT TRANSFORM</option>
                            <option value="text_combine">COMBINE TEXT</option>
                        </select>
                    </div>

                    {/* Type-specific config */}
                    {step.type === 'prompt_generation' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-cyan-400 mb-2">
                                    AI MODEL
                                </label>
                                <select
                                    value={step.config.model}
                                    onChange={(e) =>
                                        onUpdate({
                                            config: { ...step.config, model: e.target.value as 'claude' | 'groq' },
                                        })
                                    }
                                    className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white focus:border-cyan-500 focus:outline-none font-bold"
                                >
                                    <option value="claude">CLAUDE (HAIKU)</option>
                                    <option value="groq">GROQ (LLAMA)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-cyan-400 mb-2">
                                    PROMPT TEMPLATE
                                </label>
                                <textarea
                                    value={step.config.promptTemplate || ''}
                                    onChange={(e) =>
                                        onUpdate({
                                            config: { ...step.config, promptTemplate: e.target.value },
                                        })
                                    }
                                    placeholder="Use {{variable}} to reference inputs. Example: Write about {{topic}}"
                                    rows={4}
                                    className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none font-mono text-sm resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Available variables: <span className="text-cyan-400">{availableVariables.join(', ') || 'none yet'}</span>
                                </p>
                            </div>

                            {/* Length constraints */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-cyan-400 mb-2">
                                        MAX CHARACTERS (OPTIONAL)
                                    </label>
                                    <input
                                        type="number"
                                        value={step.config.maxCharacters || ''}
                                        onChange={(e) =>
                                            onUpdate({
                                                config: { 
                                                    ...step.config, 
                                                    maxCharacters: e.target.value ? parseInt(e.target.value) : undefined 
                                                },
                                            })
                                        }
                                        placeholder="e.g., 280 for Twitter"
                                        className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-cyan-400 mb-2">
                                        MAX WORDS (OPTIONAL)
                                    </label>
                                    <input
                                        type="number"
                                        value={step.config.maxWords || ''}
                                        onChange={(e) =>
                                            onUpdate({
                                                config: { 
                                                    ...step.config, 
                                                    maxWords: e.target.value ? parseInt(e.target.value) : undefined 
                                                },
                                            })
                                        }
                                        placeholder="e.g., 100"
                                        className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            
                            <p className="text-xs text-gray-500">
                                Common limits: Twitter/X (280 chars), LinkedIn post (3,000 chars), Meta description (160 chars)
                            </p>
                        </>
                    )}

                    {step.type === 'text_transform' && (
                        <div>
                            <label className="block text-sm font-bold text-cyan-400 mb-2">
                                OPERATION
                            </label>
                            <select
                                value={step.config.operation || 'trim'}
                                onChange={(e) =>
                                    onUpdate({
                                        config: { ...step.config, operation: e.target.value as any },
                                    })
                                }
                                className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white focus:border-cyan-500 focus:outline-none font-bold"
                            >
                                <option value="uppercase">UPPERCASE</option>
                                <option value="lowercase">LOWERCASE</option>
                                <option value="trim">TRIM WHITESPACE</option>
                                <option value="extract">EXTRACT (SIMPLE REGEX)</option>
                            </select>
                        </div>
                    )}

                    {step.type === 'text_combine' && (
                        <div>
                            <label className="block text-sm font-bold text-cyan-400 mb-2">
                                SEPARATOR
                            </label>
                            <input
                                type="text"
                                value={step.config.separator || '\n\n'}
                                onChange={(e) =>
                                    onUpdate({
                                        config: { ...step.config, separator: e.target.value },
                                    })
                                }
                                placeholder="\\n\\n"
                                className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none font-mono"
                            />
                        </div>
                    )}

                    {/* Output Key */}
                    <div>
                        <label className="block text-sm font-bold text-cyan-400 mb-2">
                            SAVE OUTPUT AS
                        </label>
                        <input
                            type="text"
                            value={step.outputKey}
                            onChange={(e) => onUpdate({ outputKey: e.target.value })}
                            placeholder="e.g., research, outline, final_draft"
                            className="w-full px-4 py-2 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This output can be used in later steps as{' '}
                            <code className="bg-black border border-gray-700 px-2 py-1 rounded text-cyan-400">
                                {step.id}.{step.outputKey}
                            </code>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Get available variables for a step (from previous steps + user input)
function getAvailableVariables(steps: WorkflowStep[], currentIndex: number): string[] {
    const vars = ['user_input.*'];
    
    for (let i = 0; i < currentIndex; i++) {
        vars.push(`${steps[i].id}.${steps[i].outputKey}`);
    }
    
    return vars;
}

