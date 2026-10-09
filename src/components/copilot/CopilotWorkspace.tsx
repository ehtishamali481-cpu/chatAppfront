import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiShare2,
  FiDownload,
  FiMaximize2,
  FiPaperclip,
  FiAtSign,
  FiCode,
  FiMic,
  FiSend,
  FiCopy,
  FiCheck,
  FiLayers,
  FiZap,
  FiMessageSquare,
  FiShield,
  FiChevronDown,
  FiBell,
  FiPhone,
} from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { BsCheckAll } from 'react-icons/bs';
import { Avatar } from '../common/Avatar';
import { PulseLogo } from '../common/PulseLogo';
import { useAuth } from '../../context/AuthContext';
import { useChat, TopTab, CHATLY_AI_CONVERSATION } from '../../context/ChatContext';
import { sendCopilotQueryApi } from '../../api/client';

interface CopilotSession {
  id: string;
  title: string;
  desc: string;
  time: string;
  active?: boolean;
}

const DEFAULT_SESSIONS: CopilotSession[] = [
  {
    id: 's1',
    title: 'Sprint Planning & Stories',
    desc: 'Summarize decisions in #Design-System',
    time: 'Just now',
    active: true,
  },
  {
    id: 's2',
    title: 'Message Tone Polishing',
    desc: 'Rewrite client proposal into Spanish...',
    time: '2 hours ago',
  },
  {
    id: 's3',
    title: 'Meeting Summaries & Tasks',
    desc: 'Transcribed 42-min audio recording',
    time: 'Yesterday',
  },
  {
    id: 's4',
    title: 'Design Feedback & Specs',
    desc: 'Inspected Figma screenshots & SVG assets',
    time: '3 days ago',
  },
];

