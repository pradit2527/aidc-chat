// Auto-generated mock data for src/lib/db.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

export const dbMocks = {
  'handles default case': {},
  'handles null/undefined (process.env.DATABASE_URL is falsy)': {},
  'proceeds when value exists': {},
};

export const qMocks = {
  'handles valid text': {
    text: 'This is a test description for unit testing purposes',
    params: [] as any[],
  },
  'handles empty text': { text: '', params: ['item-1'] },
  'handles rejection gracefully': {
    text: 'This is a test description for unit testing purposes',
    params: [] as any[],
  },
  'handles optional params omitted': {
    text: 'This is a test description for unit testing purposes',
    params: undefined,
  },
};
