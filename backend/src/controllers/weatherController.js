const {
  getWeatherByCity,
} = require('../services/weatherService');

async function getWeather(req, res, next) {
  try {
    const result = await getWeatherByCity(req.query.city);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWeather,
};