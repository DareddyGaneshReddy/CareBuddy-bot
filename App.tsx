
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { Message, ConnectionStatus } from './types';
import { MODEL_NAME, SYSTEM_INSTRUCTION, DEFAULT_VOICE } from './constants';
import { encode, decode, decodeAudioData } from './services/audioUtils';
import Visualizer from './components/Visualizer';
import TranscriptList from './components/TranscriptList';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBuddySpeaking, setIsBuddySpeaking] = useState(false);
  const [isBuddyThinking, setIsBuddyThinking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(false);
  const isConnectingRef = useRef(false);

  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const cleanupAudio = useCallback(() => {
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    if (audioContextsRef.current) {
      try {
        if (audioContextsRef.current.input.state !== 'closed') audioContextsRef.current.input.close();
        if (audioContextsRef.current.output.state !== 'closed') audioContextsRef.current.output.close();
      } catch (e) {}
      audioContextsRef.current = null;
    }
    cleanupAudio();
    setStatus(ConnectionStatus.DISCONNECTED);
    setIsBuddySpeaking(false);
    setIsBuddyThinking(false);
    setIsUserSpeaking(false);
    isConnectingRef.current = false;
  }, [cleanupAudio]);

  const addMessage = (role: 'user' | 'buddy', text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString() + Math.random(), role, text, timestamp: Date.now() }
    ]);
  };

  const startSession = async () => {
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;
    
    try {
      setHasStarted(true);
      setStatus(ConnectionStatus.CONNECTING);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      await inputCtx.resume();
      await outputCtx.resume();
      audioContextsRef.current = { input: inputCtx, output: outputCtx };
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED);
            isConnectingRef.current = false;
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMutedRef.current || !sessionRef.current) {
                setIsUserSpeaking(false);
                return;
              }
              const inputData = e.inputBuffer.getChannelData(0);
              const sum = inputData.reduce((acc, val) => acc + Math.abs(val), 0);
              const avg = sum / inputData.length;
              setIsUserSpeaking(avg > 0.015);
              
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              currentInputRef.current += message.serverContent.inputTranscription.text;
            } else if (message.serverContent?.outputTranscription) {
              setIsBuddyThinking(true);
              currentOutputRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              if (currentInputRef.current) addMessage('user', currentInputRef.current);
              if (currentOutputRef.current) addMessage('buddy', currentOutputRef.current);
              currentInputRef.current = '';
              currentOutputRef.current = '';
              setIsBuddyThinking(false);
            }
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextsRef.current) {
              setIsBuddySpeaking(true);
              const audioCtx = audioContextsRef.current.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
              try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                const sourceNode = audioCtx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(audioCtx.destination);
                sourceNode.onended = () => {
                  sourcesRef.current.delete(sourceNode);
                  if (sourcesRef.current.size === 0) setIsBuddySpeaking(false);
                };
                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(sourceNode);
              } catch (e) {}
            }
            if (message.serverContent?.interrupted) {
              cleanupAudio();
              setIsBuddySpeaking(false);
              setIsBuddyThinking(false);
              currentOutputRef.current = '';
            }
          },
          onerror: (err) => { 
            console.error(err);
            setStatus(ConnectionStatus.ERROR);
            isConnectingRef.current = false;
            setIsBuddyThinking(false);
          },
          onclose: () => { stopSession(); }
        },
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: DEFAULT_VOICE } } },
          systemInstruction: SYSTEM_INSTRUCTION,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (error) { 
      setStatus(ConnectionStatus.ERROR); 
      isConnectingRef.current = false;
    }
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <div className="h-full w-full flex flex-col relative transition-all duration-1000">
      {/* HUD Header */}
      <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-100 uppercase">System: CareBuddy</h1>
          </div>
          <div className="flex items-center gap-3 pl-4">
             <div className={`h-1 w-1 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'}`} />
             <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-500">
               {status === ConnectionStatus.CONNECTED ? 'Uplink Established' : 'System Standby'}
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowResources(true)}
            className="text-[9px] uppercase tracking-widest font-black text-slate-400 hover:text-amber-500 transition-all px-6 py-2 border border-slate-800 bg-slate-900/40 hover:border-amber-500/50"
          >
            Secondary Resources
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* The Core Neural Visualizer */}
        <div className={`transition-all duration-[2000ms] z-30 ${hasStarted ? 'scale-75 -translate-y-40' : 'scale-100'}`}>
          <Visualizer 
            active={status === ConnectionStatus.CONNECTED} 
            isBuddy={isBuddySpeaking} 
            isThinking={isBuddyThinking}
            isSpeaking={(isBuddySpeaking || isUserSpeaking) && status === ConnectionStatus.CONNECTED} 
            isMuted={isMuted}
          />
        </div>

        {/* HUD Data Stream (Transcripts) */}
        {hasStarted && (
           <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none pt-48">
              <div className="h-full w-full max-w-4xl mx-auto flex flex-col pointer-events-auto no-scrollbar">
                 <TranscriptList messages={messages} />
              </div>
           </div>
        )}

        {/* Real-time Insights (HUD Tooltip) */}
        {(currentInputRef.current || currentOutputRef.current) && (
           <div className="fixed bottom-52 left-0 right-0 z-40 flex justify-center px-12 pointer-events-none">
              <div className="hologram-glass px-8 py-5 border-l-4 border-amber-500/50 max-w-2xl text-center">
                 <p className="serif text-xl md:text-2xl text-slate-200 font-light italic leading-relaxed">
                   {currentOutputRef.current || currentInputRef.current}
                 </p>
              </div>
           </div>
        )}

        {/* System Controls */}
        <div className="fixed bottom-14 z-50 flex flex-col items-center gap-8 w-full max-w-xl px-6">
          
          {status === ConnectionStatus.ERROR && (
             <div className="bg-red-950/40 border border-red-500/30 px-6 py-3 rounded flex items-center gap-4 mb-4">
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-widest">Connection Interrupted</span>
                <button onClick={() => { stopSession(); startSession(); }} className="text-[10px] font-black text-white hover:text-red-400 underline uppercase tracking-widest">Reinitialize</button>
             </div>
          )}

          {!hasStarted || status === ConnectionStatus.DISCONNECTED ? (
            <div className="flex flex-col items-center gap-10 animate-in fade-in duration-1000">
              <div className="text-center space-y-4">
                <h2 className="serif text-4xl md:text-5xl text-slate-100 font-light tracking-tight leading-tight">Grounded. Mature. <br/> <span className="text-amber-500 italic">I am here.</span></h2>
                <p className="text-slate-500 text-xs tracking-[0.2em] font-medium uppercase max-w-xs mx-auto">
                   Initiate secure neural uplink for emotional relief.
                </p>
              </div>
              
              <button 
                onClick={startSession}
                disabled={status === ConnectionStatus.CONNECTING}
                className="group flex flex-col items-center"
              >
                <div className="w-24 h-24 border border-slate-800 group-hover:border-amber-500/50 flex items-center justify-center transition-all duration-700 relative">
                   <div className="absolute inset-0 border border-amber-500/10 scale-125 group-hover:scale-150 transition-transform"></div>
                   <div className="w-16 h-16 bg-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:bg-amber-400 transition-colors">
                      <span className="text-black font-black text-xs uppercase tracking-tighter">{status === ConnectionStatus.CONNECTING ? '...' : 'Open'}</span>
                   </div>
                </div>
                <div className="mt-8 flex flex-col items-center gap-1">
                   <span className="text-[9px] uppercase tracking-[0.5em] font-black text-slate-600 group-hover:text-amber-500 transition-colors">Activate Insight</span>
                </div>
              </button>
            </div>
          ) : (
            status !== ConnectionStatus.ERROR && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button 
                  onClick={toggleMute}
                  className={`hologram-glass group flex items-center gap-3 px-8 py-3 transition-all ${isMuted ? 'border-amber-500 bg-amber-500/10' : 'hover:border-amber-500/30'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isMuted ? 'text-amber-400' : 'text-slate-400'}`}>
                    {isMuted ? 'Sensors Off' : 'Active Intake'}
                  </span>
                </button>

                <button 
                  onClick={stopSession}
                  className="hologram-glass group flex items-center gap-3 px-8 py-3 border-red-500/20 hover:border-red-500/50 text-slate-500 hover:text-red-400 transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deactivate Hub</span>
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* Resource HUD */}
      {showResources && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="hologram-glass p-12 max-w-xl w-full border-amber-500/20 space-y-10">
             <div className="space-y-4">
                <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">System Notice</div>
                <h2 className="serif text-4xl text-slate-100 font-light">External Assistance Modules.</h2>
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                  When current processing limits are exceeded, please interface with trained human response units. These are reliable and grounded resources.
                </p>
             </div>
             <div className="grid gap-4">
                <a href="tel:988" className="hologram-glass p-8 border-l-2 border-amber-500/50 hover:bg-amber-500/5 transition-all flex justify-between items-center group">
                   <div className="flex flex-col gap-1">
                     <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Audio Uplink</span>
                     <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tight">988 Lifeline</h3>
                   </div>
                   <div className="w-10 h-10 border border-slate-800 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                      <span className="text-amber-500">→</span>
                   </div>
                </a>
                <a href="sms:741741" className="hologram-glass p-8 border-l-2 border-amber-500/50 hover:bg-amber-500/5 transition-all flex justify-between items-center group">
                   <div className="flex flex-col gap-1">
                     <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Text Buffer</span>
                     <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tight">Crisis Messaging</h3>
                   </div>
                   <div className="w-10 h-10 border border-slate-800 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                      <span className="text-amber-500">→</span>
                   </div>
                </a>
             </div>
             <button 
               onClick={() => setShowResources(false)}
               className="w-full py-4 text-[10px] uppercase tracking-[0.4em] font-black text-slate-500 hover:text-amber-500 transition-colors"
             >
                Close HUD
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
