const { answerVoiceQuestion } = require('../services/voiceService');

async function processVoiceRequest(req, res, next) {
  try {
    const text = String(req.body?.text || '').trim();

    if (!text) {
      return res.status(400).json({ success: false, message: 'Please say or type a farming question.' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: 'Please keep your question under 1000 characters.' });
    }

    const result = await answerVoiceQuestion({
      text,
      language: req.body?.language,
      context: req.body?.context,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = { processVoiceRequest };
