
import { GameProvider } from '@/contexts/GameContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import GameBoard from '@/components/GameBoard';
import GameInfo from '@/components/GameInfo';
import { useLanguage } from '@/contexts/LanguageContext';

// This component needs to be inside the LanguageProvider
const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center mt-6 text-xs text-muted-foreground animate-fade-in">
      <p>{t.footer.designed}</p>
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <GameProvider>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="lg:container max-w-screen-md mx-auto">
            <GameInfo />
            <GameBoard />
            <Footer />
          </div>
        </div>
      </GameProvider>
    </LanguageProvider>
  );
};

export default Index;
