
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality, GenerateContentResponse, LiveServerMessage } from "@google/genai";

const SYSTEM_PROMPT = "Ти — ШІ-асистент Ігоря Ярового (IGADSFLEX). Твоя мета — допомогти відвідувачам зрозуміти цінність професійної роботи з Meta Ads. Будь лаконічним, преміальним, впевненим. Відповідай українською. Якщо клієнт хоче замовити консультацію або аудит — направляй його до форми внизу сайту або в Telegram до Ігоря.";

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);
  const liveSession = useRef<any>(null);
  const audioContexts = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const nextStartTime = useRef(0);
  const sources = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const initChat = () => {
    if (!chatInstance.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatInstance.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: SYSTEM_PROMPT },
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    initChat();
    try {
      const result = await chatInstance.current.sendMessageStream({ message: userMsg });
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', text: '' }]);
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        fullResponse += c.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullResponse;
          return updated;
        });
      }
    } catch (err) { console.error(err); } finally { setIsTyping(false); }
  };

  const startVoiceSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContexts.current.input = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContexts.current.output = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: SYSTEM_PROMPT + " Говори максимально природно і лаконічно."
        },
        callbacks: {
          onopen: () => {
            const source = audioContexts.current.input!.createMediaStreamSource(stream);
            const scriptProcessor = audioContexts.current.input!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContexts.current.input!.destination);
            setIsVoiceActive(true);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContexts.current.output) {
              const ctx = audioContexts.current.output;
              nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTime.current);
              nextStartTime.current += audioBuffer.duration;
              sources.current.add(source);
              source.onended = () => sources.current.delete(source);
            }
          },
          onerror: (e) => {
            console.error(e);
            setIsVoiceActive(false);
          },
          onclose: () => setIsVoiceActive(false)
        }
      });
      liveSession.current = await sessionPromise;
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="mb-6 w-[350px] md:w-[400px] h-[600px] bg-dark/80 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl"
          >
            <div className="p-6 bg-accent/5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-outfit font-black text-xs uppercase tracking-widest text-white">IGADSFLEX AI</h4>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Online Session</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => { setMode(mode === 'text' ? 'voice' : 'text'); if(mode === 'voice') liveSession.current?.close(); }}
                  className={`p-2 rounded-xl transition-all ${mode === 'voice' ? 'bg-accent text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'hover:bg-white/5 text-white/40'}`}
                >
                  <Mic size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40"><X size={18} /></button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {mode === 'text' ? (
                <>
                  {messages.length === 0 && (
                    <div className="text-center py-20 px-8">
                      <p className="text-white/20 text-xs uppercase tracking-widest leading-loose font-medium">
                        Привіт. Я навчений на досвіді Ігоря. Запитай мене, як ми можемо масштабувати твій ROI.
                      </p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent text-white shadow-lg rounded-tr-none' : 'bg-white/5 text-white/70 rounded-tl-none border border-white/5'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce delay-75" />
                        <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-10">
                   <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 border-accent/20 transition-all duration-500 ${isVoiceActive ? 'bg-accent scale-110 shadow-[0_0_40px_rgba(139,92,246,0.4)]' : 'bg-transparent'}`}>
                      <Mic size={32} className={isVoiceActive ? 'text-white' : 'text-accent'} />
                   </div>
                   <div>
                     <h3 className="text-lg font-outfit font-black uppercase tracking-tight text-white mb-2">
                       {isVoiceActive ? 'Аудіо-зв\'язок активовано' : 'Голосова стратегія'}
                     </h3>
                     <p className="text-white/30 text-[10px] uppercase tracking-widest leading-loose">
                       {isVoiceActive ? 'Я слухаю. Розкажіть про ваш бізнес.' : 'Натисніть для підключення до голосової сесії.'}
                     </p>
                   </div>
                   {!isVoiceActive && (
                    <button 
                      onClick={startVoiceSession} 
                      className="px-10 py-4 bg-accent text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
                    >
                      Розпочати сесію
                    </button>
                   )}
                </div>
              )}
            </div>

            {mode === 'text' && (
              <div className="p-6 border-t border-white/5 bg-dark/50">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ваше запитання про трафік..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent transition-all pr-14 text-white placeholder:text-white/10" 
                  />
                  <button 
                    disabled={!input.trim()} 
                    className="absolute right-3 p-2.5 text-accent disabled:text-white/10 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] relative text-white group"
      >
        <div className="absolute inset-0 bg-accent blur-xl rounded-full opacity-0 group-hover:opacity-40 transition-all duration-500" />
        {isOpen ? <X size={26} className="relative z-10" /> : <MessageCircle size={26} className="relative z-10" />}
      </button>
    </div>
  );
};
