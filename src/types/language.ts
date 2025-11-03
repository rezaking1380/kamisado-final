export type Language = "en" | "fa";

export interface Translation {
  gameName: string;
  guides: {
    title: string;
    goal: string;
    players: string;
    setup: string;
    firstMove: string;
    movement: string;
    colors: string;
    blocked: string;
    winning: string;
    tip: string;
  };
  gameInfo: {
    welcome: string;
    subtitle: string;
    startGame: string;
    gameOver: string;
    wins: string;
    playAgain: string;
    turn: string;
    move: string;
  };
  footer: {
    designed: string;
  };
  buttons: {
    close: string;
  };
  difficulty: {
    easy: string;
    medium: string;
    hard: string;
    expert: string;
    select: string;
  };
}

export const translations: Record<Language, Translation> = {
  en: {
    gameName: "Kamisado",
    guides: {
      title: "Kamisado Rules 🐉",
      goal: "🎯 Reach opponent's home row with any tower",
      players: "👥 2 players • 8 towers each • Black vs White",
      setup: "🏰 Start: All towers on your home row",
      firstMove: "🎲 First move: Random player picks any tower",
      movement: "➡️ Move forward/diagonal-forward (like limited rook)",
      colors:
        "🌈 Color Chain: Land on color → opponent MUST move that color tower",
      blocked: "🚫 If forced tower can't move → INSTANT LOSE!",
      winning:
        "🏆 Win: Reach opponent's home row OR opponent can't move forced tower",
      tip: "💡 Strategy: Your landing color chooses opponent's next move!",
    },
    gameInfo: {
      welcome: "Welcome to Kamisado",
      subtitle: "A strategic game of movement and color matching",
      startGame: "Start Game",
      gameOver: "Game Over!",
      wins: "wins!",
      playAgain: "Play Again",
      turn: "Turn",
      move: "Move",
    },
    footer: {
      designed: "Designed with precision and attention to detail",
    },
    buttons: {
      close: "Close",
    },
    difficulty: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      expert: "Expert",
      select: "Select Difficulty",
    },
  },
  fa: {
    gameName: "کامیسادو",
    guides: {
      title: "قوانین کامیسادو 🐉",
      goal: "🎯 رساندن یک برج به ردیف خانگی حریف",
      players: "👥 ۲ بازیکن • ۸ برج هر کدام • سیاه در مقابل سفید",
      setup: "🏰 شروع: همه برج‌ها در ردیف خانگی خودتان",
      firstMove: "🎲 حرکت اول: بازیکن تصادفی هر برجی را انتخاب می‌کند",
      movement: "➡️ حرکت به جلو/مورب به جلو (مانند رخ محدود شده)",
      colors:
        "🌈 زنجیره رنگ: فرود روی یک رنگ → حریف باید برج همون رنگ رو حرکت دهد",
      blocked: "🚫 اگر برج مشخص شده نتونه حرکت کنه → باخت فوری!",
      winning:
        "🏆 برد: رسیدن به ردیف خانگی حریف یا ناتوانی حریف در حرکت برج اجباری",
      tip: "💡 استراتژی: رنگ محل فرود شما، حرکت بعدی حریف را تعیین می‌کند!",
    },
    gameInfo: {
      welcome: "به کامیسادو خوش آمدید",
      subtitle: "یک بازی استراتژیک حرکت و تطبیق رنگ",
      startGame: "شروع بازی",
      gameOver: "بازی تمام شد!",
      wins: "برنده شد!",
      playAgain: "بازی مجدد",
      turn: "نوبت",
      move: "حرکت",
    },
    footer: {
      designed: "طراحی شده با دقت و توجه به جزئیات",
    },
    buttons: {
      close: "بستن",
    },
    difficulty: {
      easy: "آسان",
      medium: "متوسط",
      hard: "سخت",
      expert: "مبتدی",
      select: "انتخاب سطح سختی",
    },
  },
};
