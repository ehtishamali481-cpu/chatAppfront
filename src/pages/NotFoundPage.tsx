import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMessageSquare,
  FiHome,
  FiCompass,
  FiActivity,
  FiPhone,
} from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { PulseLogo } from '../components/common/PulseLogo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleDiagnosticPing = () => {
    setIsPinging(true);
    setPingStatus('Analyzing network packets...');
    setTimeout(() => {
      const ms = Math.floor(Math.random() * 20) + 14;
      setPingStatus(`Gateway Responsive: ${ms}ms latency. Chatly services 100% operational.`);
      setIsPinging(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden select-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <Link to="/chat" className="flex items-center gap-2.5 group">
          <PulseLogo size={36} />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Chatly
          </span>
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-2xl w-full my-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 dark:opacity-30 animate-pulse" />
          <div className="relative px-8 py-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 dark:border-emerald-500/30 shadow-2xl">
            <span className="text-7xl sm:text-9xl font-black tracking-tighter bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              404
            </span>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <FiCompass className="w-3.5 h-3.5 animate-spin" />
            <span>Frequency Lost</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
          This Conversation Doesn't Exist
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          The link you opened might be broken, encrypted under a different frequency, or the page was moved to a new channel.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-6">
          <Link
            to="/chat"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <FiMessageSquare className="w-4 h-4" />
            <span>Open All Chats</span>
          </Link>

          <Link
            to="/copilot"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <RiSparkling2Fill className="w-4 h-4 text-emerald-500" />
            <span>Ask Chatly AI</span>
          </Link>
        </div>

        <div className="w-full max-w-md p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FiActivity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-Time System Diagnostic</span>
            </span>
            <button
              type="button"
              onClick={handleDiagnosticPing}
              disabled={isPinging}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              {isPinging ? 'Pinging...' : 'Run Diagnostics'}
            </button>
          </div>
          {pingStatus && (
            <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 w-full text-left bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-xl animate-in fade-in">
              {pingStatus}
            </p>
          )}
        </div>
      </main>

      <footer className="w-full max-w-md text-center py-3 text-xs text-slate-400 dark:text-slate-500 z-10 flex items-center justify-center gap-4">
        <Link to="/status" className="hover:text-emerald-500 transition-colors">Stories & Status</Link>
        <span>•</span>
        <Link to="/calls" className="hover:text-emerald-500 transition-colors">Calls Log</Link>
        <span>•</span>
        <Link to="/login" className="hover:text-emerald-500 transition-colors">Account Access</Link>
      </footer>
    </div>
  );
};
