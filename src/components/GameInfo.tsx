import { useGame } from "@/contexts/GameContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCcw, Undo, Redo, Bot, User } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import GuidesSection from "./GuidesSection";
import {
  easyConfig,
  expertConfig,
  hardConfig,
  mediumConfig,
} from "@/utils/DifficultyConfiguration";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Player } from "@/types/game";

const GameInfo = () => {
  const {
    state,
    resetGame,
    startGame,
    undo,
    redo,
    canUndo,
    canRedo,
    isAIThinking,
    toggleAI,
    selectDifficulty,
    selectPlayer,
  } = useGame();
  const { t, language } = useLanguage();
  const {
    currentPlayer,
    winner,
    lastMovedPieceColor,
    gameStarted,
    difficulty,
    player,
  } = state;

  const colorNames = {
    orange: "Orange",
    blue: "Blue",
    purple: "Purple",
    pink: "Pink",
    yellow: "Yellow",
    red: "Red",
    green: "Green",
    brown: "Brown",
  };

  const difficultyList = [
    {
      name: t.difficulty.easy,
      config: easyConfig,
    },
    {
      name: t.difficulty.medium,
      config: mediumConfig,
    },
    {
      name: t.difficulty.hard,
      config: hardConfig,
    },
    {
      name: t.difficulty.expert,
      config: expertConfig,
    },
  ];
  
  return (
    <div className="w-full max-w-xl mx-auto my-6 glass-panel p-2 lg:p-4 animate-slide-up">
      <div
        className="flex items-center justify-between mb-4"
        dir={language === "en" ? "ltr" : "rtl"}
      >
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
        <>
          <div className="text-center p-4">
            <h3 className="text-xl font-medium mb-4">{t.gameInfo.welcome}</h3>
            <p className="mb-6 text-muted-foreground">{t.gameInfo.subtitle}</p>
            <div className=" flex justify-center items-center flex-wrap gap-3">
              <Button
                onClick={startGame}
                disabled={!difficulty && state.aiEnabled}
                className="animate-pulse-subtle disabled:bg-muted-foreground "
              >
                {t.gameInfo.startGame}
              </Button>
              <Button
                variant={state.aiEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleAI}
                className={cn(
                  isAIThinking && "animate-pulse",
                  "flex items-center gap-1"
                )}
              >
                {state.aiEnabled ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {state.aiEnabled ? "AI On" : "AI Off"}
              </Button>
              {state.aiEnabled && (
                <Select
                  onValueChange={(value) => {
                    const selectedDifficulty = difficultyList.find(
                      (d) => d.config.searchDepth.toString() === value
                    );
                    if (selectedDifficulty) {
                      selectDifficulty(selectedDifficulty.config);
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t.difficulty.select} />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyList.map((difficulty) => (
                      <SelectItem
                        key={difficulty.config.searchDepth}
                        value={difficulty.config.searchDepth.toString()}
                      >
                        {difficulty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select
                onValueChange={(value) => {
                  selectPlayer(value as Player);
                }}
                defaultValue={player}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t.gameInfo.selectPlayer} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="black">
                      {t.gameInfo.black}
                    </SelectItem>
                    <SelectItem value="white">
                      {t.gameInfo.white}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : winner ? (
        <motion.div
          className="text-center p-4 animate-scale-in"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          key="winner"
        >
          <motion.h3
            className="text-xl font-medium mb-2"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {t.gameInfo.gameOver}
          </motion.h3>
          <motion.p
            className="text-lg"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <span
              className={cn(
                "font-bold",
                winner === "black" ? "text-kamisado-black" : "text-gray-600"
              )}
            >
              {winner.charAt(0).toUpperCase() + winner.slice(1)}
            </span>{" "}
            {t.gameInfo.wins}
          </motion.p>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.2 }}
          >
            <Button onClick={resetGame} className="mt-4">
              {t.gameInfo.playAgain}
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={cn(
                "w-4 h-4 rounded-full",
                currentPlayer === "black"
                  ? "bg-kamisado-black"
                  : "bg-kamisado-white border border-gray-300"
              )}
            />
            <p className="text-lg font-medium">
              {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s{" "}
              {t.gameInfo.turn}
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
                  <span>
                    {t.gameInfo.move} {colorNames[lastMovedPieceColor]}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default GameInfo;