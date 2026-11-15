import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { processVoiceQuestion } from '../../services/api';

const suggestions = [
  'Meri fasal ke patte peele ho rahe hain, kya karun?',
  'Rabi season mein loamy soil ke liye kaunsi fasal achhi hai?',
  'PM Kisan scheme ke liye eligibility kya hai?',
  'Meri fasal ko kitni baar paani dena chahiye?',
];

const actionRoutes = {
  OPEN_WEATHER: { path: '/farmer/weather', label: 'Weather' },
  OPEN_DISEASE_DETECTION: { path: '/farmer/disease-detection', label: 'Disease Detection' },
  OPEN_GOVERNMENT_BENEFITS: { path: '/farmer/government-schemes', label: 'Government Schemes' },
  OPEN_MARKETPLACE: { path: '/farmer/marketplace', label: 'Marketplace' },
  OPEN_FARM_RECORDS: { path: '/farmer/farm-records', label: 'Farm Records' },
  OPEN_EXPERT_CONSULTATION: { path: '/farmer/experts', label: 'Expert Consultation' },
  OPEN_PROFILE: { path: '/farmer/profile', label: 'Profile' },
};

const statusLabels = {
  ready: 'Ready',
  listening: 'Listening',
  processing: 'Processing',
  answerReady: 'Answer Ready',
  error: 'Needs attention',
};

function getRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function VoiceAssistant({ compact = false }) {
  const recognitionRef = useRef(null);
  const statusRef = useRef('ready');
  const [language, setLanguage] = useState('hi-IN');
  const [status, setStatusState] = useState('ready');
  const [transcript, setTranscript] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [lastQuestion, setLastQuestion] = useState('');
  const [error, setError] = useState('');
  const [providerNotice, setProviderNotice] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const setStatus = (nextStatus) => {
    statusRef.current = nextStatus;
    setStatusState(nextStatus);
  };

  useEffect(() => {
    setIsSupported(Boolean(getRecognitionConstructor()));
    return () => {
      recognitionRef.current?.abort?.();
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel?.();
    setIsSpeaking(false);
  };

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
      return false;
    }

    stopSpeaking();
    const plainText = String(text)
      .replace(/[*_`#>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = language;
    utterance.rate = language === 'hi-IN' ? 0.88 : 0.95;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => (
      voice.lang?.toLowerCase() === language.toLowerCase()
      || voice.lang?.toLowerCase().startsWith(language.slice(0, 2).toLowerCase())
    ));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    return true;
  };

  const processQuestion = async (question) => {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion || statusRef.current === 'processing') return;

    setStatus('processing');
    setError('');
    setProviderNotice('');
    setTranscript(cleanQuestion);
    setTypedQuestion('');
    setLastQuestion(cleanQuestion);
    setConversation((items) => [...items, { speaker: 'You', text: cleanQuestion, time: timestamp() }]);

    try {
      const result = await processVoiceQuestion({ text: cleanQuestion, language });
      const answer = result?.data || result;
      if (!answer?.response) throw new Error('Empty assistant response');

      setConversation((items) => [...items, { speaker: 'AgriVerse AI', text: answer.response, time: timestamp(), answer }]);
      setProviderNotice(answer.providerError || '');
      setStatus('answerReady');
      speakText(answer.response);
    } catch (requestError) {
      setStatus('error');
      setError(requestError?.response?.data?.message || 'Answer receive nahi ho paaya. Please Retry dabayein.');
    }
  };

  const startListening = () => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setIsSupported(false);
      setStatus('error');
      setError('Is browser mein speech recognition supported nahi hai. Neeche text box se sawal type karein.');
      return;
    }

    recognitionRef.current?.abort?.();
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
      const finalResult = event.results[event.results.length - 1];
      if (finalResult?.isFinal) {
        recognition.stop();
        processQuestion(text);
      }
    };
    recognition.onerror = (event) => {
      setStatus('error');
      const messages = {
        'not-allowed': 'Microphone permission denied hai. Browser address bar se microphone allow karke dobara try karein.',
        'no-speech': 'Awaaz detect nahi hui. Microphone ke paas clearly bolkar dobara try karein.',
        network: 'Speech recognition network error. Text input fallback use karein.',
      };
      setError(messages[event.error] || 'Speech recognition fail ho gaya. Text input fallback use karein.');
    };
    recognition.onend = () => {
      if (statusRef.current === 'listening') setStatus('ready');
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setStatus('error');
      setError('Microphone start nahi ho paaya. Permission check karke Retry karein.');
    }
  };

  const clearConversation = () => {
    recognitionRef.current?.abort?.();
    setConversation([]);
    setTranscript('');
    setLastQuestion('');
    setError('');
    setProviderNotice('');
    setStatus('ready');
  };

  const latestAnswer = [...conversation].reverse().find((message) => message.answer)?.answer;

  return (
    <section className={`mx-auto rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-7 ${compact ? '' : 'max-w-5xl'}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">AgriVerse AI</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Ask your farming assistant</h1>
          <p className="mt-2 text-slate-600">Hindi, Hinglish या English में बोलें या लिखें। Assistant आपके सवाल के अनुसार जवाब और relevant features दिखाएगा।</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Language
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="hi-IN">Hindi / Hinglish</option>
                <option value="en-IN">English</option>
              </select>
            </label>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === 'listening' ? 'bg-red-100 text-red-700' : status === 'processing' ? 'bg-amber-100 text-amber-800' : status === 'answerReady' ? 'bg-sky-100 text-sky-700' : status === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{statusLabels[status]}</span>
          </div>
        </div>
        <button type="button" aria-label="Start microphone" onClick={startListening} disabled={status === 'processing'} className={`flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-full text-3xl text-white shadow-lg transition focus:outline-none focus:ring-4 focus:ring-emerald-200 ${status === 'listening' ? 'animate-pulse bg-red-600' : 'bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400'}`}>
          🎤
        </button>
      </div>

      {!isSupported && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Voice recognition इस browser में उपलब्ध नहीं है। Text input अभी भी काम करेगा।</div>}
      {error && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{error}</span>{lastQuestion && <button type="button" onClick={() => processQuestion(lastQuestion)} className="rounded-lg bg-red-700 px-3 py-2 font-semibold text-white">Retry</button>}</div>}
      {providerNotice && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{providerNotice} Local safe guidance दिखाई जा रही है। AI provider enable करने के लिए backend में GROQ_API_KEY configure करें।</div>}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">What I heard</p>
        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-700">{transcript || 'Microphone से बोले गए शब्द यहाँ दिखेंगे।'}</p>
        <form onSubmit={(event) => { event.preventDefault(); processQuestion(typedQuestion); }} className="mt-4 flex gap-2">
          <input value={typedQuestion} onChange={(event) => setTypedQuestion(event.target.value)} placeholder="Type your question" aria-label="Type your farming question" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          <button type="submit" disabled={!typedQuestion.trim() || status === 'processing'} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400">Send</button>
        </form>
      </div>

      {status === 'processing' && <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><span className="animate-pulse">●●●</span> Answer तैयार किया जा रहा है...</div>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">Try asking</p>
        <button type="button" onClick={clearConversation} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Clear chat</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => processQuestion(suggestion)} className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-left text-sm text-emerald-800 hover:bg-emerald-50">{suggestion}</button>)}</div>

      {latestAnswer && <div className="mt-5 flex flex-wrap gap-2">
        {latestAnswer.actions?.map((action) => actionRoutes[action] ? <Link key={action} to={actionRoutes[action].path} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">{actionRoutes[action].label} →</Link> : null)}
        {isSpeaking
          ? <button type="button" onClick={stopSpeaking} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Stop speaking</button>
          : <button type="button" onClick={() => speakText(latestAnswer.response)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">🔊 Speak answer</button>}
      </div>}

      {conversation.length > 0 && <div className="mt-6 max-h-96 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 p-4">{conversation.map((message, index) => <div key={`${message.time}-${index}`} className={`rounded-xl p-3 ${message.speaker === 'You' ? 'bg-slate-100' : 'bg-emerald-50'}`}><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-slate-700">{message.speaker}</span><span className="text-[10px] text-slate-500">{message.time}</span></div><p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{message.text}</p></div>)}</div>}
    </section>
  );
}

export default VoiceAssistant;
