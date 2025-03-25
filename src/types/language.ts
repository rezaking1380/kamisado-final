
export type Language = 'en' | 'fa';

export interface Translation {
  gameName: string;
  guides: {
    title: string;
    introduction: string;
    objective: string;
    setup: string;
    movement: string;
    nextMove: string;
    winning: string;
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
}

export const translations: Record<Language, Translation> = {
  en: {
    gameName: 'Kamisado',
    guides: {
      title: 'Game Rules',
      introduction: 'Kamisado is an abstract strategy game played on an 8×8 multicolored board.',
      objective: 'The objective is to be first to reach the opponent\'s home row with one of your towers.',
      setup: 'Each player has 8 towers, positioned on their home row.',
      movement: 'Towers move any number of squares in a straight line (like a rook in chess), forward or diagonally forward.',
      nextMove: 'After a player moves, the next tower that must be moved is determined by the color of the square the opponent\'s tower landed on.',
      winning: 'Win by reaching the opponent\'s home row with one of your towers.'
    },
    gameInfo: {
      welcome: 'Welcome to Kamisado',
      subtitle: 'A strategic game of movement and color matching',
      startGame: 'Start Game',
      gameOver: 'Game Over!',
      wins: 'wins!',
      playAgain: 'Play Again',
      turn: 'Turn',
      move: 'Move'
    },
    footer: {
      designed: 'Designed with precision and attention to detail'
    },
    buttons: {
      close: 'Close'
    }
  },
  fa: {
    gameName: 'کامیسادو',
    guides: {
      title: 'قوانین بازی',
      introduction: 'کامیسادو یک بازی استراتژیک انتزاعی است که روی یک صفحه ۸×۸ رنگارنگ بازی می‌شود.',
      objective: 'هدف این است که اولین نفری باشید که با یکی از برج‌های خود به ردیف خانگی حریف برسید.',
      setup: 'هر بازیکن ۸ برج دارد که در ردیف خانگی خود مستقر هستند.',
      movement: 'برج‌ها می‌توانند هر تعداد مربع را در یک خط مستقیم (مانند رخ در شطرنج) به جلو یا قطری به جلو حرکت کنند.',
      nextMove: 'پس از حرکت یک بازیکن، برج بعدی که باید حرکت کند با توجه به رنگ مربعی که برج حریف روی آن فرود آمده تعیین می‌شود.',
      winning: 'با رسیدن به ردیف خانگی حریف با یکی از برج‌های خود، پیروز می‌شوید.'
    },
    gameInfo: {
      welcome: 'به کامیسادو خوش آمدید',
      subtitle: 'یک بازی استراتژیک حرکت و تطبیق رنگ',
      startGame: 'شروع بازی',
      gameOver: 'بازی تمام شد!',
      wins: 'برنده شد!',
      playAgain: 'بازی مجدد',
      turn: 'نوبت',
      move: 'حرکت'
    },
    footer: {
      designed: 'طراحی شده با دقت و توجه به جزئیات'
    },
    buttons: {
      close: 'بستن'
    }
  }
};
