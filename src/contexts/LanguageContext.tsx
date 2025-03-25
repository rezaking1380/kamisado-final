
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Translation, translations } from '@/types/language';

interface LanguageContextType {
  language: Language;
  t: Translation;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    // Optional: save to localStorage for persistence
    localStorage.setItem('kamisado-language', lang);
  };
  
  // Initialize from localStorage if available
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('kamisado-language') as Language | null;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fa')) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  const value = {
    language,
    t: translations[language],
    changeLanguage,
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
