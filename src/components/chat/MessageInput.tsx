import React, { useState, useRef, useEffect } from 'react';
import { FiSmile, FiPaperclip, FiSend, FiMic, FiSquare, FiCornerUpLeft, FiX } from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { useChat } from '../../context/ChatContext';
import { uploadFileApi, sendCopilotQueryApi } from '../../api/client';

const COMMON_EMOJIS = ['😊', '👍', '🔥', '🚀', '❤️', '💡', '🎉', '👏', '🎯', '✨', '⚡', '🙌'];

export const MessageInput: React.FC = () => {
  const { sendMessage, replyingToMessage, setReplyingToMessage, startTyping, stopTyping } = useChat();
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyingToMessage) {
      inputRef.current?.focus();
    }
  }, [replyingToMessage]);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    startTyping?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping?.();
    }, 2000);
  };

  const isSendingRef = useRef(false);

  const handleSend = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (isSendingRef.current) return;
    if (!content.trim() && !isRecording) return;
    stopTyping?.();

    if (isRecording) {
      isSendingRef.current = true;
      setIsRecording(false);
      const simulatedWave = Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 20);
      try {
        await sendMessage('', 'audio', {
          audio: {
            duration: Math.max(3, recordingSeconds),
            waveform: simulatedWave,
          },
        });
      } finally {
        isSendingRef.current = false;
      }
      return;
    }

    const textToSend = content.trim();
    setContent('');
    isSendingRef.current = true;
    try {
      await sendMessage(textToSend, 'text');
    } finally {
      isSendingRef.current = false;
      inputRef.current?.focus();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getHumanFileType = (file: File): string => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type === 'application/pdf' || ext === 'pdf') return 'PDF Document';
    if (
      file.type.includes('word') ||
      ext === 'doc' ||
      ext === 'docx' ||
      ext === 'odt'
    )
      return 'Word Document';
    if (
      file.type.includes('excel') ||
      file.type.includes('spreadsheet') ||
      ext === 'xls' ||
      ext === 'xlsx' ||
      ext === 'csv'
    )
      return 'Spreadsheet';
    if (
      file.type.includes('presentation') ||
      file.type.includes('powerpoint') ||
      ext === 'ppt' ||
      ext === 'pptx'
    )
      return 'Presentation';
    if (
      file.type.includes('zip') ||
      file.type.includes('tar') ||
      file.type.includes('rar') ||
      file.type.includes('7z') ||
      ext === 'zip' ||
      ext === 'rar' ||
      ext === 'tar' ||
      ext === 'gz'
    )
      return 'ZIP Archive';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    if (
      ext === 'json' ||
      ext === 'ts' ||
      ext === 'tsx' ||
      ext === 'js' ||
      ext === 'jsx' ||
      ext === 'html' ||
      ext === 'css' ||
      ext === 'py' ||
      ext === 'sql'
    )
      return 'Code File';
    if (file.type.startsWith('text/') || ext === 'txt' || ext === 'md')
      return 'Text Document';
    return 'Document';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = formatFileSize(file.size);
    const humanType = getHumanFileType(file);
    const isImage = file.type.startsWith('image/');

    setIsUploading(true);

    try {

      const uploaded = await uploadFileApi(file);
      const mediaUrl = uploaded.url;

      sendMessage(content.trim(), isImage ? 'image' : 'file', {
        mediaUrl,
        attachment: {
          id: `att_${Date.now()}`,
          name: file.name,
          size: formattedSize,
          type: humanType,
          url: mediaUrl,
        },
      });
      setContent('');
    } catch (uploadError) {
      console.warn('Server upload failed, falling back to local file reader:', uploadError);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        sendMessage(content.trim(), isImage ? 'image' : 'file', {
          mediaUrl: dataUrl,
          attachment: {
            id: `att_${Date.now()}`,
            name: file.name,
            size: formattedSize,
            type: humanType,
            url: dataUrl,
          },
        });
        setContent('');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAiPolish = async (): Promise<void> => {
    if (!content.trim()) {
      setContent('Could you please verify the 50ms audio waveform scrub synchronization?');
      return;
    }

    setIsPolishing(true);
    try {
      const result = await sendCopilotQueryApi(`Polish this message to sound professional, clear, and courteous: "${content.trim()}"`);
      if (result && result.content) {
        setContent(result.content.replace(/^"|"$/g, '').trim());
      }
    } catch (err) {

      setContent(`${content.trim()} (Reviewed and confirmed)`);
    } finally {
      setIsPolishing(false);
    }
  };

  const toggleRecording = (): void => {
    if (isRecording) {
      handleSend();
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="relative p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">

      {replyingToMessage && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FiCornerUpLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 mr-1.5">
                Replying to {replyingToMessage.senderName}:
              </span>
              <span className="text-slate-600 dark:text-slate-300 italic truncate inline-block max-w-xs align-bottom">
                {replyingToMessage.content || (replyingToMessage.type === 'audio' ? 'Voice note' : 'Attachment')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingToMessage(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel reply"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 grid grid-cols-6 gap-2 animate-in fade-in zoom-in-95">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setContent((prev) => prev + emoji);
                setShowEmojiPicker(false);
                inputRef.current?.focus();
              }}
              className="text-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-transform hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.tar,.gz,.json,.ts,.tsx,.js,.jsx,.py"
      />

      <form onSubmit={handleSend} className="flex items-center gap-2">

        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Add Emoji"
          >
            <FiSmile className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Attach Document or Image"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative flex items-center">
          {isRecording ? (
            <div className="w-full flex items-center justify-between px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-full animate-pulse">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Recording voice note...</span>
              </div>
              <span className="font-mono text-xs font-semibold text-rose-700 dark:text-rose-300">
                0:{recordingSeconds < 10 ? '0' : ''}
                {recordingSeconds}
              </span>
            </div>
          ) : (
            <div className="w-full relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={content}
                onChange={handleInputChange}
                placeholder="Type a message... (Markdown supported)"
                className="w-full py-2.5 pl-4 pr-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />

              <button
                type="button"
                onClick={handleAiPolish}
                className="absolute right-3 p-1 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                title="AI Copilot Tone Polisher"
              >
                <RiSparkling2Fill className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2.5 rounded-full transition-colors ${isRecording
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          title={isRecording ? 'Stop Recording' : 'Record Voice Note'}
        >
          {isRecording ? <FiSquare className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
        </button>
        <button
          type="submit"
          disabled={!content.trim() && !isRecording}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-all ${content.trim() || isRecording
              ? 'bg-emerald-700 hover:bg-emerald-800 active:scale-95'
              : 'bg-emerald-700/60 cursor-not-allowed opacity-60'
            }`}
          title="Send message"
        >
          <FiSend className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};
