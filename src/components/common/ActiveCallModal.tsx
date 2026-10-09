import React, { useState, useEffect, useRef } from 'react';
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiPhone,
  FiVolume2,
  FiShield,
  FiSend,
  FiGlobe,
  FiSquare,
} from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from './Avatar';
import { sendCopilotQueryApi } from '../../api/client';
import { getSocket } from '../../services/socketService';

export const ActiveCallModal: React.FC = () => {
  const { user } = useAuth();
  const { activeCall, endCall, acceptCall, rejectCall } = useChat();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoudspeaker, setIsLoudspeaker] = useState(false);
  const [ringRemaining, setRingRemaining] = useState(30);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [remoteStreamAttached, setRemoteStreamAttached] = useState(false);

  const [aiSpeechText, setAiSpeechText] = useState('Connecting to Chatly AI Voice Engine...');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceQueryInput, setVoiceQueryInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState('');
  const [userVolume, setUserVolume] = useState(0);
  const [speechLang, setSpeechLang] = useState<'ur-PK' | 'en-US'>('en-US');

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isAiSpeakingRef = useRef(false);
  isAiSpeakingRef.current = isAiSpeaking;
  const isMutedRef = useRef(false);
  isMutedRef.current = isMuted;
  const callStatusRef = useRef(activeCall?.status);
  callStatusRef.current = activeCall?.status;
  const speechLangRef = useRef<'ur-PK' | 'en-US'>('en-US');
  speechLangRef.current = speechLang;
  const restartTimeoutRef = useRef<any>(null);
  const submitTimeoutRef = useRef<any>(null);
  const safetyUtteranceTimeoutRef = useRef<any>(null);
  const lastTranscribedRef = useRef('');
  const isSubmittingVoiceRef = useRef(false);
  const isListeningRef = useRef(false);

  const conv = activeCall?.conversation;
  const isAiCall = Boolean(
    conv &&
    (conv.id === 'chatly_ai' ||
      conv.otherUserId === 'chatly_ai' ||
      conv.role === 'AI Assistant' ||
      conv.name.toLowerCase().includes('ai'))
  );

  const cleanForSpeech = (raw: string): string => {
    return raw
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*#_`>~-]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const stopListening = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      return;
    }

    if (isAiSpeakingRef.current || isMutedRef.current || callStatusRef.current !== 'connected' || isAiThinking) {
      return;
    }

    stopListening();

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = speechLangRef.current;

      const triggerVoiceSubmit = (textToSubmit: string) => {
        const cleaned = textToSubmit.trim();
        if (!cleaned || cleaned.length < 2 || isAiThinking || isAiSpeakingRef.current || isSubmittingVoiceRef.current) {
          return;
        }
        isSubmittingVoiceRef.current = true;
        lastTranscribedRef.current = '';
        setUserSpokenText('');
        stopListening();
        handleAskAiVoice(cleaned);
      };

      rec.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        isSubmittingVoiceRef.current = false;
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript + ' ';
          }
        }

        const currentSpoken = (final || interim).trim();
        if (currentSpoken) {
          setUserSpokenText(currentSpoken);
          lastTranscribedRef.current = currentSpoken;

          if (submitTimeoutRef.current) {
            clearTimeout(submitTimeoutRef.current);
          }
          submitTimeoutRef.current = setTimeout(() => {
            if (lastTranscribedRef.current && lastTranscribedRef.current.length > 1) {
              triggerVoiceSubmit(lastTranscribedRef.current);
            }
          }, 1100);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
        } else if (e.error !== 'no-speech') {
          console.warn('Speech recognition warning:', e.error);
        }
      };

      rec.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        if (lastTranscribedRef.current && lastTranscribedRef.current.trim().length > 1 && !isSubmittingVoiceRef.current) {
          triggerVoiceSubmit(lastTranscribedRef.current);
          return;
        }
        if (callStatusRef.current === 'connected' && !isMutedRef.current && !isAiSpeakingRef.current && !isAiThinking) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (callStatusRef.current === 'connected' && !isMutedRef.current && !isAiSpeakingRef.current && !isAiThinking) {
              startListening();
            }
          }, 300);
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.warn('Speech recognition init error:', err);
    }
  };

  const speakAiResponse = (text: string) => {
    const cleanText = cleanForSpeech(text).slice(0, 450);
    setAiSpeechText(cleanText || text);

    stopListening();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (safetyUtteranceTimeoutRef.current) {
        clearTimeout(safetyUtteranceTimeoutRef.current);
        safetyUtteranceTimeoutRef.current = null;
      }

      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtteranceRef.current = utterance;
      (window as any).__activeUtterance = utterance;

      utterance.volume = isLoudspeaker ? 1.0 : 0.6;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const isUrdu = /[\u0600-\u06FF]/.test(cleanText) || speechLangRef.current.startsWith('ur') || /\b(aap|kya|main|theek|kese|shukriya|madad|batao)\b/i.test(cleanText);
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = isUrdu
          ? (voices.find((v) => v.lang.startsWith('ur')) || voices.find((v) => v.lang.startsWith('hi')) || voices.find((v) => v.lang.startsWith('en')))
          : (voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))) || voices.find((v) => v.lang.startsWith('en')) || voices[0]);
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      const handleDone = () => {
        if (safetyUtteranceTimeoutRef.current) {
          clearTimeout(safetyUtteranceTimeoutRef.current);
          safetyUtteranceTimeoutRef.current = null;
        }
        (window as any).__activeUtterance = null;
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        currentUtteranceRef.current = null;
        if (callStatusRef.current === 'connected' && !isMutedRef.current) {
          setTimeout(() => {
            startListening();
          }, 250);
        }
      };

      utterance.onend = handleDone;
      utterance.onerror = handleDone;

      const maxSpeakDuration = Math.max(6000, cleanText.length * 90);
      safetyUtteranceTimeoutRef.current = setTimeout(() => {
        if (isAiSpeakingRef.current) {
          window.speechSynthesis.cancel();
          handleDone();
        }
      }, maxSpeakDuration);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAiSpeaking = () => {
    if (safetyUtteranceTimeoutRef.current) {
      clearTimeout(safetyUtteranceTimeoutRef.current);
      safetyUtteranceTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    (window as any).__activeUtterance = null;
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    currentUtteranceRef.current = null;
    startListening();
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (next) {
        stopListening();
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
        }
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = true));
        }
        if (isAiCall && activeCall?.status === 'connected' && !isAiSpeakingRef.current) {
          startListening();
        }
      }
      return next;
    });
  };
  const toggleLoudspeaker = () => {
    setIsLoudspeaker((prev) => {
      const next = !prev;
      const vol = next ? 1.0 : 0.25;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.volume = vol;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.volume = vol;
      }
      return next;
    });
  };

  useEffect(() => {
    const vol = isLoudspeaker ? 1.0 : 0.25;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = vol;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = vol;
    }
  }, [isLoudspeaker]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const vol = isLoudspeaker ? 1.0 : 0.25;
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.volume = vol;
      remoteVideoRef.current.play().catch(() => { });
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = vol;
      remoteAudioRef.current.play().catch(() => { });
    }
  }, [remoteStream, isLoudspeaker]);

  useEffect(() => {
    let ringTimeout: any;
    let countdownInterval: any;

    if (activeCall?.status === 'ringing') {
      setSeconds(0);
      setRingRemaining(30);

      countdownInterval = setInterval(() => {
        setRingRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      ringTimeout = setTimeout(() => {
        endCall();
      }, 30000);
    }

    return () => {
      if (ringTimeout) clearTimeout(ringTimeout);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [activeCall?.status]);

  useEffect(() => {
    let timer: any;
    if (activeCall?.status === 'connected') {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCall?.status]);

  useEffect(() => {
    if (!isAiCall || activeCall?.status !== 'connected') return;

    let audioCtx: AudioContext | null = null;
    let animId: number | null = null;
    let micStream: MediaStream | null = null;

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          micStream = stream;
          localStreamRef.current = stream;
          setLocalStream(stream);

          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              audioCtx = new AudioContextClass();
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 64;
              analyser.smoothingTimeConstant = 0.5;
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const checkLevel = () => {
                if (isMutedRef.current) {
                  setUserVolume(0);
                } else {
                  analyser.getByteFrequencyData(dataArray);
                  let total = 0;
                  for (let i = 0; i < dataArray.length; i++) {
                    total += dataArray[i];
                  }
                  const avg = total / dataArray.length;
                  setUserVolume(avg);
                }
                animId = requestAnimationFrame(checkLevel);
              };
              checkLevel();
            }
          } catch (e) {
            console.warn('Audio analyser error:', e);
          }
        })
        .catch((err) => {
          console.warn('Microphone permission error:', err);
        });
    }

    const callerFirstName = user?.name ? user.name.trim().split(' ')[0] : '';
    const greeting = callerFirstName
      ? `Hey ${callerFirstName}, how can I help you?`
      : 'Hello, how can I help you?';
    const timeout = setTimeout(() => {
      speakAiResponse(greeting);
    }, 600);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
      }
      clearTimeout(timeout);
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      if (safetyUtteranceTimeoutRef.current) {
        clearTimeout(safetyUtteranceTimeoutRef.current);
      }
      (window as any).__activeUtterance = null;
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAiCall, activeCall?.status, user?.name]);

  useEffect(() => {
    if (isAiCall || activeCall?.status !== 'connected' || !conv) return;

    let pc: RTCPeerConnection | null = null;
    let localMediaStream: MediaStream | null = null;
    const sock = getSocket();
    let isRemoteDescSet = false;
    const iceCandidateQueue: RTCIceCandidateInit[] = [];
    let pendingOfferData: any = null;

    const isCaller = !activeCall.isIncoming || activeCall.role === 'caller';
    const isVideoCall = activeCall.type === 'video';

    const flushIceCandidates = async (peer: RTCPeerConnection) => {
      while (iceCandidateQueue.length > 0) {
        const candidate = iceCandidateQueue.shift();
        if (candidate) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('ICE candidate addition error:', e);
          }
        }
      }
    };

    const handleRemoteOffer = async (data: any) => {
      if (data.conversationId !== conv.id) return;
      if (!pc || !pc.signalingState) {
        pendingOfferData = data;
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        isRemoteDescSet = true;
        await flushIceCandidates(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sock?.emit('webrtc:answer', {
          toUserId: conv.otherUserId,
          conversationId: conv.id,
          sdp: answer,
        });
      } catch (e) {
        console.warn('Error handling WebRTC offer:', e);
      }
    };

    const handleRemoteAnswer = async (data: any) => {
      if (!pc || data.conversationId !== conv.id) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        isRemoteDescSet = true;
        await flushIceCandidates(pc);
      } catch (e) {
        console.warn('Error handling WebRTC answer:', e);
      }
    };

    const handleRemoteIceCandidate = async (data: any) => {
      if (data.conversationId !== conv.id || !data.candidate) return;
      if (!pc || !isRemoteDescSet) {
        iceCandidateQueue.push(data.candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.warn('Error adding ICE candidate:', e);
      }
    };

    const handlePeerReady = async (data: any) => {
      if (data.conversationId !== conv.id) return;
      if (isCaller && pc) {
        try {
          if (!pc.localDescription) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sock?.emit('webrtc:offer', {
              toUserId: conv.otherUserId,
              conversationId: conv.id,
              sdp: offer,
            });
          } else {
            sock?.emit('webrtc:offer', {
              toUserId: conv.otherUserId,
              conversationId: conv.id,
              sdp: pc.localDescription,
            });
          }
        } catch (e) {
          console.warn('Error sending offer on peer ready:', e);
        }
      }
    };
    sock?.on('webrtc:offer', handleRemoteOffer);
    sock?.on('webrtc:answer', handleRemoteAnswer);
    sock?.on('webrtc:ice-candidate', handleRemoteIceCandidate);
    sock?.on('webrtc:ready', handlePeerReady);

    const initWebRTC = async () => {
      try {
        const iceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ];

        pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;
        try {
          localMediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideoCall ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
          });
        } catch (mediaErr) {
          console.warn('getUserMedia with video failed, falling back to audio:', mediaErr);
          localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }

        localStreamRef.current = localMediaStream;
        setLocalStream(localMediaStream);
        localMediaStream.getTracks().forEach((track) => {
          if (localMediaStream && pc) {
            pc.addTrack(track, localMediaStream);
          }
        });
        pc.ontrack = (event) => {
          const stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
          setRemoteStream(stream);
          setRemoteStreamAttached(true);

          const vol = isLoudspeaker ? 1.0 : 0.25;
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.volume = vol;
            remoteAudioRef.current.play().catch((err) => console.warn('Audio auto-play caught:', err));
          }
          if (remoteVideoRef.current && isVideoCall) {
            remoteVideoRef.current.srcObject = stream;
            remoteVideoRef.current.volume = vol;
            remoteVideoRef.current.play().catch((err) => console.warn('Video auto-play caught:', err));
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && sock) {
            sock.emit('webrtc:ice-candidate', {
              toUserId: conv.otherUserId,
              conversationId: conv.id,
              candidate: event.candidate,
            });
          }
        };

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sock?.emit('webrtc:offer', {
            toUserId: conv.otherUserId,
            conversationId: conv.id,
            sdp: offer,
          });
        } else {
          sock?.emit('webrtc:ready', {
            toUserId: conv.otherUserId,
            conversationId: conv.id,
          });
          if (pendingOfferData) {
            await handleRemoteOffer(pendingOfferData);
            pendingOfferData = null;
          }
        }
      } catch (err) {
        console.warn('WebRTC initialization error:', err);
      }
    };

    initWebRTC();

    return () => {
      sock?.off('webrtc:offer', handleRemoteOffer);
      sock?.off('webrtc:answer', handleRemoteAnswer);
      sock?.off('webrtc:ice-candidate', handleRemoteIceCandidate);
      sock?.off('webrtc:ready', handlePeerReady);

      if (localMediaStream) {
        localMediaStream.getTracks().forEach((t) => t.stop());
      }
      if (pc) {
        pc.close();
      }
      pcRef.current = null;
      localStreamRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      setRemoteStreamAttached(false);
    };
  }, [isAiCall, activeCall?.status, conv?.id, activeCall?.type]);

  const handleAskAiVoice = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isAiThinking) return;

    if (/[\u0600-\u06FF]/.test(q) || /\b(kya|kia|kaise|kese|kesi|kasa|haal|hal|theek|thik|aap|tum|main|hum|mera|meri|mujhe|mujhko|batao|bataiye|karo|karein|kyun|q|kyu|kab|kahan|kidhar|salam|assalam|walaikum|aoa|shukriya|meharbani|madad|bhai|yaar|acha|nahi|nhi|hai|hain|hoon|ho|tha|thi|the)\b/i.test(q)) {
      if (speechLangRef.current !== 'ur-PK') {
        setSpeechLang('ur-PK');
        speechLangRef.current = 'ur-PK';
      }
    } else {
      if (speechLangRef.current !== 'en-US') {
        setSpeechLang('en-US');
        speechLangRef.current = 'en-US';
      }
    }

    setVoiceQueryInput('');
    setIsAiThinking(true);
    setAiSpeechText(`Thinking: "${q}"...`);

    try {
      const response = await sendCopilotQueryApi(q);
      const text = response?.content || 'I have processed your query and I am ready to assist you.';
      speakAiResponse(text);
    } catch (err: any) {
      speakAiResponse('Sorry, I encountered an issue. Please try again.');
    } finally {
      setIsAiThinking(false);
      isSubmittingVoiceRef.current = false;
    }
  };

  const handleEndCall = () => {
    stopListening();
    if (safetyUtteranceTimeoutRef.current) {
      clearTimeout(safetyUtteranceTimeoutRef.current);
      safetyUtteranceTimeoutRef.current = null;
    }
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    (window as any).__activeUtterance = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setRemoteStreamAttached(false);
    endCall();
  };

  if (!activeCall || !conv) return null;

  const isVideoCall = activeCall.type === 'video' && !isAiCall;
  const isRinging = activeCall.status === 'ringing';
  const isIncoming = Boolean(activeCall.isIncoming);

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const quickVoicePrompts = [
    'What can you do?',
    'Tell me a fun fact',
    'Summarize my conversations',
    'Help me draft a message',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center">
        <div className="w-full flex items-center justify-between p-4 bg-slate-900/60 z-10 border-b border-slate-800/60">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            {isAiCall ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <RiSparkling2Fill className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Chatly AI Voice Assistant (Powered by Gemini)</span>
              </span>
            ) : (
              <>
                <FiShield className="w-4 h-4" />
                <span>End-to-End Encrypted Call</span>
              </>
            )}
          </div>
          <span className="font-mono text-xs text-slate-300">
            {isRinging ? (
              <span className="text-amber-400 font-medium">
                {isIncoming ? 'Incoming Call...' : `Ringing... (${ringRemaining}s)`}
              </span>
            ) : (
              formatCallTime(seconds)
            )}
          </span>
        </div>
        <div className="w-full min-h-[320px] flex flex-col items-center justify-center p-6 relative">
          {isIncoming && isRinging ? (
            <div className="flex flex-col items-center gap-5 text-center my-4 animate-in fade-in">
              <div className="relative">
                <Avatar
                  name={conv.name}
                  avatarUrl={conv.avatar}
                  size="xl"
                  className="shadow-2xl ring-4 ring-emerald-500 animate-pulse"
                />
                <span className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-60" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{conv.name}</h3>
                <p className="text-sm text-emerald-400 font-medium mt-1">
                  Incoming {activeCall.type === 'video' ? 'Video' : 'Audio'} Call...
                </p>
                <p className="text-xs text-slate-400 mt-1">Tap Answer to connect</p>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <button
                  type="button"
                  onClick={rejectCall}
                  className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <FiPhoneOff className="w-5 h-5" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  onClick={acceptCall}
                  className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all animate-bounce cursor-pointer"
                >
                  <FiPhone className="w-5 h-5" />
                  <span>Answer Call</span>
                </button>
              </div>
            </div>
          ) : isRinging && !isIncoming ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative">
                <Avatar name={conv.name} avatarUrl={conv.avatar} size="xl" className="shadow-2xl ring-4 ring-emerald-500/40" />
                <span className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping opacity-60" />
                <span className="absolute -inset-2 rounded-full border border-emerald-500/40 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">{conv.name}</h3>
                <p className="text-sm text-emerald-400 font-medium mt-1">
                  Ringing {activeCall.type === 'video' ? 'Video' : 'Audio'} Call...
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Auto disconnect in {ringRemaining}s
                </p>
              </div>
            </div>
          ) : isVideoCall ? (
            <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-gradient-to-tr from-slate-900 to-slate-950 flex items-center justify-center border border-slate-700/80 shadow-2xl">
              <video
                ref={(el) => {
                  remoteVideoRef.current = el;
                  if (el && remoteStream && el.srcObject !== remoteStream) {
                    el.srcObject = remoteStream;
                    el.play().catch(() => { });
                  }
                }}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${remoteStreamAttached ? 'opacity-100' : 'opacity-0'
                  }`}
              />
              {!remoteStreamAttached && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xs">
                  <Avatar name={conv.name} avatarUrl={conv.avatar} size="xl" className="shadow-2xl ring-4 ring-emerald-500/40" />
                  <p className="text-sm font-semibold text-white mt-3">{conv.name}</p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Connecting live video stream...</span>
                  </p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 border border-white/10 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{conv.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">HD</span>
              </div>
              <div className="absolute top-3 right-3 w-28 h-36 rounded-2xl bg-slate-950 border-2 border-emerald-500/80 overflow-hidden shadow-2xl flex items-center justify-center z-10">
                {!isVideoOff ? (
                  <video
                    ref={(el) => {
                      localVideoRef.current = el;
                      if (el && localStream && el.srcObject !== localStream) {
                        el.srcObject = localStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                    <FiVideoOff className="w-6 h-6 text-amber-400 mb-1" />
                    <span className="text-[10px] font-semibold text-slate-300">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-medium text-emerald-300">
                  You
                </div>
              </div>
            </div>
          ) : isAiCall && activeCall.status === 'connected' ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="relative group">
                <Avatar name="Chatly AI" avatarUrl={conv.avatar} size="xl" className="shadow-2xl ring-4 ring-emerald-500/50" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold shadow-md">
                  AI
                </span>
              </div>

              <div className="text-center w-full">
                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                  <span>Chatly AI Voice Assistant</span>
                  <RiSparkling2Fill className="text-emerald-400 w-4 h-4" />
                </h3>

                <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isAiSpeaking
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : isListening
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isAiThinking
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAiSpeaking
                          ? 'bg-blue-400 animate-pulse'
                          : isListening
                          ? 'bg-emerald-400 animate-ping'
                          : isAiThinking
                          ? 'bg-amber-400 animate-spin'
                          : 'bg-slate-500'
                      }`}
                    />
                    <span>
                      {isAiThinking
                        ? 'AI Thinking...'
                        : isAiSpeaking
                        ? 'AI Speaking Live'
                        : isListening
                        ? 'Listening to your voice...'
                        : 'Microphone Standby'}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const next = speechLang === 'ur-PK' ? 'en-US' : 'ur-PK';
                      setSpeechLang(next);
                      speechLangRef.current = next;
                      stopListening();
                      setTimeout(startListening, 200);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
                    title="Switch voice language between Urdu and English"
                  >
                    <FiGlobe className="w-3 h-3" />
                    <span>{speechLang === 'ur-PK' ? 'اردو / Roman Urdu' : 'English (US)'}</span>
                  </button>

                  {isAiSpeaking && (
                    <button
                      type="button"
                      onClick={stopAiSpeaking}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
                      title="Interrupt AI"
                    >
                      <FiSquare className="w-3 h-3 fill-current" />
                      <span>Stop AI</span>
                    </button>
                  )}

                  {!isListening && !isAiSpeaking && !isAiThinking && (
                    <button
                      type="button"
                      onClick={startListening}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
                      title="Start listening"
                    >
                      <FiMic className="w-3 h-3" />
                      <span>Speak</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 my-1 h-9">
                {[30, 55, 40, 85, 110, 80, 50, 70, 95, 35].map((baseH, i) => {
                  let barHeight = 8;
                  if (isAiSpeaking) {
                    barHeight = Math.max(8, baseH * 0.28);
                  } else if (isListening) {
                    const dynamicBoost = (userVolume / 100) * baseH * 0.75;
                    barHeight = Math.max(8, dynamicBoost + 8);
                  }
                  return (
                    <span
                      key={i}
                      style={{
                        height: `${barHeight}px`,
                        transition: 'height 0.08s ease',
                      }}
                      className={`w-1.5 rounded-full ${
                        isAiSpeaking
                          ? 'bg-blue-400 animate-pulse'
                          : isListening
                          ? userVolume > 15
                            ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                            : 'bg-emerald-400/70'
                          : 'bg-slate-600'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Live Heard User Voice */}
              {userSpokenText && (
                <div className="w-full max-w-md px-3 py-1.5 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-xs text-emerald-300 text-center animate-in fade-in">
                  🎙️ Heard: <span className="font-semibold text-white">"{userSpokenText}"</span>
                </div>
              )}

              {/* AI Speech Transcript Box */}
              <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-200 text-center shadow-inner max-h-24 overflow-y-auto">
                <p className="italic leading-relaxed font-sans">"{aiSpeechText}"</p>
              </div>

              {/* Quick Voice Prompts */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1 w-full max-w-md">
                {quickVoicePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleAskAiVoice(prompt)}
                    disabled={isAiThinking}
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-emerald-950/80 hover:border-emerald-600 border border-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>

              {/* Interactive Query Box for Voice / Text hybrid */}
              <div className="w-full max-w-md flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={voiceQueryInput}
                  onChange={(e) => setVoiceQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAskAiVoice(voiceQueryInput);
                    }
                  }}
                  placeholder="Ask Chatly AI anything..."
                  className="flex-1 bg-slate-800/90 border border-slate-700 text-xs text-white rounded-full px-4 py-2 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => handleAskAiVoice(voiceQueryInput)}
                  disabled={!voiceQueryInput.trim() || isAiThinking}
                  className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer"
                  title="Send to AI Voice"
                >
                  <FiSend className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar name={conv.name} avatarUrl={conv.avatar} size="xl" className="shadow-2xl ring-4 ring-emerald-500/30" />
              </div>
              <h3 className="text-xl font-bold mt-2 text-white">{conv.name}</h3>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected • Audio Call Live</span>
              </p>
            </div>
          )}
        </div>
        {!(isIncoming && isRinging) && (
          <div className="w-full p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-colors cursor-pointer ${isMuted ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
              <span className="text-[8px] font-medium mt-0.5 leading-none">
                {isMuted ? 'Muted' : 'Mic'}
              </span>
            </button>
            {activeCall.type === 'video' && !isAiCall && (
              <button
                type="button"
                onClick={() => {
                  setIsVideoOff((prev) => {
                    const next = !prev;
                    if (localStreamRef.current) {
                      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !next));
                    }
                    return next;
                  });
                }}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-colors cursor-pointer ${isVideoOff ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? <FiVideoOff className="w-5 h-5" /> : <FiVideo className="w-5 h-5" />}
                <span className="text-[8px] font-medium mt-0.5 leading-none">
                  {isVideoOff ? 'Cam Off' : 'Cam On'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleLoudspeaker}
              className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${isLoudspeaker
                  ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              title={isLoudspeaker ? 'Loudspeaker: ON (Full Volume)' : 'Ear Mode: Normal (Click for Loudspeaker)'}
            >
              <FiVolume2 className={`w-5 h-5 ${isLoudspeaker ? 'scale-110 text-white' : 'opacity-70 text-slate-300'}`} />
              <span className="text-[8px] font-medium mt-0.5 leading-none">
                {isLoudspeaker ? 'Speaker' : 'Ear'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all ml-2 cursor-pointer"
              title="End Call"
            >
              <FiPhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
