import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRegisterForm } from '../useRegisterForm';

/** Fills every field required for a valid student registration. */
function fillValidStudent(result: { current: ReturnType<typeof useRegisterForm> }) {
  act(() => {
    result.current.handleInputChange('firstName', 'Sara');
    result.current.handleInputChange('lastName', 'Ali');
    result.current.handleInputChange('email', 'sara@example.com');
    result.current.handleInputChange('phoneNumber', '01012345678');
    result.current.handleInputChange('password', 'secret1');
    result.current.handleInputChange('confirmPassword', 'secret1');
    result.current.handleInputChange('educationalLevel', 'Grade 12');
    result.current.setAgreeTerms(true);
  });
}

describe('useRegisterForm.validate', () => {
  it('accepts a complete student registration', () => {
    const { result } = renderHook(() => useRegisterForm());
    fillValidStudent(result);

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('requires first name, last name and email', () => {
    const { result } = renderHook(() => useRegisterForm());

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.firstName).toBe('First name is required.');
    expect(result.current.errors.lastName).toBe('Last name is required.');
    expect(result.current.errors.email).toBe('Email is required.');
  });

  it('rejects an invalid e-mail address', () => {
    const { result } = renderHook(() => useRegisterForm());
    act(() => {
      result.current.handleInputChange('email', 'not-an-email');
    });

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.email).toBe('Invalid email.');
  });

  it('rejects a phone number that is not 10-15 digits', () => {
    const { result } = renderHook(() => useRegisterForm());
    act(() => {
      result.current.handleInputChange('phoneNumber', '12ab');
    });

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.phoneNumber).toBe('Invalid phone number.');
  });

  it('allows an empty optional phone number', () => {
    const { result } = renderHook(() => useRegisterForm());
    fillValidStudent(result);
    act(() => {
      result.current.handleInputChange('phoneNumber', '');
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
  });

  it('rejects a password shorter than six characters', () => {
    const { result } = renderHook(() => useRegisterForm());
    act(() => {
      result.current.handleInputChange('password', '123');
      result.current.handleInputChange('confirmPassword', '123');
    });

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.password).toBe('Password must be at least 6 characters.');
  });

  it('rejects mismatched passwords', () => {
    const { result } = renderHook(() => useRegisterForm());
    act(() => {
      result.current.handleInputChange('password', 'secret1');
      result.current.handleInputChange('confirmPassword', 'secret2');
    });

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.confirmPassword).toBe('Passwords do not match.');
  });

  it('requires the terms to be accepted', () => {
    const { result } = renderHook(() => useRegisterForm());
    fillValidStudent(result);
    act(() => {
      result.current.setAgreeTerms(false);
    });

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.agreeTerms).toBe(
      'You must agree to the Terms and Privacy Policy.',
    );
  });

  it('requires an educational level for students', () => {
    const { result } = renderHook(() => useRegisterForm());
    fillValidStudent(result);
    act(() => {
      result.current.handleInputChange('educationalLevel', '');
    });

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.educationalLevel).toBe('Educational level is required.');
  });

  it('does not require an educational level for mentors', () => {
    const { result } = renderHook(() => useRegisterForm());
    fillValidStudent(result);
    act(() => {
      result.current.setJoinAs('mentor');
      result.current.handleInputChange('educationalLevel', '');
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
    expect(result.current.errors.educationalLevel).toBeUndefined();
  });

  it('clears the field error when the user edits that field', () => {
    const { result } = renderHook(() => useRegisterForm());
    act(() => {
      result.current.validate();
    });
    expect(result.current.errors.email).toBe('Email is required.');

    act(() => {
      result.current.handleInputChange('email', 'sara@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('exposes helpers to set, clear and extend errors', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setEmailError('Email already exists.');
      result.current.setGeneralError('Something went wrong.');
    });

    expect(result.current.errors.email).toBe('Email already exists.');
    expect(result.current.errors.general).toBe('Something went wrong.');

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it('toggles password visibility flags', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);

    act(() => {
      result.current.setShowPassword(true);
      result.current.setShowConfirmPassword(true);
    });

    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(true);
  });
});
