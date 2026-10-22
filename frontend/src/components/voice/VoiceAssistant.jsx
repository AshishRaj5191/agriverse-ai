import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { processVoiceQuestion } from '../../services/api';

const suggestions = [
  'Kal baarish hogi?',
  'Fasal mein disease kaise check karun?',
  'PM Kisan ke baare mein batao',
  'Fasal ke liye loan kaise milega?',
  'Beej kahan se kharid sakta hoon?',
];

const actionRoutes = {
  OPEN_WEATHER: { path: '/farmer/weather', label: 'Open Weather' },
  OPEN_DISEASE_DETECTION: { path: '/farmer/farm-records', label: 'Open Disease Detection' },
  OPEN_GOVERNMENT_BENEFITS: { path: '/farmer/government-schemes', label: 'Open Government Benefits' },
  OPEN_MARKETPLACE: { path: '/farmer/marketplace', label: 'Open Marketplace' },
  OPEN_PROFILE: { path: '/farmer/profile', label: 'Open Profile' },
};

const statusLabels = {
  idle: 'Tap to speak',
  listening: 'Listening...',
  processing: 'Understanding your request...',
  speaking: 'Speaking...',
  error: 'Voice assistant needs attention',
};

function getRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function VoiceAssistant({ compact = false }) {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [language, setLanguage] = useState('hi-IN');
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(Boolean(getRecognitionConstructor()));
    return () => {
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  const speakResponse = (text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.94;
    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('idle');
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const processQuestion = async (question) => {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion) return;
    setStatus('processing');
    setError('');
    setTranscript(cleanQuestion);
    setTypedQuestion('');
    setConversation((items) => [...items, { speaker: 'You', text: cleanQuestion, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

    try {
      const result = await processVoiceQuestion({ text: cleanQuestion, language });
      const assistantResponse = result?.data || result;
      setResponse(assistantResponse);
      setConversation((items) => [...items, { speaker: 'AgriVerse AI', text: assistantResponse.response, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      speakResponse(assistantResponse.response);
    } catch (requestError) {
      setStatus('error');
      setError(requestError?.response?.data?.message || 'Main abhi aapki request process nahi kar paaya. Kripya dobara try karein.');
    }
  };

  const startListening = () => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setIsSupported(false);
      setStatus('error');
      setError('Voice recognition is not supported in this browser. Please use a supported browser or type your question below.');
      return;
    }

    recognitionRef.current?.stop?.();
    const recognition = new Recognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => {
      setStatus('listening');
      setError('');
      setTranscript('');
    };
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((item) => item[0].transcript).join(' ');
      setTranscript(text);
      if (event.results[event.results.length - 1].isFinal) processQuestion(text);
    };
    recognition.onerror = (event) => {
      setStatus('error');
      setError(event.error === 'not-allowed' ? 'AgriVerse needs microphone access so you can ask questions using your voice.' : 'Main aapki awaaz samajh nahi paaya. Please thoda dheere aur clear bolkar dobara try karein.');
    };
    recognition.onend = () => {
      if (status === 'listening') setStatus('idle');
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel?.();
    setStatus('idle');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    processQuestion(typedQuestion);
  };

  const openAction = () => {
    const route = actionRoutes[response?.action];
    if (route) navigate(route.path);
  };

  const clearConversation = () => {
    stopSpeaking();
    setConversation([]);
    setResponse(null);
    setTranscript('');
    setError('');
  };

  return (
    <section className={`rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-7 ${compact ? '' : 'mx-auto max-w-5xl'}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">AgriVerse AI</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">🎙️ Ask your farming assistant</h1>
          <p className="mt-2 text-slate-600">Speak naturally in Hindi, Hinglish or English about your crops, weather, schemes and farm needs.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Voice language<select value={language} onChange={(event) => setLanguage(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="hi-IN">Hindi / Hinglish</option><option value="en-IN">English</option></select></label>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === 'listening' ? 'bg-red-100 text-red-700' : status === 'processing' ? 'bg-amber-100 text-amber-800' : status === 'speaking' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>{statusLabels[status]}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3">
          <button type="button" aria-label="Start voice assistant" onClick={status === 'speaking' ? stopSpeaking : startListening} className={`relative flex h-24 w-24 items-center justify-center rounded-full text-3xl text-white shadow-lg transition focus:outline-none focus:ring-4 focus:ring-emerald-200 ${status === 'listening' ? 'animate-pulse bg-red-600' : status === 'speaking' ? 'bg-sky-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
            {status === 'speaking' ? '⏹' : '🎤'}
          </button>
          {status === 'speaking' ? <button type="button" onClick={stopSpeaking} className="text-sm font-semibold text-slate-700">Stop speaking</button> : null}
        </div>
      </div>

      {!isSupported ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Voice recognition is not supported in this browser. Please use a supported browser or type your question below.</div> : null}
      {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recognized transcript</p>
          <p className="mt-3 min-h-14 text-sm leading-6 text-slate-700">{transcript || 'Your spoken question will appear here.'}</p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input value={typedQuestion} onChange={(event) => setTypedQuestion(event.target.value)} placeholder="Type your question" aria-label="Type your farming question" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">Ask</button>
          </form>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">AgriVerse AI response</p>
          <p className="mt-3 min-h-14 text-sm leading-6 text-slate-700">{response?.response || 'Ask me about farming, weather, crop problems, schemes or agricultural support.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">{response?.action && response.action !== 'NONE' && actionRoutes[response.action] ? <button type="button" onClick={openAction} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">{actionRoutes[response.action].label} →</button> : null}{response?.response ? <button type="button" onClick={() => speakResponse(response.response)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">🔊 Speak response</button> : null}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800">Try asking</p><button type="button" onClick={clearConversation} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Clear conversation</button></div>
        <div className="mt-3 flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => processQuestion(suggestion)} className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-left text-sm text-emerald-800 hover:bg-emerald-50">{suggestion}</button>)}</div>
      </div>

      {conversation.length ? <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Conversation</p><div className="mt-3 max-h-72 space-y-3 overflow-y-auto">{conversation.map((message, index) => <div key={`${message.timestamp}-${index}`} className={`rounded-xl p-3 ${message.speaker === 'You' ? 'bg-slate-100' : 'bg-emerald-50'}`}><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-slate-700">{message.speaker}</span><span className="text-[10px] text-slate-500">{message.timestamp}</span></div><p className="mt-1 text-sm leading-6 text-slate-700">{message.text}</p></div>)}</div></div> : null}
    </section>
  );
}

export default VoiceAssistant;
