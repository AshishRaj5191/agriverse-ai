const test = require('node:test');
const assert = require('node:assert/strict');

const {
  listGovernmentSchemes,
  getGovernmentSchemeById,
} = require('../src/services/governmentSchemeService');

test('government scheme list includes the core support schemes', async () => {
  const schemes = await listGovernmentSchemes();

  assert.ok(Array.isArray(schemes));
  assert.ok(schemes.length >= 4);
  assert.ok(schemes.some((scheme) => scheme.title === 'PM-KISAN Samman Nidhi'));
  assert.ok(schemes.some((scheme) => scheme.title === 'Kisan Credit Card (KCC)'));
  assert.ok(schemes.some((scheme) => scheme.title === 'Pradhan Mantri Fasal Bima Yojana'));
});

test('government scheme search matches financial and insurance support', async () => {
  const schemes = await listGovernmentSchemes({ search: 'insurance' });

  assert.ok(schemes.length > 0);
  assert.ok(schemes.some((scheme) => /PMFBY|insurance/i.test(scheme.title + ' ' + scheme.description)));
});

test('government scheme search covers identifiers and eligibility text', async () => {
  const pmResults = await listGovernmentSchemes({ search: 'PM' });
  const eligibilityResults = await listGovernmentSchemes({ search: 'tenant farmers' });

  assert.ok(pmResults.some((scheme) => scheme.id === 'pm-kisan'));
  assert.ok(pmResults.some((scheme) => scheme.id === 'pmfby'));
  assert.ok(eligibilityResults.some((scheme) => scheme.id === 'kisan-credit-card-kcc'));
});

test('state filtering keeps central schemes and excludes unrelated state schemes', async () => {
  const schemes = await listGovernmentSchemes({ state: 'Tamil Nadu' });

  assert.equal(schemes.length, 4);
  assert.ok(schemes.every((scheme) => scheme.governmentLevel === 'Central Government'));
});

test('government scheme lookup resolves by slug and returns official portal links', async () => {
  const scheme = await getGovernmentSchemeById('pm-kisan');

  assert.ok(scheme);
  assert.equal(scheme.title, 'PM-KISAN Samman Nidhi');
  assert.ok(scheme.officialWebsite.includes('pmkisan.gov.in'));
  assert.ok(scheme.statusUrl.includes('beneficiarystatus_new.aspx'));
});
