// Auto-generated mock data for src/lib/tickets.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

export const ticketDateMocks = {
  'handles typical value': { sec: 100 },
  'handles negative value': { sec: -50 },
  'handles zero': { sec: 0 },
  'handles boundary value': { sec: Number.MAX_SAFE_INTEGER },
};

export const dayStartMocks = {
  'handles typical value': { sec: 100 },
  'handles negative value': { sec: -50 },
  'handles zero': { sec: 0 },
  'handles boundary value': { sec: Number.MAX_SAFE_INTEGER },
};

export const laoTimeMocks = {
  'handles typical value': { sec: 100 },
  'handles negative value': { sec: -50 },
  'handles zero': { sec: 0 },
  'handles boundary value': { sec: Number.MAX_SAFE_INTEGER },
};

export const assignTicketsMocks = {
  'handles populated list': { rows: ['item-1', 'item-2', 'item-3'] },
  'handles empty list': { rows: [] as any[] },
  'handles single item list': { rows: ['item-1'] },
  'handles when list is truthy': { rows: ['item-1', 'item-2', 'item-3'] },
  'handles when list is falsy': { rows: [] as any[] },
};

export const formatTicketMocks = {
  'handles valid input': { date: 'test-string-value', seq: 100 },
  'handles empty string': { date: '', seq: -50 },
  'handles special characters': { date: "O'Brien & Sons <LLC>", seq: 0 },
  'handles whitespace-only input': { date: '   ', seq: Number.MAX_SAFE_INTEGER },
};
