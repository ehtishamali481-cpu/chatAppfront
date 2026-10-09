import React, { useState } from 'react';
import {
  FiSend,
  FiCopy,
  FiShare2,
  FiCheck,
  FiLayers,
  FiZap,
  FiChevronDown,
  FiArrowRight,
  FiPhone,
} from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { sendCopilotQueryApi } from '../../api/client';
import { CopilotMessage } from '../../types';
import { useChat, CHATLY_AI_CONVERSATION } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';

const initialGreeting: CopilotMessage[] = [
  {
    id: 'cop_welcome',
    sender: 'assistant',
    content:
      "👋 Hello! I'm your Chatly AI Copilot. Ask me anything about your conversations, request summaries, draft messages, or get smart suggestions.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    model: 'Gemini',
  },
];

export const CopilotView: React.FC = () => {
  const navigate = useNavigate();
  const { sendMessage, setActiveConversationId, activeConversationId, conversations, startCall } = useChat();
  const [messages, setMessages] = useState<CopilotMessage[]>(initialGreeting);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini 3.5 Flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);

  const quickPrompts = [
    { label: 'Sprint Planning & Stories', query: 'Summarize the 3 key decisions made in #Design-System this morning and draft a crisp update for engineering leads.' },
    { label: 'Tone Polisher', query: 'Polish our latest UX release note for executives with empathetic and professional tone.' },
    { label: 'Meeting Summary', query: 'Extract action items from the design guild sprint retro.' },
    { label: 'Lossless Audio Specs', query: 'What are the required WebAudio frame rate intervals for voice memos?' },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSubmit = queryText || prompt.trim();
    if (!textToSubmit || isGenerating) return;

    setPrompt('');
    const userMsg: CopilotMessage = {
      id: `cop_user_${Date.now()}`,
      sender: 'user',
      content: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const response = await sendCopilotQueryApi(textToSubmit, selectedModel);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      console.error('Copilot query error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyDraft = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftId(id);
    setTimeout(() => setCopiedDraftId(null), 2500);
  };

  const handleInsertToChat = (text: string) => {
    const targetId = activeConversationId || conversations[0]?.id;
    if (targetId) {
      setActiveConversationId(targetId);
      sendMessage(text, 'text');
    }
    navigate('/chat');
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-slate-950 overflow-hidden">

      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Chatly AI Assistant</span>
              <RiSparkling2Fill className="text-emerald-600 dark:text-emerald-400 w-4 h-4" />
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => startCall(CHATLY_AI_CONVERSATION, 'audio')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
              title="Voice Call Chatly AI"
            >
              <FiPhone className="w-3.5 h-3.5" />
              <span>Voice Call AI</span>
            </button>

            <div className="relative inline-block">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Gemini 3.5 Flash">Gemini 3.5 Flash (Fast)</option>
                <option value="Gemini 3.8 Flash">Gemini 3.8 Flash</option>
                <option value="Gemini 1.5 Pro">Gemini Pro</option>
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
            <FiLayers className="w-3.5 h-3.5" />
            <span>Synchronized with 12 channels</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-medium">
            <FiZap className="w-3.5 h-3.5" />
            <span>Real-time</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(item.query)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-emerald-50 rounded-2xl rounded-tr-xs p-4 max-w-xl text-sm shadow-xs">
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className="text-right text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                    {msg.timestamp} ✓✓
                  </p>
                </div>
              </div>
            );
          }
          const meta = msg.parsedMetadata;

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-600 border border-slate-200/90 dark:border-slate-800 rounded-2xl rounded-tl-xs p-5 max-w-2xl w-full shadow-xs">
                {meta && (
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono">
                      {meta.channel} {meta.msgCount} msgs parsed
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[11px]">
                      🛡️ {meta.groundedPct}% Grounded
                    </span>
                  </div>
                )}

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">
                  3 Architectural Decisions Finalized:
                </h3>
                {meta?.decisions && (
                  <div className="space-y-3 mb-4">
                    {meta.decisions.map((dec) => (
                      <div key={dec.id} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          {dec.id}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {dec.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {dec.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {meta?.draft && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span>📄</span>
                        <span>{meta.draft.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyDraft(meta.draft!.body, msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          {copiedDraftId === msg.id ? (
                            <FiCheck className="text-emerald-500" />
                          ) : (
                            <FiCopy />
                          )}
                          <span>{copiedDraftId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertToChat(meta.draft!.body)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
                        >
                          <FiSend className="w-3 h-3" />
                          <span>Insert</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed font-sans border-l-2 border-emerald-500 pl-2.5 py-1 bg-white/70 dark:bg-slate-900/60 rounded-r-md">
                      {meta.draft.body}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end mt-3 text-[11px] font-mono text-slate-400">
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold p-4">
            <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Copilot analyzing 12 connected team channels...</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Copilot to synthesize, draft or extract decisions..."
            className="flex-1 py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-all ${prompt.trim() && !isGenerating
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-emerald-700/60 opacity-60 cursor-not-allowed'
              }`}
          >
            <FiSend className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
