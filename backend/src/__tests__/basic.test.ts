import { generateOTP, isValidIndianPhoneNumber, normalizePhoneNumber } from '@marketplace-mandi/shared';

describe('Basic Utility Functions', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      // While theoretically possible to be the same, it's extremely unlikely
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('isValidIndianPhoneNumber', () => {
    it('should validate correct Indian phone numbers', () => {
      const validNumbers = [
        '+919876543210',
        '+918123456789',
        '+917000000000',
        '+916999999999',
      ];

      validNumbers.forEach(number => {
        expect(isValidIndianPhoneNumber(number)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '9876543210', // Missing country code
        '+91987654321', // Too short
        '+9198765432100', // Too long
        '+919876543210a', // Contains letter
        '+915876543210', // Invalid starting digit
        '+1234567890', // Wrong country code
        'invalid',
        '',
      ];

      invalidNumbers.forEach(number => {
        expect(isValidIndianPhoneNumber(number)).toBe(false);
      });
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should normalize phone numbers correctly', () => {
      const testCases = [
        { input: '9876543210', expected: '+919876543210' },
        { input: '919876543210', expected: '+919876543210' },
        { input: '+919876543210', expected: '+919876543210' },
        { input: '91 9876 543 210', expected: '+919876543210' },
        { input: '+91-9876-543-210', expected: '+919876543210' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(normalizePhoneNumber(input)).toBe(expected);
      });
    });

    it('should return original input for unclear formats', () => {
      const unclearFormats = [
        'invalid-phone',
        '123',
        '',
      ];

      unclearFormats.forEach(input => {
        expect(normalizePhoneNumber(input)).toBe(input);
      });
    });
  });
});
    it('should handle non-Indian phone number formats', () => {
      // The function adds +91 to 10-digit numbers regardless of origin
      // This is the current behavior - it assumes 10-digit numbers are Indian
      expect(normalizePhoneNumber('+1234567890')).toBe('+911234567890');
      expect(normalizePhoneNumber('1234567890')).toBe('+911234567890');
    });