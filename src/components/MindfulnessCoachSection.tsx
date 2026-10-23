import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { ChatTaskMode } from '../utils/meditationLogic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  timestamp: string;
}

const COACH_ROLES = [
  'Contemplative Mindfulness & Breathwork Guide',
  'Sleep & Circadian Wind-Down Specialist',
  'Somatic Stress & Anxiety Coach',
];

const MODEL_MODES: Array<{
  mode: ChatTaskMode;
  label: string;
  modelId: string;
  description: string;
}> = [
  {
    mode: 'fast',
    label: 'Fast Check-In',
    modelId: 'gemini-3.1-flash-lite',
    description: 'Immediate grounding tips & quick breath cues',
  },
  {
    mode: 'general',
    label: 'Balanced Guide',
    modelId: 'gemini-3.8-flash',
    description: 'General mindfulness coaching & soundscape pairing',
  },
  {
    mode: 'complex',
    label: 'Deep Reflection',
    modelId: 'gemini-4-argon',
    description: 'Complex emotional inquiry & multi-week practice design',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'model',
    text: 'Welcome to the Aether Mindfulness Sanctuary. How is your nervous system feeling right now? Tell me what you are carrying today, and I can guide you through a somatic breath sequence or help you design a custom meditation session.',
    modelUsed: 'gemini-3.8-flash',
    timestamp: 'Just now',
  },
];

export const MindfulnessCoachSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [taskMode, setTaskMode] = useState<ChatTaskMode>('general');
  const [coachRole, setCoachRole] = useState<string>(COACH_ROLES[0]);
  const [isSending, setIsSending] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const currentModelInfo =
    MODEL_MODES.find((m) => m.mode === taskMode) || MODEL_MODES[1];

  const buildLocalFallbackResponse = (userText: string, role: string, modelId: string): string => {
    const lower = userText.toLowerCase();
    if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired')) {
      return `As your ${role}, I recommend shifting into a 4-7-8 breath cadence right now. Inhale quietly through your nose for 4 seconds, hold for 7 seconds, and exhale audibly for 8 seconds. Try pairing the "Nordic Fjord Drift" session in the Better Sleep pack with Rain on Moss at 35% volume. (${modelId})`;
    }
    if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('overwhelmed')) {
      return `Let us pause together and widen your sensory horizon. Press both feet gently into the floor and notice three physical textures around you. Take two quick inhales through the nose followed by one long, slow exhale through the mouth—a physiological sigh to immediately calm your vagus nerve. (${modelId})`;
    }
    return `Thank you for sharing that with me. Working from the perspective of a ${role}, let us begin by softening the shoulders and taking three unhurried breaths—4 counts in, 2 counts hold, and 6 counts out. You can also load this intention directly into the Custom Session Studio above to generate a bespoke script and voiceover. (${modelId})`;
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, text: m.text })),
          taskMode,
          coachRole,
        }),
      });

      const data = await response.json();
      const replyText =
        response.ok && data.reply
          ? data.reply
          : buildLocalFallbackResponse(trimmed, coachRole, currentModelInfo.modelId);

      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        modelUsed: data.model || currentModelInfo.modelId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackText = buildLocalFallbackResponse(
        trimmed,
        coachRole,
        currentModelInfo.modelId
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallbackText,
          modelUsed: currentModelInfo.modelId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section
      id="mindfulness-coach"
      aria-label="Multi-Turn Gemini Mindfulness Coach"
      className="mx-auto max-w-[1280px] border-t border-slate-800/80 px-6 py-12"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs text-slate-400">
            <span>Multi-Turn Contemplative Dialogue</span>
            <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
            <span className="font-mono-tabular">Active Model: {currentModelInfo.modelId}</span>
          </p>
          <h2 className="mt-1 font-serif-display text-3xl font-semibold text-slate-50">
            Mindfulness & Breathwork Coach
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Converse with your mindfulness guide to unpack stress, ask for personalized breathing cadences, or design a multi-day meditation routine.
          </p>
        </div>

        {/* Model Tier Selector (gemini-3.1-flash-lite, gemini-3.8-flash, gemini-4-argon) */}
        <div
          role="group"
          aria-label="Select Gemini reasoning model tier"
          className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 shrink-0"
        >
          {MODEL_MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => setTaskMode(m.mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                taskMode === m.mode
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {m.label} · {m.modelId}
            </button>
          ))}
        </div>
      </div>

      {/* Role Selector & Conversation Container */}
      <div className="mt-6 rounded-2xl border border-slate-800/90 bg-slate-900/40 overflow-hidden">
        {/* Top Bar Inside Chat: System Role Selection */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/60 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="coach-role-select"
              className="text-xs font-medium text-slate-300"
            >
              Guide Role (System Instruction):
            </label>
            <select
              id="coach-role-select"
              value={coachRole}
              onChange={(e) => setCoachRole(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
            >
              {COACH_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Conversation</span>
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div
          ref={threadRef}
          aria-live="polite"
          className="h-[340px] space-y-4 overflow-y-auto p-6"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-[11px] text-slate-400">
                <span>{msg.role === 'user' ? 'You' : coachRole}</span>
                {msg.modelUsed && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{msg.modelUsed}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-400 text-slate-950 font-medium'
                    : 'border border-slate-800 bg-slate-950/80 text-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
              <span>{coachRole} is reflecting ({currentModelInfo.modelId})...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts + Input Bar */}
        <div className="border-t border-slate-800/80 bg-slate-950/70 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Prompts:</span>
            {[
              'Guide me through a 2-minute box breathing reset for work stress',
              'Help me unwind racing thoughts before sleep tonight',
              'Design a mindful eating pause before my next meal',
            ].map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => sendMessage(promptText)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-slate-700 hover:text-slate-100 whitespace-nowrap shrink-0"
              >
                {promptText}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
            <label htmlFor="mindfulness-chat-input" className="sr-only">
              Ask your mindfulness coach
            </label>
            <input
              id="mindfulness-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message your ${coachRole} (${currentModelInfo.modelId})...`}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
