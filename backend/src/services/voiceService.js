const axios = require('axios');
const env = require('../config/env');

const ALLOWED_ACTIONS = new Set([
  'OPEN_WEATHER',
  'OPEN_DISEASE_DETECTION',
  'OPEN_GOVERNMENT_BENEFITS',
  'OPEN_MARKETPLACE',
  'OPEN_PROFILE',
  'OPEN_FARM_RECORDS',
  'OPEN_EXPERT_CONSULTATION',
  'NONE',
]);

const INTENTS = {
  WEATHER: 'WEATHER',
  DISEASE_DETECTION: 'DISEASE_DETECTION',
  CROP_PROBLEM: 'CROP_PROBLEM',
  GOVERNMENT_SCHEME: 'GOVERNMENT_SCHEME',
  AGRICULTURAL_LOAN: 'AGRICULTURAL_LOAN',
  MARKETPLACE: 'MARKETPLACE',
  FARMING_ADVICE: 'FARMING_ADVICE',
  CROP_INFORMATION: 'CROP_INFORMATION',
  FERTILIZER_INFORMATION: 'FERTILIZER_INFORMATION',
  SEED_INFORMATION: 'SEED_INFORMATION',
  IRRIGATION: 'IRRIGATION',
  FARM_EQUIPMENT: 'FARM_EQUIPMENT',
  PROFILE: 'PROFILE',
  GENERAL_AGRICULTURE: 'GENERAL_AGRICULTURE',
  UNKNOWN: 'UNKNOWN',
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function hasGreeting(text) {
  return /(^|\s)(hello|hi|namaste|hey)(\s|$)/i.test(text) || text.includes('नमस्ते');
}

function result(intent, confidence, response, action = 'NONE', extra = {}) {
  const safeAction = ALLOWED_ACTIONS.has(action) ? action : 'NONE';
  return {
    intent,
    confidence,
    response,
    action: safeAction,
    requiresImage: Boolean(extra.requiresImage),
    requiresLocation: Boolean(extra.requiresLocation),
  };
}

function localAnswer(intent, text) {
  const answers = {
    WEATHER: 'Live weather ke liye Weather page par apna city ya farm location search karein. Main bina verified weather data ke forecast nahi bataunga.',
    DISEASE_DETECTION: 'Crop disease ke liye affected leaf ki clear photo upload karein. AI result ko agriculture expert se confirm karein, khaas kar spray ya chemical use se pehle.',
    CROP_PROBLEM: 'Peeli ya murjhati pattiyon ka reason paani, nutrient deficiency, pest ya disease ho sakta hai. Soil moisture check karein, clear photo lein aur Disease Detection ya expert consultation use karein.',
    GOVERNMENT_SCHEME: 'Government Schemes page par PM-Kisan, insurance, loan aur subsidy schemes ko category/state ke hisaab se search karein. Benefit ke liye official portal ki eligibility zaroor check karein.',
    AGRICULTURAL_LOAN: 'Agricultural loan ya KCC ke liye official bank terms, interest rate, collateral aur eligibility compare karein. Application se pehle documents aur repayment conditions verify karein.',
    MARKETPLACE: 'Marketplace route available hai, lekin live product price aur availability verified source ke bina nahi dikhayi jayegi. Local seller aur official invoice se details confirm karein.',
    IRRIGATION: 'Irrigation ka schedule crop, soil aur weather par depend karta hai. Subah ya shaam paani dein, waterlogging se bachein aur soil moisture check karein.',
    FERTILIZER_INFORMATION: 'Fertilizer quantity soil test aur crop stage ke basis par decide karein. Bina soil test ke excess urea ya pesticide use na karein.',
    SEED_INFORMATION: 'Seed kharidte waqt crop variety, season, germination rate, certification aur local climate match check karein.',
    FARMING_ADVICE: 'Specific advice ke liye crop, variety, soil type, crop age aur current problem batayein. Farm record mein details save karke expert se bhi consult kar sakte hain.',
    GENERAL_AGRICULTURE: 'Main crop, soil, irrigation, fertilizer, pest, disease, weather aur government schemes par guidance de sakta hoon. Apna crop aur situation batayein.',
    UNKNOWN: `Aapka sawal "${text}" mila. Kripya crop ya farming situation thodi detail mein batayein, jaise crop name, problem aur location.`,
  };
  return answers[intent] || answers.GENERAL_AGRICULTURE;
}

function contextualActions(intent) {
  const actions = {
    WEATHER: ['OPEN_WEATHER'],
    DISEASE_DETECTION: ['OPEN_DISEASE_DETECTION', 'OPEN_EXPERT_CONSULTATION'],
    CROP_PROBLEM: ['OPEN_DISEASE_DETECTION', 'OPEN_EXPERT_CONSULTATION'],
    GOVERNMENT_SCHEME: ['OPEN_GOVERNMENT_BENEFITS'],
    AGRICULTURAL_LOAN: ['OPEN_GOVERNMENT_BENEFITS'],
    MARKETPLACE: ['OPEN_MARKETPLACE'],
    IRRIGATION: ['OPEN_FARM_RECORDS', 'OPEN_EXPERT_CONSULTATION'],
    FERTILIZER_INFORMATION: ['OPEN_FARM_RECORDS', 'OPEN_EXPERT_CONSULTATION'],
    SEED_INFORMATION: ['OPEN_MARKETPLACE'],
    FARMING_ADVICE: ['OPEN_FARM_RECORDS', 'OPEN_EXPERT_CONSULTATION'],
  };
  return actions[intent] || [];
}

async function answerVoiceQuestion({ text, language, context } = {}) {
  const intentResult = understandVoiceRequest({ text, language, context });
  const promptLanguage = language === 'en-IN' ? 'simple English' : 'simple Hindi/Hinglish';
  let answer = localAnswer(intentResult.intent, text);
  let provider = 'local-safe-fallback';
  let providerError = '';

  if (env.groqApiKey) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: env.groqModel,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: `You are AgriVerse AI, a careful agriculture assistant. Answer in ${promptLanguage}. Give: direct answer, simple explanation, practical next steps, and a short safety note when chemicals, crop health, weather, prices or money are involved. Never invent live weather, market prices, government benefits, or a disease diagnosis. Say when verified data or an image is required. Keep it under 180 words.`,
            },
            { role: 'user', content: text },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${env.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      answer = response.data?.choices?.[0]?.message?.content?.trim() || answer;
      provider = 'groq';
    } catch (error) {
      providerError = 'AI provider request failed. Showing safe local guidance.';
    }
  } else {
    providerError = 'GROQ_API_KEY is not configured. Showing safe local guidance.';
  }

  return {
    ...intentResult,
    response: answer,
    actions: contextualActions(intentResult.intent),
    provider,
    providerError,
    retryable: Boolean(providerError),
  };
}

