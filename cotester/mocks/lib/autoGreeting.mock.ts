// Auto-generated mock data for src/lib/autoGreeting.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockMsgLite } from './../__shared__/types.mock';

export const chatStartOfMocks = {
  'handles populated list': { messages: mockMsgLite(), idleSec: 100 },
  'handles empty list': { messages: mockMsgLite(), idleSec: -50 },
  'handles single item list': { messages: mockMsgLite(), idleSec: 0 },
  'handles when m.kind === "outgoing" && !m.privateNote': { messages: mockMsgLite(), idleSec: 100 },
  'handles when condition is not met': { messages: mockMsgLite(), idleSec: -50 },
  'handles null/undefined (firstIn is falsy)': { messages: mockMsgLite(), idleSec: 100 },
  'proceeds when value exists': { messages: mockMsgLite(), idleSec: -50 },
  'guards against invalid input (lastOut is 0)': { messages: mockMsgLite(), idleSec: 100 },
  'proceeds with valid input': { messages: mockMsgLite(), idleSec: -50 },
  'returns correctly when resolvedBetween || firstIn.createdAt - lastOut >= idleSec': {
    messages: mockMsgLite(),
    idleSec: 100,
  },
  'returns fallback when condition is not met': { messages: mockMsgLite(), idleSec: -50 },
  'handles case when m.kind === "incoming" && m.createdAt > lastOut': {
    messages: mockMsgLite(),
    idleSec: 100,
  },
  'handles case when condition is not met': { messages: mockMsgLite(), idleSec: -50 },
  'handles case when m.kind === "activity" && /resolved/i.test(m.text) &&...': {
    messages: mockMsgLite(),
    idleSec: 100,
  },
  'handles case when m.kind === "activity" && /resolved/i.test(m.text)': {
    messages: mockMsgLite(),
    idleSec: 100,
  },
  'handles optional params omitted': { messages: mockMsgLite(), idleSec: undefined },
};

export const shouldGreetMocks = {
  'handles populated list': { messages: mockMsgLite(), greetedAtSec: 100, idleSec: 100 },
  'handles empty list': { messages: mockMsgLite(), greetedAtSec: -50, idleSec: -50 },
  'handles single item list': { messages: mockMsgLite(), greetedAtSec: 0, idleSec: 0 },
  'handles case when chatStart !== null && chatStart > greetedAtSec': {
    messages: mockMsgLite(),
    greetedAtSec: 100,
    idleSec: 100,
  },
  'handles case when condition is not met': {
    messages: mockMsgLite(),
    greetedAtSec: -50,
    idleSec: -50,
  },
  'handles optional params omitted': {
    messages: mockMsgLite(),
    greetedAtSec: 100,
    idleSec: undefined,
  },
};
