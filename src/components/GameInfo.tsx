
import { useGame } from '@/contexts/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import GuidesSection from './GuidesSection';

const GameInfo = () => {
  const { state, resetGame, startGame } = useGame();
  const { t } = useLanguage();
  const { currentPlayer, winner, lastMovedPieceColor, gameStarted } = state;

  const colorNames = {
    orange: 'Orange',
    blue: 'Blue',
    purple: 'Purple',
    pink: 'Pink',
    yellow: 'Yellow',
    red: 'Red',
    green: 'Green',
    brown: 'Brown'
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6 glass-panel p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{t.gameName}</h2>
        
        <div className="flex items-center gap-2">
          <GuidesSection />
          <LanguageSwitcher />
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={resetGame}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!gameStarted ? (
        <div className="text-center p-4">
          <h3 className="text-xl font-medium mb-4">{t.gameInfo.welcome}</h3>
          <p className="mb-6 text-muted-foreground">
            {t.gameInfo.subtitle}
          </p>
          <Button 
            onClick={startGame}
            className="animate-pulse-subtle"
          >
            {t.gameInfo.startGame}
          </Button>
        </div>
      ) : winner ? (
        <div className="text-center p-4 animate-scale-in">
          <h3 className="text-xl font-medium mb-2">
            {t.gameInfo.gameOver}
          </h3>
          <p className="text-lg">
            <span className={cn(
              "font-bold",
              winner === 'black' ? 'text-kamisado-black' : 'text-gray-600'
            )}>
              {winner.charAt(0).toUpperCase() + winner.slice(1)} 
            </span> {t.gameInfo.wins}
          </p>
          <Button 
            onClick={resetGame}
            className="mt-4"
          >
            {t.gameInfo.playAgain}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div 
              className={cn(
                "w-4 h-4 rounded-full",
                currentPlayer === 'black' ? 'bg-kamisado-black' : 'bg-kamisado-white border border-gray-300'
              )} 
            />
            <p className="text-lg font-medium">
              {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s {t.gameInfo.turn}
            </p>
            {lastMovedPieceColor && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center">
                  <div 
                    className={cn(
                      "w-4 h-4 rounded-full mr-2",
                      `bg-kamisado-${lastMovedPieceColor}`
                    )} 
                  />
                  <span>{t.gameInfo.move} {colorNames[lastMovedPieceColor]}</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GameInfo;