function understandVoiceRequest(input = {}) {
  const text = normalizeText(input.text);

  if (!text) {
    return result(INTENTS.UNKNOWN, 0, 'Kuch poochhiye. Main weather, crop problems, government schemes aur farming support mein madad kar sakta hoon.');
  }

  if (hasGreeting(text)) {
    return result(INTENTS.GENERAL_AGRICULTURE, 0.98, 'Namaste! Main AgriVerse AI hoon. Aap farming, weather, crop problems, government schemes ya agricultural information ke baare mein pooch sakte hain.');
  }

  if (hasAny(text, ['weather', 'mausam', 'baarish', 'barish', 'rain', 'forecast', 'badal', 'pani pade', 'temperature'])) {
    return result(INTENTS.WEATHER, 0.95, 'Main aapke saved location ka weather check karunga. Current weather service is not configured in this project yet, isliye main koi live forecast invent nahi karunga.', 'OPEN_WEATHER', { requiresLocation: true });
  }

  if (hasAny(text, ['disease detection', 'disease', 'bimari', 'बीमारी', 'keede', 'keeda', 'pest', 'fungus', 'photo check', 'crop ki photo'])) {
    return result(INTENTS.DISEASE_DETECTION, 0.94, 'Fasal ki bimari voice se confirm nahi ho sakti. Affected leaf ya crop ki clear photo upload karke Disease Detection se check karein.', 'OPEN_DISEASE_DETECTION', { requiresImage: true });
  }

  if (hasAny(text, ['pm kisan', 'pm-kisan', 'government scheme', 'government ki scheme', 'sarkar', 'yojana', 'scheme', 'benefit', 'subsidy', 'kisan ko madad'])) {
    return result(INTENTS.GOVERNMENT_SCHEME, 0.94, 'Main aapko verified government schemes aur farmer benefits dikhata hoon.', 'OPEN_GOVERNMENT_BENEFITS');
  }

  if (hasAny(text, ['loan', 'karz', 'kharz', 'credit', 'kcc', 'paisa chahiye', 'farm finance', 'kheti ke liye paisa'])) {
    return result(INTENTS.AGRICULTURAL_LOAN, 0.92, 'Main aapko agricultural loan aur Kisan Credit Card information wale verified benefits dikhata hoon. Loan terms official bank rules par depend karte hain.', 'OPEN_GOVERNMENT_BENEFITS');
  }

  if (hasAny(text, ['beej', 'seed', 'fertilizer', 'khaad', 'khad', 'pesticide', 'dawai', 'product', 'kharidna', 'buy', 'marketplace', 'equipment', 'tractor'])) {
    const intent = hasAny(text, ['beej', 'seed']) ? INTENTS.SEED_INFORMATION : hasAny(text, ['fertilizer', 'khaad', 'khad']) ? INTENTS.FERTILIZER_INFORMATION : hasAny(text, ['equipment', 'tractor']) ? INTENTS.FARM_EQUIPMENT : INTENTS.MARKETPLACE;
    return result(intent, 0.88, 'Main marketplace kholunga. Product availability aur price keval existing marketplace data se hi dikhaye jayenge.', 'OPEN_MARKETPLACE');
  }

  if (hasAny(text, ['irrigation', 'sinchai', ' सिंचाई', 'paani', 'water'])) {
    return result(INTENTS.IRRIGATION, 0.84, 'Irrigation support ke liye aap apne crop, soil aur water source ke hisaab se advice dekh sakte hain. Current farm data ke bina main specific recommendation nahi dunga.', 'NONE');
  }

  if (hasAny(text, ['profile', 'mera state', 'meri location', 'my location', 'mere details'])) {
    return result(INTENTS.PROFILE, 0.9, 'Aap apni saved farmer profile aur location dekh sakte hain.', 'OPEN_PROFILE');
  }

  if (hasAny(text, ['patte', 'leaf', 'leaves', 'fasal', 'crop', 'murjha', 'peele', 'yellow', 'problem', 'issue'])) {
    return result(INTENTS.CROP_PROBLEM, 0.82, 'Fasal ke patte peele ya murjhane ke kai possible reasons ho sakte hain. Affected crop ki clear photo upload karke Disease Detection se check karein.', 'OPEN_DISEASE_DETECTION', { requiresImage: true });
  }

  return result(INTENTS.UNKNOWN, 0.35, 'Main is request ko poori tarah samajh nahi paaya. Aap weather, crop problem, government scheme, farm loan, beej ya fertilizer ke baare mein pooch sakte hain.');
}

module.exports = {
  ALLOWED_ACTIONS,
  INTENTS,
  normalizeText,
  understandVoiceRequest,
  answerVoiceQuestion,
};
