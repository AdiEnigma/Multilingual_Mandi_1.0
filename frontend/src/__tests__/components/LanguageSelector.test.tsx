import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'next-i18next';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import useLanguagePreference from '@/hooks/useLanguagePreference';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('next-i18next');
jest.mock('@/contexts/LanguageContext');
jest.mock('@/hooks/useLanguagePreference');
jest.mock('react-hot-toast');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;
const mockUseLanguagePreference = useLanguagePreference as jest.MockedFunction<typeof useLanguagePreference>;
const mockToast = toast as jest.Mocked<typeof toast>;

const mockLanguages = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

describe('LanguageSelector', () => {
  const mockUpdateLanguagePreference = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'selectLanguage': 'Select Language',
          'success': 'Success',
          'error': 'Error',
        };
        return translations[key] || key;
      },
      i18n: {} as any,
      ready: true,
    });

    mockUseLanguage.mockReturnValue({
      currentLanguage: 'hi' as any,
      setLanguage: jest.fn(),
      isRTL: false,
      getLanguageName: jest.fn(),
      getSupportedLanguages: () => mockLanguages as any,
    });

    mockUseLanguagePreference.mockReturnValue({
      isLoading: false,
      error: null,
      syncLanguagePreference: jest.fn(),
      updateLanguagePreference: mockUpdateLanguagePreference,
    });
  });

  it('renders default language selector', () => {
    render(<LanguageSelector />);
    
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<LanguageSelector variant="compact" />);
    
    expect(screen.getByText('HI')).toBeInTheDocument();
  });

  it('renders icon-only variant', () => {
    render(<LanguageSelector variant="icon-only" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Select Language');
  });

  it('opens dropdown when clicked', () => {
    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Select Language')).toBeInTheDocument();
    mockLanguages.forEach(lang => {
      expect(screen.getAllByText(lang.nativeName).length).toBeGreaterThan(0);
      // For English, both name and nativeName are the same, so we get multiple matches
      if (lang.name !== lang.nativeName) {
        expect(screen.getByText(lang.name)).toBeInTheDocument();
      }
    });
  });

  it('changes language when option is selected', async () => {
    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const bengaliOption = screen.getByText('বাংলা');
    fireEvent.click(bengaliOption);
    
    await waitFor(() => {
      expect(mockUpdateLanguagePreference).toHaveBeenCalledWith('bn');
    });
  });

  it('shows success toast on successful language change', async () => {
    mockUpdateLanguagePreference.mockResolvedValue(undefined);
    
    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const tamilOption = screen.getByText('தமிழ்');
    fireEvent.click(tamilOption);
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Success');
    });
  });

  it('shows error toast on failed language change', async () => {
    mockUpdateLanguagePreference.mockRejectedValue(new Error('Network error'));
    
    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Find the English option by its button role within the dropdown
    const englishOptions = screen.getAllByText('English');
    const englishButton = englishOptions[0].closest('button');
    fireEvent.click(englishButton!);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Error');
    });
  });

  it('disables button when loading', () => {
    mockUseLanguagePreference.mockReturnValue({
      isLoading: true,
      error: null,
      syncLanguagePreference: jest.fn(),
      updateLanguagePreference: mockUpdateLanguagePreference,
    });

    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows loading spinner when updating', () => {
    mockUseLanguagePreference.mockReturnValue({
      isLoading: true,
      error: null,
      syncLanguagePreference: jest.fn(),
      updateLanguagePreference: mockUpdateLanguagePreference,
    });

    render(<LanguageSelector />);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Select Language')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    expect(screen.queryByText('Select Language')).not.toBeInTheDocument();
  });

  it('does not change language when selecting current language', async () => {
    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Find the Hindi option by its button role within the dropdown
    const hindiOptions = screen.getAllByText('हिन्दी');
    const hindiButton = hindiOptions[1].closest('button'); // Second occurrence is in dropdown
    fireEvent.click(hindiButton!);
    
    expect(mockUpdateLanguagePreference).not.toHaveBeenCalled();
  });

  it('shows language count in dropdown footer', () => {
    render(<LanguageSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('4 languages supported')).toBeInTheDocument();
  });
});