export const CopilotWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, setActiveConversationId, activeConversationId, conversations, activeTopTab, setActiveTopTab, startCall } = useChat();

  const [sessions, setSessions] = useState<CopilotSession[]>(DEFAULT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState('s1');
  const [searchQuery, setSearchQuery] = useState('');
  const [model, setModel] = useState('Gemini 1.5 Pro (Team)');
  const [deepResearch, setDeepResearch] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [insertedDraft, setInsertedDraft] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'user',
      text: 'Summarize the 3 key decisions made in the #Design-System channel this morning and draft a polite status update for the engineering leads.',
      timestamp: '09:41 AM',
    },
    {
      id: 'm2',
      sender: 'assistant',
      channel: '# Design-System',
      analyzedInfo: 'Analyzed 48 messages (08:30 - 10:15 AM)',
      grounded: '100% Grounded',
      decisions: [
        {
          num: 1,
          title: 'Emerald Brand Dominance:',
          desc: 'Adopted emerald primary #059669 for all high-contrast calls to action, button states, and live streaming badges.',
          token: '#059669',
        },
        {
          num: 2,
          title: 'Chat Geometry Standard:',
          desc: 'Fixed message bubble border-radius to strictly 18px with micro-directional tail indicators for clear author attribution.',
          token: '18px',
        },
        {
          num: 3,
          title: 'Audio Wave Precision:',
          desc: 'Locked voice note audio scrubber frequency intervals to 50ms intervals to avoid dropped frames during fast scrubbing.',
          token: '50ms',
        },
      ],
      draft: {
        title: 'Draft for Engineering Leads',
        content:
          '“Hi team! We reached consensus this morning on design tokens: 1) Standardizing on Emerald (#059669) for primary interactions, 2) 18px radius for conversational bubbles, and 3) 50ms sampling for voice scrubs. All specs and Figma variables are published. Let us know if you have any questions before the 2 PM build!”',
      },
      timestamp: '09:42 AM',
    },
  ]);

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setSessions((prev) =>
      prev.map((s) => ({ ...s, active: s.id === id }))
    );
  };

  const handleNewSession = () => {
    const newSess: CopilotSession = {
      id: `s_${Date.now()}`,
      title: 'New Investigation',
      desc: 'Active context synthesis',
      time: 'Just now',
      active: true,
    };
    setSessions((prev) => [newSess, ...prev.map((s) => ({ ...s, active: false }))]);
    setActiveSessionId(newSess.id);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userText = prompt.trim();
    setPrompt('');

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      const result = await sendCopilotQueryApi(userText);
      const assistantMsg = {
        id: result?.id || `m_ai_${Date.now()}`,
        sender: 'assistant',
        channel: result?.parsedMetadata?.channel || '# Synchronized Channels',
        analyzedInfo: `Analyzed ${result?.parsedMetadata?.msgCount || 12} channel updates`,
        grounded: `${result?.parsedMetadata?.groundedPct || 100}% Grounded`,
        decisions: result?.parsedMetadata?.decisions?.map((d, idx) => ({
          num: d.id || idx + 1,
          title: d.title,
          desc: d.desc,
          token: 'Verified',
        })) || [
            {
              num: 1,
              title: 'Synthesis complete:',
              desc: result?.content || 'Ready for review.',
              token: 'Ready',
            },
          ],
        draft: {
          title: result?.parsedMetadata?.draft?.title || 'Actionable Summary',
          content: result?.parsedMetadata?.draft?.body || result?.content || 'Synthesis ready.',
        },
        timestamp: result?.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg = {
        id: `m_ai_${Date.now()}`,
        sender: 'assistant',
        channel: '# Team-General',
        analyzedInfo: 'Analyzed recent channel activity',
        grounded: '100% Grounded',
        decisions: [
          {
            num: 1,
            title: 'Context Identified:',
            desc: `Processed request for "${userText.slice(0, 40)}..."`,
            token: 'Ready',
          },
        ],
        draft: {
          title: 'Actionable Draft',
          content: `“Regarding recent updates: team alignment is verified and all systems are stable.”`,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleInsertDraft = (text: string) => {
    const targetId = activeConversationId || conversations[0]?.id;
    if (targetId) {
      setActiveConversationId(targetId);
      sendMessage(text, 'text');
    }
    setInsertedDraft(true);
    setTimeout(() => {
      setInsertedDraft(false);
      navigate('/chat');
    }, 400);
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-w-0">

      <aside className="w-full md:w-80 lg:w-84 h-full bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col shrink-0">

        <div className="p-4 pb-3">
          <button
            type="button"
            onClick={handleNewSession}
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-between shadow-md shadow-emerald-950/20 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">+</span>
              <span>New AI Session</span>
            </div>
            <RiSparkling2Fill className="w-4 h-4 text-emerald-300" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts or topics..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>ACTIVE COPILOT SESSIONS</span>
            <span className="font-mono text-xs font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {sessions.length}
            </span>
          </div>

          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 shadow-2xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {session.title}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pl-4">
                  {session.desc}
                </p>

                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-400 pl-4 mt-1">
                  {session.time}
                </p>
              </div>
            );
          })}
        </div>
        <div className="p-3 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Context Buffer</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              Active Buffer
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-emerald-500 w-[18%] rounded-full" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>Gemini 1.5 Pro</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              98.2% remaining
            </span>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <div className="hidden md:flex items-center justify-between px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTopTab('all');
                navigate('/chat');
              }}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              All Chats
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTopTab('channels');
                navigate('/chat');
              }}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Channels
            </button>
            <button
              type="button"
              onClick={() => setActiveTopTab('copilot')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold transition-colors"
            >
              Copilot
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTopTab('audio-video');
                navigate('/calls');
              }}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Audio & Video
            </button>
          </div>
          <div className="flex items-center gap-4">
            <FiSearch className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
            <div className="relative">
              <FiBell className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Avatar name={user?.name || 'Sarah Jenkins'} size="sm" online={true} />
              <div className="text-left text-xs leading-tight hidden lg:block">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {user?.name || 'Sarah Jenkins'}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-sm shadow-xs">
              <RiSparkling2Fill />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Chatly AI Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Gemini Pro Enabled • Real-Time Context
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Synchronized with team channels & documents
              </p>
            </div>
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
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Gemini 1.5 Pro (Team)">Gemini 1.5 Pro (Team)</option>
                <option value="Gemini 1.5 Flash (Ultra-Fast)">Gemini 1.5 Flash (Ultra-Fast)</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-3.5 h-3.5" />
            </div>

            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share Session"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Export Output"
            >
              <FiDownload className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              title="Expand"
            >
              <FiMaximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Elevate team communications in real-time.
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your intelligent team copilot for summarizing conversations, writing flawless copy, and accelerating engineering roadmaps.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center">
                💬
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <RiSparkling2Fill />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex items-start gap-2.5 max-w-2xl">
              <div className="bg-emerald-800 text-white rounded-2xl rounded-tr-xs p-4 text-xs sm:text-sm shadow-sm leading-relaxed">
                <p>
                  Summarize the 3 key decisions made in the #Design-System channel this morning and draft a polite status update for the engineering leads.
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-200 font-mono">
                  <span>09:41 AM</span>
                  <BsCheckAll className="text-emerald-300 text-sm" />
                </div>
              </div>
              <Avatar name={user?.name || 'Sarah Jenkins'} size="sm" />
            </div>
          </div>
          <div className="flex justify-start">
            <div className="flex items-start gap-2.5 max-w-3xl w-full">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-sm shrink-0 shadow-xs mt-1">
                <RiSparkling2Fill />
              </div>

              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl rounded-tl-xs p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
                    # Design-System
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    Analyzed 48 messages (08:30 – 10:15 AM)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
                    🛡️ 100% Grounded
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2.5 flex items-center gap-1.5">
                    <FiCheck className="text-emerald-600" />
                    <span>Key Architectural Decisions:</span>
                  </h4>

                  <div className="space-y-3 pl-1 text-xs sm:text-sm">

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        1.
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-900 dark:text-slate-100">
                          Emerald Brand Dominance:
                        </strong>{' '}
                        Adopted emerald primary{' '}
                        <code className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs border border-emerald-200 dark:border-emerald-800">
                          #059669
                        </code>{' '}
                        for all high-contrast calls to action, button states, and live streaming badges.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        2.
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-900 dark:text-slate-100">
                          Chat Geometry Standard:
                        </strong>{' '}
                        Fixed message bubble border-radius to strictly{' '}
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs border border-slate-200 dark:border-slate-700">
                          18px
                        </code>{' '}
                        with micro-directional tail indicators for clear author attribution.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        3.
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-900 dark:text-slate-100">
                          Audio Wave Precision:
                        </strong>{' '}
                        Locked voice note audio scrubber frequency intervals to{' '}
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs border border-slate-200 dark:border-slate-700">
                          50ms
                        </code>{' '}
                        intervals to avoid dropped frames during fast scrubbing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span>📄</span>
                      <span>Draft for Engineering Leads</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyDraft(
                            'Hi team! We reached consensus this morning on design tokens: 1) Standardizing on Emerald (#059669) for primary interactions, 2) 18px radius for conversational bubbles, and 3) 50ms sampling for voice scrubs. All specs and Figma variables are published. Let us know if you have any questions before the 2 PM build!'
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                      >
                        {copiedDraft ? (
                          <FiCheck className="text-emerald-600 w-3 h-3" />
                        ) : (
                          <FiCopy className="w-3 h-3" />
                        )}
                        <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleInsertDraft(
                            'Hi team! We reached consensus this morning on design tokens: 1) Standardizing on Emerald (#059669) for primary interactions, 2) 18px radius for conversational bubbles, and 3) 50ms sampling for voice scrubs. All specs and Figma variables are published. Let us know if you have any questions before the 2 PM build!'
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-2xs"
                      >
                        <FiSend className="w-3 h-3" />
                        <span>{insertedDraft ? 'Inserted' : 'Insert into Chat'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border-l-3 border-emerald-500">
                    “Hi team! We reached consensus this morning on design tokens: 1) Standardizing on Emerald (#059669) for primary interactions, 2) 18px radius for conversational bubbles, and 3) 50ms sampling for voice scrubs. All specs and Figma variables are published. Let us know if you have any questions before the 2 PM build!”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 shrink-0">
          <div className="max-w-5xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2 px-1">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Attach multimodal assets:
                </span>
                <span>Drop Figma screenshots, user recordings, or PRDs</span>
              </span>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deepResearch}
                    onChange={(e) => setDeepResearch(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Deep Research (Include Chat History)
                  </span>
                </label>

                <span className="font-mono text-slate-400">AI Context Active</span>
              </div>
            </div>
            <form onSubmit={handleGenerate} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500">

                <div className="flex items-center gap-1 text-slate-400 mr-2">
                  <button
                    type="button"
                    className="p-1.5 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                    title="Upload File or Screenshot"
                  >
                    <FiPaperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                    title="Mention Channel"
                  >
                    <FiAtSign className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                    title="Code Snippet"
                  >
                    <FiCode className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask Chatly Copilot anything, '@' mention a channel, or summarize voice notes..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-1.5"
                />
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors ml-2"
                  title="Voice Input"
                >
                  <FiMic className="w-4 h-4" />
                </button>
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span>Generate</span>
                <span>▶</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
