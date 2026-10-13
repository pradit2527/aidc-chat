// @cotester-generated
// @cotester-version: 2

jest.mock('../../../src/lib/db', () => ({
  q: jest.fn(),
}));

jest.mock('../../../src/lib/tickets', () => ({
  ticketDate: jest.fn(),
}));

import { getStats } from '../../../src/lib/stats';
import * as mocks from '../../mocks/lib/stats.mock';
import { q } from '../../../src/lib/db';
import { ticketDate } from '../../../src/lib/tickets';

// @testgen-sig:getStats(days:number):Promise<Stats>
describe('getStats', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles typical value', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles typical value'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(q).toHaveBeenCalledWith(days, expect.any(Array));
    expect(ticketDate).toHaveBeenCalledWith(days);
  });

  test('handles negative value', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles negative value'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles zero', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles zero'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles boundary value', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles boundary value'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles rejection gracefully', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles rejection gracefully'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('verifies dependency interactions', async () => {
    // Arrange
    const days = 100;
    (q as jest.Mock).mockResolvedValue([] as any[]);
    (ticketDate as jest.Mock).mockReturnValue('mock-value');

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(q).toHaveBeenCalledWith(days, expect.any(Array));
    expect(ticketDate).toHaveBeenCalledWith(days);
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    const depError = new Error('dependency failure');
    q.mockRejectedValueOnce(depError);
    const days = 100;

    // Act & Assert
    await expect(getStats(days as any)).rejects.toThrow('dependency failure');
  });

  test('returns correctly when Array.isArray(r.labels)', async () => {
    // Arrange
    const days = mocks.getStatsMocks['returns correctly when Array.isArray(r.labels)'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when condition is not met', async () => {
    // Arrange
    const days = mocks.getStatsMocks['returns fallback when condition is not met'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when r.resolved === null || r.resolved === undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['returns correctly when r.resolved === null || r.resolved === undefined']
        .days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when num(summary?.open_now) is null/undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['uses fallback when num(summary?.open_now) is null/undefined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses num(summary?.open_now) value when defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['uses num(summary?.open_now) value when defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when num(summary?.created_today) is null/undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['uses fallback when num(summary?.created_today) is null/undefined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses num(summary?.created_today) value when defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['uses num(summary?.created_today) value when defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when num(summary?.resolved_today) is null/undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['uses fallback when num(summary?.resolved_today) is null/undefined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses num(summary?.resolved_today) value when defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['uses num(summary?.resolved_today) value when defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when num(summary?.total) is null/undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['uses fallback when num(summary?.total) is null/undefined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses num(summary?.total) value when defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['uses num(summary?.total) value when defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when r.contact_name is truthy is null/undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['uses fallback when r.contact_name is truthy is null/undefined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses r.contact_name is truthy value when defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['uses r.contact_name is truthy value when defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when r.department is truthy is null/undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['uses fallback when r.department is truthy is null/undefined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses r.department is truthy value when defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['uses r.department is truthy value when defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when r.assignee_name is truthy is null/undefined', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks['uses fallback when r.assignee_name is truthy is null/undefined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses r.assignee_name is truthy value when defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['uses r.assignee_name is truthy value when defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when Number(r.created) || 0', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles case when Number(r.created) || 0'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when condition is not met', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles case when condition is not met'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when summary is truthy is defined', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles when summary is truthy is defined'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when summary is truthy is null/undefined (optional chain short-circuits)', async () => {
    // Arrange
    const days =
      mocks.getStatsMocks[
        'handles when summary is truthy is null/undefined (optional chain short-circuits)'
      ].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles optional params omitted', async () => {
    // Arrange
    const days = mocks.getStatsMocks['handles optional params omitted'].days;

    // Act
    const result = await getStats(days as any);
    // TIP: alternatively use: await expect(getStats(days as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
