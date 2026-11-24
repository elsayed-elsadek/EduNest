import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useResetPassForm } from '../useResetPassForm';

describe('useResetPassForm validation', () => {
  it('accepts a valid password and matching confirmation', () => {
    const { result } = renderHook(() => useResetPassForm());

    act(() => {
      result.current.handleInputChange('password', 'ValidPass1!');
      result.current.handleInputChange('confirmPassword', 'ValidPass1!');
    });

    let valid = false;
    act(() => {
      valid = result.current.validate();
    });

    expect(valid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it.each([
    ['', 'ValidPass1!', 'Password is required'],
    ['short', 'short', 'Password does not meet requirements'],
    ['ValidPass1!', '', 'Please confirm your password'],
  ])('rejects invalid password input', (password, confirmation, expectedError) => {
    const { result } = renderHook(() => useResetPassForm());

    act(() => {
      result.current.handleInputChange('password', password);
      result.current.handleInputChange('confirmPassword', confirmation);
    });

    let valid = true;
    act(() => {
      valid = result.current.validate();
    });

    expect(valid).toBe(false);
    expect(Object.values(result.current.errors)).toContain(expectedError);
  });

  it('rejects a confirmation that does not match the password', () => {
    const { result } = renderHook(() => useResetPassForm());

    act(() => {
      result.current.handleInputChange('password', 'ValidPass1!');
      result.current.handleInputChange('confirmPassword', 'DifferentPass1!');
    });

    let valid = true;
    act(() => {
      valid = result.current.validate();
    });

    expect(valid).toBe(false);
    expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
  });
});
