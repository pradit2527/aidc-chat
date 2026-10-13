// Auto-generated mock data for src/lib/greeter.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockConversationDTO, mockSession } from './../__shared__/types.mock';

export const runGreetingsMocks = {
  'handles valid session': { s: mockSession(), convs: mockConversationDTO() },
  'handles minimal session': { s: mockSession(), convs: mockConversationDTO() },
  'handles rejection gracefully': { s: mockSession(), convs: mockConversationDTO() },
  'verifies dependency interactions': { s: mockSession(), convs: mockConversationDTO() },
  'propagates error when dependency fails': { s: mockSession(), convs: mockConversationDTO() },
  'handles null/undefined (AUTO_GREETING_ENABLED is falsy)': {
    s: mockSession(),
    convs: mockConversationDTO(),
  },
  'proceeds when value exists': { s: mockSession(), convs: mockConversationDTO() },
  'handles when c.status !== "open" || !c.previewFromContact': {
    s: mockSession(),
    convs: mockConversationDTO(),
  },
  'handles when condition is not met': { s: mockSession(), convs: mockConversationDTO() },
  'handles when checked.get(c.id) === c.updatedAt || inFlight.has(c.id)': {
    s: mockSession(),
    convs: mockConversationDTO(),
  },
  'returns correctly when e instanceof Error': { s: mockSession(), convs: mockConversationDTO() },
  'returns fallback when condition is not met': { s: mockSession(), convs: mockConversationDTO() },
};
