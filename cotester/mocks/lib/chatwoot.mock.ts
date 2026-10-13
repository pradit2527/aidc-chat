// Auto-generated mock data for src/lib/chatwoot.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

export const chatwootConfigMocks = {
  'handles default case': {},
  'handles case when process.env.CHATWOOT_BASE_URL ||...': {},
  'handles case when condition is not met': {},
  'handles case when process.env.CHATWOOT_WEBSITE_TOKEN || ""': {},
  'handles case when process.env.CHATWOOT_HMAC_TOKEN || ""': {},
};

export const signIdentifierMocks = {
  'handles valid input': { identifier: 'test-string-value' },
  'handles empty string': { identifier: '' },
  'handles special characters': { identifier: "O'Brien & Sons <LLC>" },
  'handles whitespace-only input': { identifier: '   ' },
  'handles null/undefined (hmacToken is falsy)': { identifier: 'test-string-value' },
  'proceeds when value exists': { identifier: '' },
};
