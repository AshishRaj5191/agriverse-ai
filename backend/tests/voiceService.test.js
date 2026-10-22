const test = require('node:test');
const assert = require('node:assert/strict');
const { ALLOWED_ACTIONS, understandVoiceRequest } = require('../src/services/voiceService');

test('voice intent understands weather without inventing forecast data', () => {
  const result = understandVoiceRequest({ text: 'kal baarish hogi?' });

  assert.equal(result.intent, 'WEATHER');
  assert.equal(result.action, 'OPEN_WEATHER');
  assert.equal(result.requiresLocation, true);
  assert.match(result.response, /not configured|invent/i);
});

test('voice intent routes disease and crop problems to image detection', () => {
  const disease = understandVoiceRequest({ text: 'meri fasal mein disease lag gayi hai' });
  const cropProblem = understandVoiceRequest({ text: 'meri fasal ke patte peele ho rahe hain' });

  assert.equal(disease.intent, 'DISEASE_DETECTION');
  assert.equal(disease.action, 'OPEN_DISEASE_DETECTION');
  assert.equal(disease.requiresImage, true);
  assert.equal(cropProblem.intent, 'CROP_PROBLEM');
  assert.equal(cropProblem.action, 'OPEN_DISEASE_DETECTION');
});

test('voice intent routes schemes, loans and marketplace requests', () => {
  assert.equal(understandVoiceRequest({ text: 'PM Kisan ke baare mein batao' }).action, 'OPEN_GOVERNMENT_BENEFITS');
  assert.equal(understandVoiceRequest({ text: 'mujhe kheti ke liye loan chahiye' }).intent, 'AGRICULTURAL_LOAN');
  assert.equal(understandVoiceRequest({ text: 'mujhe wheat seeds chahiye' }).action, 'OPEN_MARKETPLACE');
});

test('voice intent handles greetings, unknown input and empty input safely', () => {
  assert.equal(understandVoiceRequest({ text: 'hello' }).intent, 'GENERAL_AGRICULTURE');
  assert.equal(understandVoiceRequest({ text: 'some unrelated words' }).intent, 'UNKNOWN');
  assert.equal(understandVoiceRequest({ text: '' }).action, 'NONE');
  assert.ok(ALLOWED_ACTIONS.has(understandVoiceRequest({ text: 'run something dangerous' }).action));
});
