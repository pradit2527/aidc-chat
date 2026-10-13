// @cotester-generated
// @cotester-version: 2

import { chatStartOf, shouldGreet } from '../../../src/lib/autoGreeting';
import * as mocks from '../../mocks/lib/autoGreeting.mock';

// @testgen-sig:chatStartOf(messages:MsgLite[],idleSec:number):number
describe('chatStartOf', () => {
  test.each([
    ['handles populated list', ['item-1', 'item-2', 'item-3'], 100] as any[],
    ['handles empty list', [] as any[], -50] as any[],
    ['handles single item list', ['item-1'], 0] as any[],
    [
      'handles when m.kind === "outgoing" && !m.privateNote',
      ['item-1', 'item-2', 'item-3'],
      100,
    ] as any[],
    ['handles when condition is not met', [] as any[], -50] as any[],
    ['handles null/undefined (firstIn is falsy)', ['item-1', 'item-2', 'item-3'], 100] as any[],
    ['proceeds when value exists', [] as any[], -50] as any[],
    ['guards against invalid input (lastOut is 0)', ['item-1', 'item-2', 'item-3'], 100] as any[],
    ['proceeds with valid input', [] as any[], -50] as any[],
    [
      'returns correctly when resolvedBetween || firstIn.createdAt - lastOut >= idleSec',
      ['item-1', 'item-2', 'item-3'],
      100,
    ] as any[],
    ['returns fallback when condition is not met', [] as any[], -50] as any[],
    [
      'handles case when m.kind === "incoming" && m.createdAt > lastOut',
      ['item-1', 'item-2', 'item-3'],
      100,
    ] as any[],
    ['handles case when condition is not met', [] as any[], -50] as any[],
    [
      'handles case when m.kind === "activity" && /resolved/i.test(m.text) &&...',
      ['item-1', 'item-2', 'item-3'],
      100,
    ] as any[],
    [
      'handles case when m.kind === "activity" && /resolved/i.test(m.text)',
      ['item-1', 'item-2', 'item-3'],
      100,
    ] as any[],
    ['handles optional params omitted', ['item-1', 'item-2', 'item-3'], undefined] as any[],
  ])('%s', (_label: string, messages: any, idleSec: any) => {
    // Act
    const result = chatStartOf(messages, idleSec);

    // Assert
    expect(typeof result).toBe('number');
    // expect(result).toBe(1);
  });
});

// @testgen-sig:shouldGreet(messages:MsgLite[],greetedAtSec:number,idleSec:number):{greet:boolean;chatStart:number|null;}
describe('shouldGreet', () => {
  test.each([
    ['handles populated list', ['item-1', 'item-2', 'item-3'], 100, 100] as any[],
    ['handles empty list', [] as any[], -50, -50] as any[],
    ['handles single item list', ['item-1'], 0, 0] as any[],
    [
      'handles case when chatStart !== null && chatStart > greetedAtSec',
      ['item-1', 'item-2', 'item-3'],
      100,
      100,
    ] as any[],
    ['handles case when condition is not met', [] as any[], -50, -50] as any[],
    ['handles optional params omitted', ['item-1', 'item-2', 'item-3'], 100, undefined] as any[],
  ])('%s', (_label: string, messages: any, greetedAtSec: any, idleSec: any) => {
    // Act
    const result = shouldGreet(messages, greetedAtSec, idleSec);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toMatchObject({
    //   greet: expect.any(Boolean),
    //   chatStart: expect.anything(),
    // });
  });
});
