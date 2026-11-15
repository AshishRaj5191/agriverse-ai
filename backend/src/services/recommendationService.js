const ApiError = require('../utils/ApiError');

const CROP_RULES = [
  {
    crop: 'Rice',
    seasons: ['kharif'],
    soils: ['clay', 'clay loam', 'loam'],
    irrigation: ['high', 'medium'],
    fertilizer: 'Nitrogen-rich fertilizer with balanced phosphorus and potassium.',
    reason: 'Suitable for Kharif conditions and soils with good water retention.',
  },
  {
    crop: 'Wheat',
    seasons: ['rabi'],
    soils: ['loam', 'clay loam', 'sandy loam'],
    irrigation: ['high', 'medium'],
    fertilizer: 'Balanced NPK with nitrogen application in split doses.',
    reason: 'Common Rabi crop suitable for fertile loam and clay-loam soils.',
  },
  {
    crop: 'Maize',
    seasons: ['kharif', 'rabi', 'zaid'],
    soils: ['loam', 'sandy loam', 'clay loam'],
    irrigation: ['high', 'medium'],
    fertilizer: 'Balanced NPK with adequate nitrogen during vegetative growth.',
    reason: 'Adaptable crop with good performance under suitable irrigation.',
  },
  {
    crop: 'Cotton',
    seasons: ['kharif'],
    soils: ['black', 'loam', 'sandy loam'],
    irrigation: ['medium', 'low'],
    fertilizer: 'Balanced NPK with emphasis on potassium during boll development.',
    reason: 'Well suited to Kharif season, especially in black soil.',
  },
  {
    crop: 'Mustard',
    seasons: ['rabi'],
    soils: ['loam', 'sandy loam', 'clay loam'],
    irrigation: ['low', 'medium'],
    fertilizer: 'Balanced NPK with sulphur support where soil testing indicates deficiency.',
    reason: 'Suitable Rabi oilseed crop with relatively moderate water requirements.',
  },
  {
    crop: 'Groundnut',
    seasons: ['kharif', 'zaid'],
    soils: ['sandy loam', 'loam'],
    irrigation: ['low', 'medium'],
    fertilizer: 'Phosphorus and potassium support with appropriate nitrogen management.',
    reason: 'Performs well in well-drained sandy-loam and loamy soils.',
  },
  {
    crop: 'Potato',
    seasons: ['rabi'],
    soils: ['sandy loam', 'loam'],
    irrigation: ['high', 'medium'],
    fertilizer: 'Balanced NPK with adequate potassium for tuber development.',
    reason: 'Suitable for cool Rabi conditions and well-drained soils.',
  },
  {
    crop: 'Tomato',
    seasons: ['kharif', 'rabi', 'zaid'],
    soils: ['loam', 'sandy loam'],
    irrigation: ['high', 'medium'],
    fertilizer: 'Balanced NPK with adequate potassium during fruit development.',
    reason: 'Can be grown across seasons with suitable irrigation and well-drained soil.',
  },
];

const FERTILIZER_RULES = {
  Rice: {
    primary: 'Nitrogen-rich fertilizer',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
    guidance: 'Use nitrogen in split applications and maintain balanced phosphorus and potassium nutrition.',
  },
  Wheat: {
    primary: 'Balanced NPK fertilizer',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
    guidance: 'Apply nitrogen in split doses and maintain balanced NPK nutrition throughout crop growth.',
  },
  Maize: {
    primary: 'Balanced NPK fertilizer',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
    guidance: 'Provide adequate nitrogen during vegetative growth along with balanced phosphorus and potassium.',
  },
  Cotton: {
    primary: 'NPK fertilizer with potassium support',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
    guidance: 'Maintain balanced nutrition and provide adequate potassium during boll development.',
  },
  Mustard: {
    primary: 'Balanced NPK with sulphur support',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium', 'Sulphur'],
    guidance: 'Sulphur can support oilseed production where soil testing indicates deficiency.',
  },
  Groundnut: {
    primary: 'Phosphorus and potassium supported fertilizer',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
    guidance: 'Focus on phosphorus and potassium while managing nitrogen appropriately.',
  },
  Potato: {
    primary: 'Balanced NPK with potassium support',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
    guidance: 'Maintain balanced NPK nutrition with adequate potassium for tuber development.',
  },
  Tomato: {
    primary: 'Balanced NPK with potassium support',
    nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
    guidance: 'Maintain balanced nutrition and provide adequate potassium during fruit development.',
  },
};

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function validateCropInput(input) {
  const soilType = normalize(input.soilType);
  const season = normalize(input.season);
  const irrigation = normalize(input.irrigation);

  if (!soilType || !season || !irrigation) {
    throw new ApiError(
      400,
      'soilType, season and irrigation are required.'
    );
  }

  return {
    soilType,
    season,
    irrigation,
  };
}

function validateFertilizerInput(input) {
  const crop = String(input.crop || '').trim();

  if (!crop) {
    throw new ApiError(400, 'crop is required.');
  }

  const fertilizer = FERTILIZER_RULES[crop];

  if (!fertilizer) {
    throw new ApiError(
      404,
      `Fertilizer recommendation is not available for ${crop}.`
    );
  }

  return {
    crop,
    fertilizer,
  };
}

async function getCropRecommendations(input = {}) {
  const { soilType, season, irrigation } = validateCropInput(input);

  const matches = CROP_RULES
    .filter((rule) => rule.seasons.includes(season))
    .filter((rule) => rule.soils.includes(soilType))
    .filter((rule) => rule.irrigation.includes(irrigation))
    .map((rule) => ({
      crop: rule.crop,
      reason: rule.reason,
      fertilizer: rule.fertilizer,
    }));

  if (matches.length === 0) {
    return {
      input: {
        soilType,
        season,
        irrigation,
      },
      recommendations: [],
      message:
        'No exact crop match found. Consider consulting an agriculture expert or providing more soil and weather information.',
    };
  }

  return {
    input: {
      soilType,
      season,
      irrigation,
    },
    recommendations: matches,
    message: 'Crop recommendations generated successfully.',
  };
}

async function getFertilizerRecommendation(input = {}) {
  const { crop, fertilizer } = validateFertilizerInput(input);

  return {
    crop,
    recommendation: {
      primary: fertilizer.primary,
      nutrients: fertilizer.nutrients,
      guidance: fertilizer.guidance,
    },
    disclaimer:
      'Fertilizer guidance is decision-support information. Soil testing and agriculture expert advice should be considered before application.',
  };
}

module.exports = {
  getCropRecommendations,
  getFertilizerRecommendation,
};
