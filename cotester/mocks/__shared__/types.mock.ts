// CoTester shared mock registry — auto-generated. You may edit factory bodies.
// New types are appended; existing entries are never overwritten.

export const mockRequest = (): any => ({ body: {}, headers: { 'Content-Type': 'application/json' }, method: 'GET' } as any);

export const mockCtx = (): any => ({ params: { then: {} as any /* <TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined) => Promise<TResult1 | TResult2> */, catch: {} as any /* <TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined) => Promise<T | TResult> */, finally: {} as any /* (onfinally?: (() => void) | null | undefined) => Promise<T> */, __@toStringTag@2897: 'test-value' } });

export const mockNextRequest = (): any => ({ body: {}, headers: { 'Content-Type': 'application/json' }, method: 'GET' } as any);

export const mockMsgLite = (): any => ({ createdAt: new Date('2025-06-15T10:30:00Z'), kind: 'admin', privateNote: true, text: 'This is a test description for unit testing purposes' });

export const mockLang = (): any => ('lo' /* union alternates: 'en' */);

export const mockProfile = (): any => ({ name: 'John Doe', department: 'test-value', departmentLabel: 'test-value', contact: 'test-value', identifier: 'test-value', identifierHash: 'test-value' });

export const mockSession = (): any => ({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc', client: 'test-value', uid: 'test-value', user: { id: 1, name: 'John Doe', email: 'test@example.com' }, exp: 1 });

export const mockConversationDTO = (): any => ({ id: 1, status: 'active', unread: 1, updatedAt: new Date('2025-06-15T10:30:00Z'), createdAt: new Date('2025-06-15T10:30:00Z'), ticket: 'test-value', name: 'John Doe', subtitle: 'test-value', preview: 'test-value', previewFromContact: true, labels: ['item-1', 'item-2', 'item-3'], closedTopics: [], autoGreetedAt: 1, assignee: { id: 1, name: 'John Doe' } });

export const mockFetchJson = (): any => ({} as any /* FetchJson */);

export const mockChatwootSdk = (): any => ({ toggle: {} as any /* (state?: "open" | "close" | undefined) => void */, setUser: {} as any /* (identifier: string, attrs: Record<string, unknown>) => void */, setLocale: {} as any /* (locale: string) => void */, setLabel: {} as any /* (label: string) => void */, removeLabel: {} as any /* (label: string) => void */, setConversationCustomAttributes: {} as any /* (attrs: Record<string, unknown>) => void */, reset: ['item-1', 'item-2', 'item-3'] });

export const mockChatMeta = (): any => ({ category: 'admin', label: 'This is a test description for unit testing purposes', urgent: true });
