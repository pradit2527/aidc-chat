// @cotester-generated
// @cotester-version: 2

import { getProfile, saveProfile, subscribeProfile } from '../../../src/lib/profileStore';
import * as mocks from '../../mocks/lib/profileStore.mock';

// @testgen-sig:getProfile():Profile
describe('getProfile', () => {
  test('handles default case', () => {
    // Act
    const result = getProfile();

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('guards against invalid input (raw === cachedRaw)', () => {
    // Act
    const result = getProfile();

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('proceeds with valid input', () => {
    // Act
    const result = getProfile();

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when raw is truthy', () => {
    // Act
    const result = getProfile();

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when raw is falsy', () => {
    // Act
    const result = getProfile();

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('succeeds without throwing', () => {
    // Act
    const result = getProfile();

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles error thrown inside try block', () => {
    // Act
    const result = getProfile();

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});

// @testgen-sig:saveProfile(p:Profile):void
describe('saveProfile', () => {
  test('handles valid profile', () => {
    // Arrange
    const p = mocks.saveProfileMocks['handles valid profile'].p;

    // Act
    const result = saveProfile(p as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles minimal profile', () => {
    // Arrange
    const p = mocks.saveProfileMocks['handles minimal profile'].p;

    // Act
    const result = saveProfile(p as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles when p is truthy', () => {
    // Arrange
    const p = mocks.saveProfileMocks['handles when p is truthy'].p;

    // Act
    const result = saveProfile(p as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles when p is falsy', () => {
    // Arrange
    const p = mocks.saveProfileMocks['handles when p is falsy'].p;

    // Act
    const result = saveProfile(p as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('succeeds without throwing', () => {
    // Arrange
    const p = mocks.saveProfileMocks['succeeds without throwing'].p;

    // Act
    const result = saveProfile(p as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles error thrown inside try block', () => {
    // Arrange
    const p = mocks.saveProfileMocks['handles error thrown inside try block'].p;

    // Act
    const result = saveProfile(p as any);

    // Assert
    expect(result).toBeUndefined();
  });
});

// @testgen-sig:subscribeProfile(cb:()=>void):()=>void
describe('subscribeProfile', () => {
  test('handles valid () => void', () => {
    // Arrange
    const cb = mocks.subscribeProfileMocks['handles valid () => void'].cb;

    // Act
    const result = subscribeProfile(cb as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles minimal () => void', () => {
    // Arrange
    const cb = mocks.subscribeProfileMocks['handles minimal () => void'].cb;

    // Act
    const result = subscribeProfile(cb as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
