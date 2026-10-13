// Auto-generated mock data for src/lib/ticketRegistry.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockConversationDTO } from './../__shared__/types.mock';

export const registerTicketsMocks = {
  'handles populated list': { convs: mockConversationDTO(), actor: 'test-string-value' },
  'handles empty list': { convs: mockConversationDTO(), actor: '' },
  'handles single item list': { convs: mockConversationDTO(), actor: "O'Brien & Sons <LLC>" },
  'handles rejection gracefully': { convs: mockConversationDTO(), actor: 'test-string-value' },
  'verifies dependency interactions': { convs: mockConversationDTO(), actor: 'test-string-value' },
  'propagates error when dependency fails': {
    convs: mockConversationDTO(),
    actor: 'test-string-value',
  },
  'guards against invalid input (!dbEnabled || convs.length === 0)': {
    convs: mockConversationDTO(),
    actor: 'test-string-value',
  },
  'proceeds with valid input': { convs: mockConversationDTO(), actor: '' },
  'handles when r is falsy': { convs: mockConversationDTO(), actor: 'test-string-value' },
  'handles when r is truthy': { convs: mockConversationDTO(), actor: '' },
  'handles case when a.createdAt - b.createdAt || a.id - b.id': {
    convs: mockConversationDTO(),
    actor: 'test-string-value',
  },
  'handles case when condition is not met': { convs: mockConversationDTO(), actor: '' },
  'handles optional params omitted': { convs: mockConversationDTO(), actor: undefined },
};

export const unregisteredIdsMocks = {
  'handles populated list': { ids: ['item-1', 'item-2', 'item-3'] },
  'handles empty list': { ids: [] as any[] },
  'handles single item list': { ids: ['item-1'] },
  'handles rejection gracefully': { ids: ['item-1', 'item-2', 'item-3'] },
  'verifies dependency interactions': { ids: ['item-1', 'item-2', 'item-3'] },
  'propagates error when dependency fails': { ids: ['item-1', 'item-2', 'item-3'] },
  'guards against invalid input (!dbEnabled || ids.length === 0)': {
    ids: ['item-1', 'item-2', 'item-3'],
  },
  'proceeds with valid input': { ids: [] as any[] },
};

export const syncTicketMocks = {
  'handles valid conversationdto': { c: mockConversationDTO(), actor: 'test-string-value' },
  'handles minimal conversationdto': { c: mockConversationDTO(), actor: '' },
  'handles rejection gracefully': { c: mockConversationDTO(), actor: 'test-string-value' },
  'verifies dependency interactions': { c: mockConversationDTO(), actor: 'test-string-value' },
  'propagates error when dependency fails': {
    c: mockConversationDTO(),
    actor: 'test-string-value',
  },
  'handles null/undefined (dbEnabled is falsy)': {
    c: mockConversationDTO(),
    actor: 'test-string-value',
  },
  'proceeds when value exists': { c: mockConversationDTO(), actor: '' },
  'returns correctly when e instanceof Error': {
    c: mockConversationDTO(),
    actor: 'test-string-value',
  },
  'returns fallback when condition is not met': { c: mockConversationDTO(), actor: '' },
  'succeeds without throwing': { c: mockConversationDTO(), actor: 'test-string-value' },
  'handles error thrown inside try block': { c: mockConversationDTO(), actor: '' },
};

export const ticketNoOfMocks = {
  'handles valid conversationdto': { c: mockConversationDTO() },
  'handles minimal conversationdto': { c: mockConversationDTO() },
  'handles rejection gracefully': { c: mockConversationDTO() },
  'verifies dependency interactions': { c: mockConversationDTO() },
  'propagates error when dependency fails': { c: mockConversationDTO() },
  'handles null/undefined (dbEnabled is falsy)': { c: mockConversationDTO() },
  'proceeds when value exists': { c: mockConversationDTO() },
  'uses fallback when (await registerTickets([c])).get(c.id) is null/undefined': {
    c: mockConversationDTO(),
  },
  'uses (await registerTickets([c])).get(c.id) value when defined': { c: mockConversationDTO() },
};

export const logEventMocks = {
  'handles valid ID': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: {} as any,
  },
  'handles zero ID': { conversationId: 0, type: 'user', actor: '', detail: {} as any },
  'handles negative ID': {
    conversationId: -1,
    type: 'user',
    actor: "O'Brien & Sons <LLC>",
    detail: {} as any,
  },
  'handles rejection gracefully': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: {} as any,
  },
  'verifies dependency interactions': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: {} as any,
  },
  'propagates error when dependency fails': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: {} as any,
  },
  'handles null/undefined (dbEnabled is falsy)': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: {} as any,
  },
  'proceeds when value exists': { conversationId: 0, type: 'user', actor: '', detail: {} as any },
  'returns correctly when e instanceof Error': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: {} as any,
  },
  'returns fallback when condition is not met': {
    conversationId: 0,
    type: 'user',
    actor: '',
    detail: {} as any,
  },
  'succeeds without throwing': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: {} as any,
  },
  'handles error thrown inside try block': {
    conversationId: 0,
    type: 'user',
    actor: '',
    detail: {} as any,
  },
  'handles optional params omitted': {
    conversationId: 1,
    type: 'admin',
    actor: 'test-string-value',
    detail: undefined,
  },
};

export const markFirstReplyMocks = {
  'handles valid ID': { conversationId: 1 },
  'handles zero ID': { conversationId: 0 },
  'handles negative ID': { conversationId: -1 },
  'handles rejection gracefully': { conversationId: 1 },
  'verifies dependency interactions': { conversationId: 1 },
  'propagates error when dependency fails': { conversationId: 1 },
  'handles null/undefined (dbEnabled is falsy)': { conversationId: 1 },
  'proceeds when value exists': { conversationId: 0 },
  'returns correctly when e instanceof Error': { conversationId: 1 },
  'returns fallback when condition is not met': { conversationId: 0 },
  'succeeds without throwing': { conversationId: 1 },
  'handles error thrown inside try block': { conversationId: 0 },
};
