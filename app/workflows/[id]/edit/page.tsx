'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Plus, 
    Trash2, 
    GripVertical, 
    Sparkles, 
    Save,
    ChevronDown,
    ChevronUp,
    Loader2,
    ArrowLeft,
    Globe,
    Lock
} from 'lucide-react';

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

export default function EditWorkflowPage() {
    const params = useParams();
    const router = useRouter();
    const workflowId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [requiredInputs, setRequiredInputs] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const loadWorkflow = useCallback(async () => {
        try {
            const res = await fetch(`/api/workflows/${workflowId}`);
            const data = await res.json();
            
            if (data.workflow) {
                setName(data.workflow.name);
                setDescription(data.workflow.description || '');
                setIsPublic(data.workflow.is_public || false);
                setSteps(data.workflow.steps || []);
                setRequiredInputs(data.workflow.requiredInputs || []);
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

    function addStep() {
        const previousStep = steps.length > 0 ? steps[steps.length - 1] : null;
        
        // Auto-generate a prompt template that references the previous step
        let defaultPromptTemplate = '';
        if (previousStep) {
            defaultPromptTemplate = `Using the output from "${previousStep.name}":\n\n{{${previousStep.id}.${previousStep.outputKey}}}\n\n[Add your instructions here]`;
        } else {
            defaultPromptTemplate = 'Enter your prompt here. Use {{variable}} to reference inputs.\n\nExample: Write a blog post about {{topic}}';
        }

        const newStep: WorkflowStep = {
            id: `step_${Date.now()}`,
            type: 'prompt_generation',
            name: `Step ${steps.length + 1}`,
            config: {
                promptTemplate: defaultPromptTemplate,
                model: 'claude',
            },
            inputs: previousStep ? {
                [previousStep.outputKey]: `${previousStep.id}.${previousStep.outputKey}`
            } : {},
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
            const res = await fetch(`/api/workflows/${workflowId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    steps,
                    requiredInputs: requiredInputs.filter(input => input.trim() !== ''),
                    is_public: isPublic,
                }),
            });

            if (res.ok) {
                router.push('/workflows');
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
                    <button
                        onClick={() => router.push('/workflows')}
                        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-bold">BACK TO WORKFLOWS</span>
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">
                            EDIT WORKFLOW
                        </h1>
                        <p className="text-gray-400">
                            Update your workflow configuration
                        </p>
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

                        <div className="mb-4">
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

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-cyan-400 mb-2">
                                REQUIRED INPUTS (What users need to provide)
                            </label>
                            <div className="space-y-2">
                                {requiredInputs.map((input, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => {
                                                const updated = [...requiredInputs];
                                                updated[idx] = e.target.value;
                                                setRequiredInputs(updated);
                                            }}
                                            placeholder="e.g., topic"
                                            className="flex-1 px-4 py-2 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => setRequiredInputs(requiredInputs.filter((_, i) => i !== idx))}
                                            className="p-2 text-red-500 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setRequiredInputs([...requiredInputs, ''])}
                                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold"
                                >
                                    <Plus className="w-4 h-4" />
                                    ADD INPUT
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Use these names in your prompts like: Write about {`{{topic}}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-black/50 border border-gray-700 rounded">
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-5 h-5 text-cyan-500 border-gray-600 bg-black rounded focus:ring-cyan-500"
                            />
                            <label htmlFor="is_public" className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                {isPublic ? (
                                    <>
                                        <Globe className="w-4 h-4 text-green-500" />
                                        <span className="font-bold">PUBLIC WORKFLOW</span>
                                        <span className="text-gray-500">(others can clone it)</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4 text-gray-500" />
                                        <span className="font-bold">PRIVATE WORKFLOW</span>
                                    </>
                                )}
                            </label>
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
                                        steps={steps}
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
                                    SAVE CHANGES
                                </>
                            )}
                        </button>
                    </div>
            </div>
        </div>
    );
}

function StepCard({
    step,
    index,
    totalSteps,
    steps,
    availableVariables,
    onUpdate,
    onDelete,
    onMove,
}: {
    step: WorkflowStep;
    index: number;
    totalSteps: number;
    steps: WorkflowStep[];
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
                            {index > 0 && (
                                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-cyan-300">
                                        <strong>💡 Tip:</strong> The output from previous steps is available as:
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        {steps.slice(0, index).map((prevStep, i) => (
                                            <code 
                                                key={i}
                                                className="block text-xs bg-black px-2 py-1 rounded border border-cyan-500/50 font-mono text-cyan-400"
                                            >
                                                {`{{${prevStep.id}.${prevStep.outputKey}}}`} → Output from &quot;{prevStep.name}&quot;
                                            </code>
                                        ))}
                                    </div>
                                </div>
                            )}
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

function getAvailableVariables(steps: WorkflowStep[], currentIndex: number): string[] {
    const vars = ['user_input.*'];
    
    for (let i = 0; i < currentIndex; i++) {
        vars.push(`${steps[i].id}.${steps[i].outputKey}`);
    }
    
    return vars;
}

