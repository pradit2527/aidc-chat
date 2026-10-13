// @cotester-generated
// @cotester-version: 2

import { categoryLabel } from '../../../src/lib/categories';
import * as mocks from '../../mocks/lib/categories.mock';

// @testgen-sig:categoryLabel(id:string):string
describe('categoryLabel', () => {
  test('handles valid ID', () => {
    // Arrange
    const id = mocks.categoryLabelMocks['handles valid ID'].id;

    // Act
    const result = categoryLabel(id as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles zero ID', () => {
    // Arrange
    const id = mocks.categoryLabelMocks['handles zero ID'].id;

    // Act
    const result = categoryLabel(id as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles negative ID', () => {
    // Arrange
    const id = mocks.categoryLabelMocks['handles negative ID'].id;

    // Act
    const result = categoryLabel(id as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });
});
