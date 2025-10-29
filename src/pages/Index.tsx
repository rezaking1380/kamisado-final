
import { GameProvider } from '@/contexts/GameContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import GameBoard from '@/components/GameBoard';
import GameInfo from '@/components/GameInfo';

const Index = () => {
  return (
    <LanguageProvider>
      <GameProvider>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="lg:container max-w-screen-md mx-auto">
            <GameInfo />
            <GameBoard />
          </div>
        </div>
      </GameProvider>
    </LanguageProvider>
  );
};

export default Index;
