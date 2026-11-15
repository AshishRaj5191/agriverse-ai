const {
  getCropRecommendations,
  getFertilizerRecommendation,
} = require('../services/recommendationService');

async function recommendCrops(req, res, next) {
  try {
    const result = await getCropRecommendations(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function recommendFertilizer(req, res, next) {
  try {
    const result = await getFertilizerRecommendation(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  recommendCrops,
  recommendFertilizer,
};
