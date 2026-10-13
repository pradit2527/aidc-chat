// Auto-generated mock data for src/lib/ticketMap.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockFetchJson } from './../__shared__/types.mock';

export const fetchConversationsSinceMocks = {
  'handles valid fetchjson': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'handles minimal fetchjson': { fetchJson: mockFetchJson(), sinceSec: -50 },
  'handles rejection gracefully': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'verifies dependency interactions': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'propagates error when dependency fails': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'handles when list.length < PAGE_SIZE': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'handles when condition is not met': { fetchJson: mockFetchJson(), sinceSec: -50 },
  'handles when Math.min(...list.map((c) => c.updatedAt)) < need': {
    fetchJson: mockFetchJson(),
    sinceSec: 100,
  },
};

export const ticketMapMocks = {
  'handles valid fetchjson': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'handles minimal fetchjson': { fetchJson: mockFetchJson(), sinceSec: -50 },
  'handles rejection gracefully': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'verifies dependency interactions': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'propagates error when dependency fails': { fetchJson: mockFetchJson(), sinceSec: 100 },
  'guards against invalid input (cache && Date.now() - cache.at < TTL_MS &&...)': {
    fetchJson: mockFetchJson(),
    sinceSec: 100,
  },
  'proceeds with valid input': { fetchJson: mockFetchJson(), sinceSec: -50 },
  'handles case when cache && Date.now() - cache.at < TTL_MS': {
    fetchJson: mockFetchJson(),
    sinceSec: 100,
  },
  'handles case when condition is not met': { fetchJson: mockFetchJson(), sinceSec: -50 },
};
