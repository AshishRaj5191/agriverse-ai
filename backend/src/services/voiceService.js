const axios = require('axios');
const env = require('../config/env');

const ALLOWED_ACTIONS = new Set([
  'OPEN_WEATHER',
  'OPEN_DISEASE_DETECTION',
  'OPEN_GOVERNMENT_BENEFITS',
  'OPEN_MARKETPLACE',
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

function normalizeLanguage(language) {
  return String(language || '').trim().toLowerCase() === 'en-in'
    ? 'en-IN'
    : 'hi-IN';
}

function isMostlyDevanagariHindi(text) {
  const devanagariCount = (String(text).match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (String(text).match(/[A-Za-z]/g) || []).length;
  return devanagariCount > 0 && devanagariCount >= latinCount;
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

function localAnswer(intent, text, language) {
  const english = language === 'en-IN';
  const hindiAnswers = {
    WEATHER: 'लाइव मौसम देखने के लिए मौसम पृष्ठ में अपना शहर या खेत का स्थान खोजें। सत्यापित मौसम जानकारी मिले बिना मैं अनुमान लगाकर मौसम का पूर्वानुमान नहीं बताऊँगा।',
    DISEASE_DETECTION: 'फसल का रोग जानने के लिए प्रभावित पत्ती की साफ़ फोटो अपलोड करें। स्प्रे या रासायनिक दवा डालने से पहले कृत्रिम बुद्धिमत्ता के परिणाम को कृषि विशेषज्ञ से अवश्य पुष्टि करवाएं।',
    CROP_PROBLEM: 'पीली या मुरझाती पत्तियों के कई कारण हो सकते हैं: अधिक या कम पानी, पोषक तत्वों की कमी, कीट या रोग। मिट्टी की नमी जांचें, प्रभावित पत्ती की साफ़ फोटो लें और रोग पहचान या कृषि विशेषज्ञ से सलाह लें।',
    GOVERNMENT_SCHEME: 'सरकारी योजनाओं के पृष्ठ में प्रधानमंत्री किसान सम्मान निधि, बीमा, ऋण और सब्सिडी जैसी योजनाओं को श्रेणी या राज्य के अनुसार खोजें। आवेदन करने से पहले आधिकारिक पोर्टल पर पात्रता अवश्य जांचें।',
    AGRICULTURAL_LOAN: 'किसान क्रेडिट कार्ड या कृषि ऋण के लिए बैंक की आधिकारिक ब्याज दर, शर्तें, दस्तावेज़, गिरवी और पात्रता की तुलना करें। आवेदन से पहले सभी शर्तें सत्यापित करें।',
    MARKETPLACE: 'बाज़ार पृष्ठ से कृषि उत्पाद देखे जा सकते हैं, लेकिन सत्यापित स्रोत के बिना लाइव कीमत या उपलब्धता नहीं बताई जाएगी। खरीद से पहले विक्रेता और आधिकारिक बिल से जानकारी पुष्टि करें।',
    IRRIGATION: 'पानी देने का समय फसल, मिट्टी, मौसम और फसल की उम्र पर निर्भर करता है। सुबह या शाम पानी दें, जलभराव से बचें और मिट्टी की नमी जांचें।',
    FERTILIZER_INFORMATION: 'खाद की मात्रा मिट्टी की जांच और फसल की अवस्था के आधार पर तय करें। जांच के बिना अधिक यूरिया या रासायनिक कीटनाशक न डालें।',
    SEED_INFORMATION: 'बीज खरीदते समय किस्म, मौसम, अंकुरण दर, प्रमाणन और स्थानीय जलवायु के अनुरूपता जांचें। विश्वसनीय विक्रेता से प्रमाणित बीज लें।',
    FARMING_ADVICE: 'सटीक सलाह के लिए फसल का नाम, किस्म, मिट्टी का प्रकार, फसल की उम्र और वर्तमान समस्या बताएं। जानकारी खेत रिकॉर्ड में सहेजें और आवश्यक हो तो कृषि विशेषज्ञ से सलाह लें।',
    GENERAL_AGRICULTURE: 'मैं फसल, मिट्टी, सिंचाई, खाद, कीट, रोग, मौसम और सरकारी योजनाओं के बारे में मार्गदर्शन दे सकता हूँ। कृपया अपनी फसल और समस्या बताएं।',
    UNKNOWN: `आपका प्रश्न "${text}" मिला। कृपया फसल का नाम, समस्या और स्थान जैसी जानकारी विस्तार से बताएं।`,
  };
  const englishAnswers = {
    WEATHER: 'For live weather, search your city or farm location on the Weather page. I will not invent a forecast without verified weather data.',
    DISEASE_DETECTION: 'For crop disease detection, upload a clear photo of the affected leaf. Confirm the AI result with an agriculture expert before spraying or using chemicals.',
    CROP_PROBLEM: 'Yellowing or wilting leaves can be caused by water, nutrient deficiency, pests, or disease. Check soil moisture, take a clear photo, and use Disease Detection or expert consultation.',
    GOVERNMENT_SCHEME: 'Open the Government Schemes page to search PM-Kisan, insurance, loans, and subsidies by category or state. Verify official eligibility before applying.',
    AGRICULTURAL_LOAN: 'For agricultural loans or Kisan Credit Card, compare official bank interest rates, eligibility, collateral, and documents before applying.',
    MARKETPLACE: 'You can use Marketplace for products and listings, but I will not invent live prices or availability. Verify details with the seller and official invoice.',
    IRRIGATION: 'Watering depends on the crop, soil, and weather. Prefer morning or evening irrigation, avoid waterlogging, and check soil moisture.',
    FERTILIZER_INFORMATION: 'Choose fertilizer quantity based on soil testing and crop stage. Avoid excess urea or pesticides without a soil test and expert advice.',
    SEED_INFORMATION: 'When buying seeds, check crop variety, season, germination rate, certification, and suitability for your local climate.',
    FARMING_ADVICE: 'For specific advice, share the crop name, variety, soil type, crop age, and current problem. Save details in farm records and consult an expert.',
    GENERAL_AGRICULTURE: 'I can help with crops, soil, irrigation, fertilizer, pests, disease, weather, and government schemes. Tell me your crop and situation.',
    UNKNOWN: `I received "${text}". Please provide more farming details, such as the crop name, problem, and location.`,
  };
  const answers = english ? englishAnswers : hindiAnswers;
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
  const selectedLanguage = normalizeLanguage(language);
  const intentResult = understandVoiceRequest({ text, language: selectedLanguage, context });
  const promptLanguage = selectedLanguage === 'en-IN'
    ? 'English only'
    : 'Hindi (Devanagari), with simple Hinglish terms only where commonly used';
  const languageInstruction = selectedLanguage === 'en-IN'
    ? 'Respond entirely in natural English. Do not use Hindi or Hinglish words. Keep the answer under 180 words.'
    : 'Respond primarily in Hindi Devanagari script and natural Hindi. Use English only for necessary agriculture or technical terms. Do not answer mainly in English. Keep the answer under 180 words.';
  let answer = localAnswer(intentResult.intent, text, selectedLanguage);
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
              content: `You are AgriVerse AI, a careful agriculture assistant. Language requirement: ${languageInstruction} The required language is ${promptLanguage}. Give: direct answer, simple explanation, practical next steps, and a short safety note when chemicals, crop health, weather, prices or money are involved. Never invent live weather, market prices, government benefits, or a disease diagnosis. Say when verified data or an image is required.`,
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
      const providerAnswer = response.data?.choices?.[0]?.message?.content?.trim();
      if (selectedLanguage === 'en-IN') {
        answer = providerAnswer || answer;
      } else if (providerAnswer && isMostlyDevanagariHindi(providerAnswer)) {
        answer = providerAnswer;
      }
      provider = 'groq';
    } catch (error) {
      providerError = selectedLanguage === 'en-IN'
        ? 'AI provider request failed. Showing safe local guidance.'
        : 'AI provider अनुरोध विफल हुआ। सुरक्षित स्थानीय guidance दिखाई जा रही है।';
    }
  } else {
    providerError = selectedLanguage === 'en-IN'
      ? 'GROQ_API_KEY is not configured. Showing safe local guidance.'
      : 'GROQ_API_KEY configured नहीं है। सुरक्षित स्थानीय guidance दिखाई जा रही है।';
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
  const english = input.language === 'en-IN';

  if (!text) {
    return result(INTENTS.UNKNOWN, 0, english
      ? 'Ask me a question about weather, crop problems, government schemes, or farming support.'
      : 'Kuch poochhiye. Main weather, crop problems, government schemes aur farming support mein madad kar sakta hoon.');
  }

  if (hasGreeting(text)) {
    return result(INTENTS.GENERAL_AGRICULTURE, 0.98, english
      ? 'Hello! I am AgriVerse AI. Ask me about farming, weather, crop problems, government schemes, or agricultural information.'
      : 'Namaste! Main AgriVerse AI hoon. Aap farming, weather, crop problems, government schemes ya agricultural information ke baare mein pooch sakte hain.');
  }

  if (hasAny(text, ['weather', 'mausam', 'baarish', 'barish', 'rain', 'forecast', 'badal', 'pani pade', 'temperature'])) {
    return result(INTENTS.WEATHER, 0.95, english
      ? 'I can open the weather page. This service is not configured for live forecasts, so I will not invent one.'
      : 'मैं मौसम पृष्ठ खोल सकता हूँ। लाइव पूर्वानुमान सेवा इस समय उपलब्ध नहीं है, इसलिए अनुमानित पूर्वानुमान नहीं बताऊँगा।', 'OPEN_WEATHER', { requiresLocation: true });
  }

  if (hasAny(text, ['disease detection', 'disease', 'bimari', 'बीमारी', 'keede', 'keeda', 'pest', 'fungus', 'photo check', 'crop ki photo'])) {
    return result(INTENTS.DISEASE_DETECTION, 0.94, english
      ? 'Crop disease cannot be confirmed by voice. Upload a clear photo of the affected leaf and use Disease Detection.'
      : 'फसल का रोग केवल आवाज से निश्चित नहीं किया जा सकता। प्रभावित पत्ती की साफ़ फोटो अपलोड करके रोग पहचान सुविधा का उपयोग करें।', 'OPEN_DISEASE_DETECTION', { requiresImage: true });
  }

  if (hasAny(text, ['pm kisan', 'pm-kisan', 'government scheme', 'government ki scheme', 'sarkar', 'yojana', 'scheme', 'benefit', 'subsidy', 'kisan ko madad'])) {
    return result(INTENTS.GOVERNMENT_SCHEME, 0.94, english
      ? 'I can show verified government schemes and farmer benefits.'
      : 'मैं सत्यापित सरकारी योजनाएं और किसान लाभ दिखा सकता हूँ।', 'OPEN_GOVERNMENT_BENEFITS');
  }

  if (hasAny(text, ['loan', 'karz', 'kharz', 'credit', 'kcc', 'paisa chahiye', 'farm finance', 'kheti ke liye paisa'])) {
    return result(INTENTS.AGRICULTURAL_LOAN, 0.92, english
      ? 'I can show verified agricultural loan and Kisan Credit Card information. Final terms depend on the official bank.'
      : 'मैं कृषि ऋण और किसान क्रेडिट कार्ड की सत्यापित जानकारी दिखा सकता हूँ। अंतिम शर्तें आधिकारिक बैंक नियमों पर निर्भर करेंगी।', 'OPEN_GOVERNMENT_BENEFITS');
  }

  if (hasAny(text, ['beej', 'seed', 'fertilizer', 'khaad', 'khad', 'pesticide', 'dawai', 'product', 'kharidna', 'buy', 'marketplace', 'equipment', 'tractor'])) {
    const intent = hasAny(text, ['beej', 'seed']) ? INTENTS.SEED_INFORMATION : hasAny(text, ['fertilizer', 'khaad', 'khad']) ? INTENTS.FERTILIZER_INFORMATION : hasAny(text, ['equipment', 'tractor']) ? INTENTS.FARM_EQUIPMENT : INTENTS.MARKETPLACE;
    return result(intent, 0.88, english
      ? 'I can open the Marketplace. Availability and prices will be shown only from existing marketplace data.'
      : 'मैं बाज़ार पृष्ठ खोल सकता हूँ। उपलब्धता और कीमतें केवल उपलब्ध बाज़ार डेटा से दिखाई जाएँगी।', 'OPEN_MARKETPLACE');
  }

  if (hasAny(text, ['irrigation', 'sinchai', ' सिंचाई', 'paani', 'water'])) {
    return result(INTENTS.IRRIGATION, 0.84, english
      ? 'You can get irrigation guidance based on your crop, soil, and water source. I cannot provide a specific recommendation without farm data.'
      : 'आप फसल, मिट्टी और जल स्रोत के आधार पर सिंचाई मार्गदर्शन प्राप्त कर सकते हैं। खेत का डेटा मिले बिना मैं सटीक अनुशंसा नहीं दूँगा।', 'NONE');
  }

  if (hasAny(text, ['patte', 'leaf', 'leaves', 'fasal', 'crop', 'murjha', 'peele', 'yellow', 'problem', 'issue'])) {
    return result(INTENTS.CROP_PROBLEM, 0.82, english
      ? 'Yellow or wilting crop leaves can have several causes. Upload a clear photo of the affected crop and use Disease Detection.'
      : 'फसल की पीली या मुरझाती पत्तियों के कई कारण हो सकते हैं। प्रभावित फसल की साफ़ फोटो अपलोड करके रोग पहचान सुविधा का उपयोग करें।', 'OPEN_DISEASE_DETECTION', { requiresImage: true });
  }

  return result(INTENTS.UNKNOWN, 0.35, english
    ? 'I could not fully understand this request. Please ask about weather, crop problems, government schemes, farm loans, seeds, or fertilizer.'
    : 'Main is request ko poori tarah samajh nahi paaya. Aap weather, crop problem, government scheme, farm loan, beej ya fertilizer ke baare mein pooch sakte hain.');
}

module.exports = {
  ALLOWED_ACTIONS,
  INTENTS,
  normalizeText,
  normalizeLanguage,
  localAnswer,
  understandVoiceRequest,
  answerVoiceQuestion,
};
