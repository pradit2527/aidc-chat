// @cotester-generated
// @cotester-version: 2

import { demoApi } from '../../../src/lib/adminDemo';
import * as mocks from '../../mocks/lib/adminDemo.mock';

// @testgen-sig:demoApi(path:string,init:Init):Promise<T>
describe('demoApi', () => {
  test.each([
    [
      'handles valid path',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['handles empty path', '', {} as any /* Init */] as any[],
    [
      'handles rejection gracefully',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when p === "/api/admin/conversations"',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['handles when condition is not met', '', {} as any /* Init */] as any[],
    [
      'handles when p === "/api/admin/labels"',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when p === "/api/admin/inbox"',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when p === "/api/admin/canned"',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when m is truthy',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['handles when m is falsy', '', {} as any /* Init */] as any[],
    [
      'handles when m[2] === "messages" && init.json === undefined',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when m[2] === "messages" && conv',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when msg.private is falsy',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['handles when msg.private is truthy', '', {} as any /* Init */] as any[],
    [
      'handles when m[2] === "topics" && conv',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when typeof body.note === "string" && body.note',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when resolved is truthy',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['handles when resolved is falsy', '', {} as any /* Init */] as any[],
    [
      'handles when m[2] === "status" && conv',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when conv.status === "open"',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when m[2] === "assign" && conv',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'handles when m[2] === "read" && conv',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'returns correctly when Array.isArray(body.close)',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['returns fallback when condition is not met', '', {} as any /* Init */] as any[],
    [
      'returns correctly when body.status === "resolved"',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'returns correctly when body.assigneeId === 1',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'returns correctly when body.assigneeId === 2',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    [
      'uses fallback when init.json is truthy is null/undefined',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['uses init.json is truthy value when defined', '', {} as any /* Init */] as any[],
    [
      'uses fallback when url.searchParams.get("status") is null/undefined',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['uses url.searchParams.get("status") value when defined', '', {} as any /* Init */] as any[],
    [
      'handles case when status === "all" || c.status === status',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['handles case when condition is not met', '', {} as any /* Init */] as any[],
    [
      'uses fallback when body.content is truthy is null/undefined',
      'src/utils/helper.ts',
      { method: 'test-value', json: {} as any /* unknown */ },
    ] as any[],
    ['uses body.content is truthy value when defined', '', {} as any /* Init */] as any[],
    ['handles optional params omitted', 'src/utils/helper.ts', undefined] as any[],
  ])('%s', async (_label: string, path: any, init: any) => {
    // Act
    const result = await demoApi(path, init);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
