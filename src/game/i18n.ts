import type {
  AccentPalette,
  AIDifficulty,
  AnimationSpeed,
  BoardTheme,
  FontChoice,
  GameMode,
  Language,
} from './types';

export type TranslationDict = {
  gameName: string;
  gameSubtitle: string;
  navHome: string;
  navPlay: string;
  navDashboard: string;
  navAbout: string;
  navSettings: string;
  languageLabel: string;
  modeLabel: string;
  modeAI: string;
  modeLocal: string;
  difficultyLabel: string;
  difficultyEasy: string;
  difficultyMedium: string;
  difficultyHard: string;
  startGame: string;
  resumeMatch: string;
  howToPlay: string;
  titleHint: string;
  playerLabel: string;
  player1Label: string;
  player2Label: string;
  aiLabel: string;
  storeLabel: string;
  yourTurn: string;
  player1Turn: string;
  player2Turn: string;
  aiThinking: string;
  sowingInProgress: string;
  inHand: string;
  stonesWord: string;
  undo: string;
  hint: string;
  mute: string;
  unmute: string;
  pause: string;
  restart: string;
  resume: string;
  mainMenu: string;
  pausedTitle: string;
  boardThemeLabel: string;
  themeWanza: string;
  themeBasalt: string;
  themeAcacia: string;
  accentLabel: string;
  accentGold: string;
  accentTerracotta: string;
  accentEmerald: string;
  accentCobalt: string;
  fontLabel: string;
  fontEditorial: string;
  fontModern: string;
  fontGeometric: string;
  speedLabel: string;
  speedBrisk: string;
  speedClassic: string;
  speedMeasured: string;
  cameraLabel: string;
  cameraAngled: string;
  cameraTopDown: string;
  soundLabel: string;
  soundOn: string;
  soundOff: string;
  settingsTitle: string;
  settingsSubtitle: string;
  resetSettings: string;
  backToMenu: string;
  selectPitPrompt: string;
  familyCapture: string;
  lastStoneCaptureNote: string;
  relayNote: string;
  turnEndedEmpty: string;
  remainingSwept: string;
  playHint: string;
  victoryTitle: string;
  defeatTitle: string;
  drawTitle: string;
  p1WinsTitle: string;
  p2WinsTitle: string;
  finalScore: string;
  turnsPlayed: string;
  bestScore: string;
  playAgain: string;
  rulesTitle: string;
  aboutSubtitle: string;
  originsTitle: string;
  originsParagraph1: string;
  originsParagraph2: string;
  etymologyTitle: string;
  etymologyBody: string;
  rulesClose: string;
  rulesStep1Title: string;
  rulesStep1Body: string;
  rulesStep2Title: string;
  rulesStep2Body: string;
  rulesStep3Title: string;
  rulesStep3Body: string;
  rulesStep4Title: string;
  rulesStep4Body: string;
  demoStepLabel: string;
  demoPlayButton: string;
  demoResetButton: string;
  demoCaptions: [string, string, string, string];
  developerCredit: string;
  copyrightText: string;
  dragToOrbitHint: string;
  shareButton: string;
  shareTitle: string;
  shareSubtitle: string;
  shareNativeApps: string;
  shareNativeNote: string;
  shareSms: string;
  shareWhatsApp: string;
  shareTelegram: string;
  shareX: string;
  shareFacebook: string;
  shareEmail: string;
  shareCopyLink: string;
  shareCopied: string;
  shareMessageInvite: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  dashMatchesPlayed: string;
  dashWinRate: string;
  dashBestScore: string;
  dashWinStreak: string;
  dashAvgLabel: string;
  dashBestStreakLabel: string;
  dashRecentChartTitle: string;
  dashHistoryTitle: string;
  dashFilterAll: string;
  dashFilterWins: string;
  dashColDate: string;
  dashColMode: string;
  dashColScore: string;
  dashColTurns: string;
  dashColResult: string;
  dashOutcomeWin: string;
  dashOutcomeLoss: string;
  dashOutcomeDraw: string;
  dashEmptyTitle: string;
  dashEmptyBody: string;
  dashPlayFirst: string;
  dashClearHistory: string;
  dashConfirmClear: string;
  dashCancelClear: string;
  pitAriaLabel: (side: string, num: number, count: number) => string;
};

const en: TranslationDict = {
  gameName: 'Gebeta',
  gameSubtitle: 'Count, sow anti-clockwise, and capture families of four.',
  navHome: 'Menu',
  navPlay: 'Play 3D',
  navDashboard: 'Dashboard',
  navAbout: 'About & Rules',
  navSettings: 'Settings',
  languageLabel: 'Language',
  modeLabel: 'Game Mode',
  modeAI: 'vs AI',
  modeLocal: '2 Players',
  difficultyLabel: 'AI Level',
  difficultyEasy: 'Easy',
  difficultyMedium: 'Medium',
  difficultyHard: 'Hard',
  startGame: 'Start Game',
  resumeMatch: 'Resume Match',
  howToPlay: 'About & Rules',
  titleHint: 'Enter / Space Start · Drag 3D Board to Orbit · Scroll to Zoom',
  playerLabel: 'You',
  player1Label: 'Player 1',
  player2Label: 'Player 2',
  aiLabel: 'AI',
  storeLabel: 'Store',
  yourTurn: 'Your Turn',
  player1Turn: 'Player 1 Turn',
  player2Turn: 'Player 2 Turn',
  aiThinking: 'AI Thinking…',
  sowingInProgress: 'Sowing Stones…',
  inHand: 'In Hand',
  stonesWord: 'stones',
  undo: 'Undo',
  hint: 'Hint',
  mute: 'Mute',
  unmute: 'Unmute',
  pause: 'Pause',
  restart: 'Restart',
  resume: 'Resume',
  mainMenu: 'Main Menu',
  pausedTitle: 'Game Paused',
  boardThemeLabel: 'Board Material',
  themeWanza: 'Wanza Wood',
  themeBasalt: 'Highland Basalt',
  themeAcacia: 'Golden Acacia',
  accentLabel: 'Accent Color',
  accentGold: 'Saffron Gold',
  accentTerracotta: 'Terracotta',
  accentEmerald: 'Highland Emerald',
  accentCobalt: 'Lapis Blue',
  fontLabel: 'Typography',
  fontEditorial: 'Editorial Serif',
  fontModern: 'Modern Sans',
  fontGeometric: 'Geometric Display',
  speedLabel: 'Sowing Pace',
  speedBrisk: 'Brisk',
  speedClassic: 'Classic',
  speedMeasured: 'Measured',
  cameraLabel: '3D Camera',
  cameraAngled: 'Tabletop 3D',
  cameraTopDown: 'Overhead',
  soundLabel: 'Audio Effects',
  soundOn: 'Enabled',
  soundOff: 'Muted',
  settingsTitle: 'Settings',
  settingsSubtitle: 'Customize board material, accent colors, typography, language, and 3D camera behavior.',
  resetSettings: 'Reset Defaults',
  backToMenu: 'Back to Menu',
  selectPitPrompt: 'Click any glowing 3D pit on your row to sow anti-clockwise. Drag canvas to orbit.',
  familyCapture: 'Family of 4 captured!',
  lastStoneCaptureNote: 'Last-stone capture',
  relayNote: 'Relay',
  turnEndedEmpty: 'Turn ended in an empty pit.',
  remainingSwept: 'No legal moves left — remaining stones swept to owners.',
  playHint: 'Click 3D Pit or 1–6 · Drag to Orbit · U Undo · V Camera · P Pause',
  victoryTitle: 'Victory',
  defeatTitle: 'AI Wins',
  drawTitle: 'Draw Match',
  p1WinsTitle: 'Player 1 Wins',
  p2WinsTitle: 'Player 2 Wins',
  finalScore: 'Final Score',
  turnsPlayed: 'Turns',
  bestScore: 'Best Score',
  playAgain: 'Play Again',
  rulesTitle: 'About Gebeta & How to Play',
  aboutSubtitle: 'Centuries of strategic count-and-capture heritage from Ethiopia and Eritrea.',
  originsTitle: 'Origins & Heritage',
  originsParagraph1:
    'Gebeta (ገበጣ) is one of the oldest living mancala-family strategy games of the Horn of Africa, deeply rooted across Ethiopia and Eritrea. Archaeological evidence shows stone-carved Gebeta boards etched directly into rock slabs around Aksum and Yeha dating back over 1,400 years.',
  originsParagraph2:
    'Traditionally hand-carved from warm Wanza (Cordia africana) hardwood and played with smooth river pebbles, cowrie shells, or dried seeds, Gebeta was played in village squares, royal courts, and family gatherings—teaching mental arithmetic, foresight, and patience across generations.',
  etymologyTitle: 'The "Family of Four" Tradition',
  etymologyBody:
    'Unlike standard Western mancala where opposite pits are captured directly, Ethiopian and Eritrean Gebeta revolves around building groups of exactly 4 stones—known as a "family" (ቤተሰብ). Timing your final stone so it lands as the 4th pebble in an opponent’s pit steals the family for yourself.',
  rulesClose: 'Back',
  rulesStep1Title: '1. Board & Setup',
  rulesStep1Body:
    'Two rows of 6 pits begin with 4 stones each (48 stones total). You own the bottom row; your opponent owns the top row.',
  rulesStep2Title: '2. Anti-Clockwise Sowing & Relay',
  rulesStep2Body:
    'Pick all stones from one of your pits and drop them one by one anti-clockwise. If your last stone lands in an occupied pit (and does not form 4), pick up all its stones and keep sowing!',
  rulesStep3Title: '3. Capturing a "Family" of 4',
  rulesStep3Body:
    'Whenever any pit reaches exactly 4 stones, those 4 stones are captured! Normally the pit owner claims them—except when your very last stone creates the 4, in which case YOU claim them and your turn ends.',
  rulesStep4Title: '4. Winning the Match',
  rulesStep4Body:
    'When a player has no stones left on their row at the start of their turn, the match ends and remaining stones go to each side’s owner. Most captured stones wins!',
  demoStepLabel: 'Interactive Example',
  demoPlayButton: 'Simulate Last-Stone Capture',
  demoResetButton: 'Reset Example',
  demoCaptions: [
    'Pick 2 stones from your rightmost pit (Pit 6).',
    'Drop 1st stone anti-clockwise into Opponent Pit 1.',
    'Last stone lands on Opponent Pit 2 (3 + 1 = 4 stones!).',
    'Last-stone Family! YOU capture all 4 stones.',
  ],
  developerCredit: 'Developed by Mesob Games Solutions',
  copyrightText: '© 2026 Mesob Games Solutions. All rights reserved.',
  dragToOrbitHint: 'Drag to rotate 3D view',
  shareButton: 'Share',
  shareTitle: 'Share Gebeta',
  shareSubtitle: 'Send via SMS, device share apps (SHAREit, AirDrop, Nearby Share), or social media.',
  shareNativeApps: 'Share via Device Apps (SHAREit / Nearby)',
  shareNativeNote: 'Opens your device share sheet when supported, or copies your invite message.',
  shareSms: 'SMS / Text',
  shareWhatsApp: 'WhatsApp',
  shareTelegram: 'Telegram',
  shareX: 'X / Twitter',
  shareFacebook: 'Facebook',
  shareEmail: 'Email',
  shareCopyLink: 'Copy Invite Text & Link',
  shareCopied: 'Copied to clipboard',
  shareMessageInvite: 'Play Gebeta (ገበጣ) 3D with me — the traditional Ethiopian & Eritrean count-and-capture strategy game by Mesob Games Solutions!',
  dashboardTitle: 'Player Dashboard',
  dashboardSubtitle: 'Track match performance, stone capture averages, streaks, and recent game logs.',
  dashMatchesPlayed: 'Matches Played',
  dashWinRate: 'Win Rate',
  dashBestScore: 'Best Capture',
  dashWinStreak: 'Win Streak',
  dashAvgLabel: 'Avg',
  dashBestStreakLabel: 'Best streak',
  dashRecentChartTitle: 'Recent Match Scores',
  dashHistoryTitle: 'Match History',
  dashFilterAll: 'All',
  dashFilterWins: 'Wins',
  dashColDate: 'Date',
  dashColMode: 'Mode',
  dashColScore: 'Score',
  dashColTurns: 'Turns',
  dashColResult: 'Result',
  dashOutcomeWin: 'Win',
  dashOutcomeLoss: 'Loss',
  dashOutcomeDraw: 'Draw',
  dashEmptyTitle: 'No completed matches yet',
  dashEmptyBody: 'Finish a match against the AI or in 2-Player mode to populate your score chart and match ledger.',
  dashPlayFirst: 'Play First Match',
  dashClearHistory: 'Clear History',
  dashConfirmClear: 'Confirm Clear',
  dashCancelClear: 'Cancel',
  pitAriaLabel: (side, num, count) => `${side} pit ${num}, ${count} stones`,
};

const ti: TranslationDict = {
  gameName: 'ገበጣ',
  gameSubtitle: 'ብጸጋም ቍጸር፣ ኣርባዕተ ቤተሰብ ኣክብ፣ ተዓወት።',
  navHome: 'ቀንዲ ገጽ',
  navPlay: '3D ጸወታ',
  navDashboard: 'ዳሽቦርድ',
  navAbout: 'ታሪኽን ኣጸዋውታን',
  navSettings: 'ቅጥዕታት',
  languageLabel: 'ቋንቋ',
  modeLabel: 'ዓይነት ጸወታ',
  modeAI: 'ምስ AI',
  modeLocal: 'ክልተ ተጻወትቲ',
  difficultyLabel: 'ደረጃ AI',
  difficultyEasy: 'ቀሊል',
  difficultyMedium: 'ማእከላይ',
  difficultyHard: 'ከቢድ',
  startGame: 'ጸወታ ጀምር',
  resumeMatch: 'ጸወታ ቀጽል',
  howToPlay: 'ብዛዕባ ገበጣ',
  titleHint: 'Enter / Space ጀምር · ሰሌዳ ብኢድካ ኣዙሮ · Scroll ኣቕርብ',
  playerLabel: 'ንስኻ',
  player1Label: 'ተጻዋታይ 1',
  player2Label: 'ተጻዋታይ 2',
  aiLabel: 'AI',
  storeLabel: 'መኽዘን',
  yourTurn: 'ተራኻ እዩ',
  player1Turn: 'ተራ ተጻዋታይ 1',
  player2Turn: 'ተራ ተጻዋታይ 2',
  aiThinking: 'AI ይሓስብ ኣሎ…',
  sowingInProgress: 'ዘርኢ ይዝራእ ኣሎ…',
  inHand: 'ኣብ ኢድ',
  stonesWord: 'ኣእማን',
  undo: 'ምለስ',
  hint: 'ሓገዝ',
  mute: 'ድምጺ ዕጾ',
  unmute: 'ድምጺ ክፈት',
  pause: 'ኣቋርጽ',
  restart: 'ዳግማይ ጀምር',
  resume: 'ቀጽል',
  mainMenu: 'ቀንዲ ገጽ',
  pausedTitle: 'ጸወታ ተቋሪጹ',
  boardThemeLabel: 'ዓይነት ሰሌዳ',
  themeWanza: 'ዕንጨይቲ ዋንዛ',
  themeBasalt: 'ጸሊም እምኒ',
  themeAcacia: 'ወርቃዊ ጨዓ',
  accentLabel: 'ሕብሪ መልክዕ',
  accentGold: 'ወርቃዊ',
  accentTerracotta: 'ቀይሕ ሓመድ',
  accentEmerald: 'ሓምላይ ለምዒ',
  accentCobalt: 'ሰማያዊ',
  fontLabel: 'ዓይነት ፊደል',
  fontEditorial: 'ባህላዊ Serif',
  fontModern: 'ዘመናዊ Sans',
  fontGeometric: 'ጂኦሜትሪክ',
  speedLabel: 'ፍጥነት ምዝራእ',
  speedBrisk: 'ቅልጡፍ',
  speedClassic: 'ልሙድ',
  speedMeasured: 'ህዱእ',
  cameraLabel: '3D ካሜራ',
  cameraAngled: '3D ሰሌዳ',
  cameraTopDown: 'ካብ ላዕሊ',
  soundLabel: 'ድምጺ ጸወታ',
  soundOn: 'ክፉት',
  soundOff: 'ዕጹው',
  settingsTitle: 'ቅጥዕታትን ምድላው ሰሌዳን',
  settingsSubtitle: 'ዓይነት ዕንጨይቲ፣ ሕብሪ፣ ፊደል፣ ቋንቋን ኩርናዕ 3D ካሜራን ቀይር።',
  resetSettings: 'ናብ ቀዳማይ ምለስ',
  backToMenu: 'ናብ ቀንዲ ገጽ',
  selectPitPrompt: 'ኣብ መስመርካ ዘሎ ባዶ ዘይኮነ 3D ጉድጓድ ጠውቕ።',
  familyCapture: '4 ቤተሰብ ተታሒዙ!',
  lastStoneCaptureNote: 'ናይ መወዳእታ እምኒ ምሓዝ',
  relayNote: 'ቀጻሊ ዘርኢ',
  turnEndedEmpty: 'ኣብ ባዶ ጉድጓድ ተወዲኡ።',
  remainingSwept: 'ዝንቀሳቐስ ስለዘየለ ዝተረፈ ናብ ዋናታቱ ተወሲዱ።',
  playHint: '3D ጉድጓድ ጠውቕ (1–6) · U ምለስ · V ካሜራ · P ኣቋርጽ',
  victoryTitle: 'ዓወት!',
  defeatTitle: 'AI ተዓዊቱ',
  drawTitle: 'ማዕረ ተፈላልዮም',
  p1WinsTitle: 'ተጻዋታይ 1 ተዓዊቱ',
  p2WinsTitle: 'ተጻዋታይ 2 ተዓዊቱ',
  finalScore: 'ናይ መወዳእታ ነጥቢ',
  turnsPlayed: 'ተራታት',
  bestScore: 'ዝበለጸ ነጥቢ',
  playAgain: 'ዳግማይ ተጻወት',
  rulesTitle: 'ታሪኽ ገበጣን ኣጸዋውታኡን',
  aboutSubtitle: 'ካብ ኤርትራን ኢትዮጵያን ዝመጸ ናይ ኣሽሓት ዓመታት ባህላዊ ስትራተጂ ጸወታ።',
  originsTitle: 'መበቆልን ታሪኽን',
  originsParagraph1:
    'ገበጣ ካብ ዝጸንሑ ናይ ቀርኒ ኣፍሪቃ ባህላዊ ጸወታታት ሓደ ኮይኑ፣ ኣብ ኤርትራን ኢትዮጵያን ንዘመናት ክጽወት ዝጸንሐ እዩ። ኣብ ከባቢ ኣኽሱምን የሓን ልዕሊ 1,400 ዓመት ዝገበሩ ኣብ እምኒ ዝተቐርጹ ሰሌዳታት ገበጣ ተረኺቦም እዮም።',
  originsParagraph2:
    'ብልምዲ ካብ ዕንጨይቲ ዋንዛ ተጸሪቡ ብጸጸር ሩባ ወይ ፍረታት ይጽወት። ገበጣ ኣብ ባይቶታትን ስድራቤታትን ትዕግስቲ፣ ቅልጡፍ ቍጽርን ስትራተጂካዊ ኣተሓሳስባን ዝምህር ጸወታ እዩ።',
  etymologyTitle: 'ስርዓት "4 ቤተሰብ"',
  etymologyBody:
    'ኣብ ገበጣ ልክዕ 4 ኣእማን ኣብ ሓደ ጉድጓድ ምስ ተኣከቡ "ቤተሰብ" ተባሂሎም ይተሓዙ። ናይ መወዳእታ እምንኻ ኣብ ጉድጓድ ተጻዋታይ 4 እንተመሊኣ ንስኻ ትወስዶም።',
  rulesClose: 'ተመለስ',
  rulesStep1Title: '1. ሰሌዳን ኣቀማምጣን',
  rulesStep1Body:
    'ክልተ መስመር ብ 6 ጉድጓዳት ነፍሲ ወከፎም 4 ኣእማን ኣለዎም (ብድምር 48 ኣእማን)። ታሕተዋይ መስመር ናትካ እዩ።',
  rulesStep2Title: '2. ብኣንጻር ሰዓት ምዝራእ',
  rulesStep2Body:
    'ካብ ሓደ ጉድጓድካ ኩሎም ኣእማን ኣልዒልካ ብኣንጻር ሰዓት ሓደ ብሓደ ኣቐምጥ። ናይ መወዳእታ እምኒ ኣብ ዘለዎ እንተዓሊባ (4 እንተዘይኮይኑ) ዳግማይ ኣልዒልካ ቀጽል።',
  rulesStep3Title: '3. 4 "ቤተሰብ" ምሓዝ',
  rulesStep3Body:
    'ዝኾነ ጉድጓድ ልክዕ 4 ኣእማን ምስ በጽሐ ይተሓዝ። ብልምዲ ዋና እቲ ጉድጓድ ይወስዶ—ብጀካ እታ ራብዐይቲ እምኒ ናይ መወዳእታ እምኒ ናይ ኢድካ እንተኾይና፤ ሽዑ ንስኻ ትወስዶ!',
  rulesStep4Title: '4. ምዕዋት',
  rulesStep4Body:
    'ሓደ ተጻዋታይ ኣብ ተራኡ ዝንቀሳቐስ እምኒ ምስ ዝስእን ጸወታ ይውዳእ። ዝበዝሐ ኣእማን ዝኣከበ ይዕወት!',
  demoStepLabel: 'ተግባራዊ ኣብነት',
  demoPlayButton: 'ኣብነት ኣርእይ',
  demoResetButton: 'ዳግማይ ጀምር',
  demoCaptions: [
    'ካብ የማናይ ጉድጓድካ (ጉድጓድ 6) 2 ኣእማን ኣልዕል።',
    'ቀዳመይቲ እምኒ ብኣንጻር ሰዓት ኣብ ጉድጓድ 1 ተጻዋታይ ኣቐምጥ።',
    'ናይ መወዳእታ እምኒ ኣብ ጉድጓድ 2 ትዓልብ (3 + 1 = 4 ኣእማን!)።',
    'ናይ መወዳእታ ቤተሰብ! ንስኻ 4 ኣእማን ትወስድ።',
  ],
  developerCredit: 'ብ Mesob GamesH Solutions ዝተሰርሐ',
  copyrightText: '© 2026 Mesob Games Solutions. ኩሉ መሰል ዝተሓለወ እዩ።',
  dragToOrbitHint: '3D ሰሌዳ ንምዝዋር ስሓብ',
  shareButton: 'ኣካፍል',
  shareTitle: 'ገበጣ ኣካፍል',
  shareSubtitle: 'ብ SMS፣ ብናይ ተሌፎን መካፈሊ (SHAREit) ወይ ብማሕበራዊ መራኸቢታት ስደድ።',
  shareNativeApps: 'ብኣፕታት ተሌፎን ኣካፍል (SHAREit / Nearby)',
  shareNativeNote: 'ዝድግፍ ተሌፎን እንተኾይኑ ናይ መካፈሊ ዝርዝር ይኸፍት፣ ወይ መልእኽቲ ይቐድሕ።',
  shareSms: 'SMS መልእኽቲ',
  shareWhatsApp: 'WhatsApp',
  shareTelegram: 'Telegram',
  shareX: 'X / Twitter',
  shareFacebook: 'Facebook',
  shareEmail: 'ኢመይል',
  shareCopyLink: 'ሊንክን መልእኽትን ቅዳሕ',
  shareCopied: 'ተቐዲሑ ኣሎ',
  shareMessageInvite: 'ባህላዊ 3D ጸወታ ገበጣ ብ Mesob Games Solutions ምሳይ ተጻወት!',
  dashboardTitle: 'ዳሽቦርድ ተጻዋታይ',
  dashboardSubtitle: 'ውጽኢት ጸወታታትካ፣ ዝኣከብካዮም ኣእማንን ተኸታታሊ ዓወታትን ተኸታተል።',
  dashMatchesPlayed: 'ዝተጻወትካዮም',
  dashWinRate: 'መጠን ዓወት',
  dashBestScore: 'ዝበለጸ ነጥቢ',
  dashWinStreak: 'ተኸታታሊ ዓወት',
  dashAvgLabel: 'ማእከላይ',
  dashBestStreakLabel: 'ዝበለጸ ተኸታታሊ',
  dashRecentChartTitle: 'ናይ ቀረባ ነጥብታት',
  dashHistoryTitle: 'ታሪኽ ጸወታታት',
  dashFilterAll: 'ኩሎም',
  dashFilterWins: 'ዓወታት',
  dashColDate: 'ዕለት',
  dashColMode: 'ዓይነት',
  dashColScore: 'ነጥቢ',
  dashColTurns: 'ተራታት',
  dashColResult: 'ውጽኢት',
  dashOutcomeWin: 'ዓወት',
  dashOutcomeLoss: 'ስዕረት',
  dashOutcomeDraw: 'ማዕረ',
  dashEmptyTitle: 'ገና ዝተወድአ ጸወታ የለን',
  dashEmptyBody: 'ጸወታ ምስ ወዳእካ ውጽኢትካን ስታቲስቲክስካን ኣብዚ ክረአ እዩ።',
  dashPlayFirst: 'ቀዳማይ ጸወታ ጀምር',
  dashClearHistory: 'ታሪኽ ደምስስ',
  dashConfirmClear: 'ኣረጋግጽ',
  dashCancelClear: 'ሰርዝ',
  pitAriaLabel: (side, num, count) => `${side} ጉድጓድ ${num}፣ ${count} ኣእማን`,
};

const am: TranslationDict = {
  gameName: 'ገበጣ',
  gameSubtitle: 'በተቃራኒ ሰዓት ዙር፣ አራት ቤተሰብ ሰብስብ፣ አሸንፍ።',
  navHome: 'ዋና ገጽ',
  navPlay: '3D ጨዋታ',
  navDashboard: 'ዳሽቦርድ',
  navAbout: 'ታሪክ እና ሕጎች',
  navSettings: 'ቅንብሮች',
  languageLabel: 'ቋንቋ',
  modeLabel: 'የጨዋታ ሁነታ',
  modeAI: 'ከ AI ጋር',
  modeLocal: 'ሁለት ተጫዋቾች',
  difficultyLabel: 'የ AI ደረጃ',
  difficultyEasy: 'ቀላል',
  difficultyMedium: 'መካከለኛ',
  difficultyHard: 'ከባድ',
  startGame: 'ጨዋታ ጀምር',
  resumeMatch: 'ጨዋታ ቀጥል',
  howToPlay: 'ስለ ገበጣ',
  titleHint: 'Enter / Space ጀምር · 3D ሰሌዳውን ጎትተህ አዙር · Scroll አቅርብ',
  playerLabel: 'አንተ',
  player1Label: 'ተጫዋች 1',
  player2Label: 'ተጫዋች 2',
  aiLabel: 'AI',
  storeLabel: 'ማጠራቀሚያ',
  yourTurn: 'የአንተ ተራ',
  player1Turn: 'የተጫዋች 1 ተራ',
  player2Turn: 'የተጫዋች 2 ተራ',
  aiThinking: 'AI እያሰበ ነው…',
  sowingInProgress: 'ጠጠር እየተዘራ ነው…',
  inHand: 'በእጅ ያለ',
  stonesWord: 'ጠጠሮች',
  undo: 'መልስ',
  hint: 'ፍንጭ',
  mute: 'ድምፅ ዝጋ',
  unmute: 'ድምፅ ክፈት',
  pause: 'አቁም',
  restart: 'እንደገና ጀምር',
  resume: 'ቀጥል',
  mainMenu: 'ዋና ገጽ',
  pausedTitle: 'ጨዋታው ቆሟል',
  boardThemeLabel: 'የሰሌዳ ዓይነት',
  themeWanza: 'የዋንዛ እንጨት',
  themeBasalt: 'ጥቁር ድንጋይ',
  themeAcacia: 'ወርቃማ ግራር',
  accentLabel: 'የቀለም ገጽታ',
  accentGold: 'ወርቃማ',
  accentTerracotta: 'ቀይ ሸክላ',
  accentEmerald: 'አረንጓዴ',
  accentCobalt: 'ሰማያዊ',
  fontLabel: 'የፊደል ቅርፅ',
  fontEditorial: 'ባህላዊ Serif',
  fontModern: 'ዘመናዊ Sans',
  fontGeometric: 'ጂኦሜትሪክ',
  speedLabel: 'የዝርያ ፍጥነት',
  speedBrisk: 'ፈጣን',
  speedClassic: 'መደበኛ',
  speedMeasured: 'ረጋ ያለ',
  cameraLabel: '3D ካሜራ',
  cameraAngled: '3D እይታ',
  cameraTopDown: 'ከላይ እይታ',
  soundLabel: 'የድምፅ ውጤቶች',
  soundOn: 'ክፍት',
  soundOff: 'ዝግ',
  settingsTitle: 'ቅንብሮች እና ማስተካከያ',
  settingsSubtitle: 'የሰሌዳውን እንጨት፣ ቀለም፣ ፊደል፣ ቋንቋ እና የ3D ካሜራ እይታ ያስተካክሉ።',
  resetSettings: 'ነባሪውን መልስ',
  backToMenu: 'ወደ ዋና ገጽ',
  selectPitPrompt: 'በመስመርህ ላይ ያለ ባዶ ያልሆነ 3D ጉድጓድ ጠቅ አድርግ።',
  familyCapture: '4 ቤተሰብ ተይዟል!',
  lastStoneCaptureNote: 'የመጨረሻ ጠጠር መያዝ',
  relayNote: 'ቅብብል',
  turnEndedEmpty: 'በባዶ ጉድጓድ ውስጥ አበቃ።',
  remainingSwept: 'መጫወቻ ጠጠር ስለሌለ ቀሪዎቹ ለባለቤቶቻቸው ተሰጥተዋል።',
  playHint: '3D ጉድጓድ ጠቅ (1–6) · U መልስ · V ካሜራ · P አቁም',
  victoryTitle: 'አሸነፍክ!',
  defeatTitle: 'AI አሸነፈ',
  drawTitle: 'አቻ ወጡ',
  p1WinsTitle: 'ተጫዋች 1 አሸነፈ',
  p2WinsTitle: 'ተጫዋች 2 አሸነፈ',
  finalScore: 'የመጨረሻ ውጤት',
  turnsPlayed: 'ተራዎች',
  bestScore: 'ምርጥ ውጤት',
  playAgain: 'እንደገና ተጫወት',
  rulesTitle: 'ስለ ገበጣ ታሪክ እና አጨዋወት',
  aboutSubtitle: 'ከኢትዮጵያ እና ኤርትራ የመጣ የዘመናት ስትራቴጂካዊ ባህላዊ ጨዋታ።',
  originsTitle: 'መነሻ እና ታሪክ',
  originsParagraph1:
    'ገበጣ በአፍሪካ ቀንድ ውስጥ ከጥንት ጀምሮ የሚዘወተር ባህላዊ የማንካላ ቤተሰብ ጨዋታ ነው። በአክሱም እና የሐ አካባቢ ከ1,400 ዓመታት በላይ ዕድሜ ያላቸው በድንጋይ ላይ የተቀረጹ የገበጣ ሰሌዳዎች ተገኝተዋል።',
  originsParagraph2:
    'በዋንዛ እንጨት ተቀርጾ በወንዝ ጠጠሮች ወይም በዘሮች የሚጫወተው ገበጣ በቤተሰብ እና በማህበረሰብ ስብሰባዎች ፈጣን ሒሳብን፣ አርቆ አሳቢነትን እና ትዕግስትን ያስተምራል።',
  etymologyTitle: 'የ"4 ቤተሰብ" ባህል',
  etymologyBody:
    'በገበጣ ማንኛውም ጉድጓድ ልክ 4 ጠጠሮች ሲሞላ "ቤተሰብ" ተብሎ ይያዛል። የመጨረሻዋ ጠጠርህ የተጋጣሚ ጉድጓድን 4 ከሞላች አንተ ጠጠሮቹን ትወስዳለህ።',
  rulesClose: 'ተመለስ',
  rulesStep1Title: '1. ሰሌዳ እና አቀማመጥ',
  rulesStep1Body:
    'ሁለት ረድፎች እያንዳንዳቸው 6 ጉድጓዶች ሲኖሯቸው በእያንዳንዱ ውስጥ 4 ጠጠሮች አሉ (በድምሩ 48)። የታችኛው ረድፍ የአንተ ነው።',
  rulesStep2Title: '2. በተቃራኒ ሰዓት መዝራት',
  rulesStep2Body:
    'ከጉድጓድህ ሁሉንም ጠጠሮች አንስተህ በተቃራኒ ሰዓት አንድ በአንድ ጣል። የመጨረሻዋ ጠጠር ባዶ ባልሆነ ጉድጓድ ካረፈች (4 ካልሞላች) አንስተህ ቀጥል።',
  rulesStep3Title: '3. አራት "ቤተሰብ" መያዝ',
  rulesStep3Body:
    'ማንኛውም ጉድጓድ ልክ 4 ጠጠሮች ሲሞላ ይያዛል። በተለምዶ የጉድጓዱ ባለቤት ይወስደዋል—ነገር ግን የመጨረሻዋ ጠጠር 4 ከሞላች አንተ ትወስደዋለህ!',
  rulesStep4Title: '4. አሸናፊነት',
  rulesStep4Body:
    'አንድ ተጫዋች በተራው የሚንቀሳቀስ ጠጠር ሲያጣ ጨዋታው ያበቃል። ብዙ ጠጠሮች የሰበሰበ ያሸንፋል!',
  demoStepLabel: 'ተግባራዊ ምሳሌ',
  demoPlayButton: 'ምሳሌውን አሳይ',
  demoResetButton: 'ዳግም ጀምር',
  demoCaptions: [
    'ከቀኝ ጉድጓድህ (ጉድጓድ 6) 2 ጠጠሮችን አንሳ።',
    'የመጀመሪያውን ጠጠር በተቃራኒ ሰዓት በተጋጣሚ ጉድጓድ 1 ጣል።',
    'የመጨረሻው ጠጠር በተጋጣሚ ጉድጓድ 2 ያርፋል (3 + 1 = 4 ጠጠሮች!)።',
    'የመጨረሻ ቤተሰብ! አንተ 4ቱንም ጠጠሮች ትወስዳለህ።',
  ],
  developerCredit: 'በ Mesob Games Solutions የተሰራ',
  copyrightText: '© 2026 Mesob Games Solutions. መብቱ በህግ የተጠበቀ ነው።',
  dragToOrbitHint: '3D እይታውን ለማዞር ይጎትቱ',
  shareButton: 'አጋራ',
  shareTitle: 'ገበጣን አጋራ',
  shareSubtitle: 'በ SMS፣ በስልክ መተግበሪያዎች (SHAREit) ወይም በማህበራዊ ሚዲያ ያጋሩ።',
  shareNativeApps: 'በስልክ መተግበሪያዎች አጋራ (SHAREit / Nearby)',
  shareNativeNote: 'የስልክዎን የማጋሪያ ዝርዝር ይከፍታል ወይም መልዕክቱን ይቀዳል።',
  shareSms: 'SMS መልዕክት',
  shareWhatsApp: 'WhatsApp',
  shareTelegram: 'Telegram',
  shareX: 'X / Twitter',
  shareFacebook: 'Facebook',
  shareEmail: 'ኢሜይል',
  shareCopyLink: 'ሊንክ እና መልዕክት ቅዳ',
  shareCopied: 'ተቀድቷል',
  shareMessageInvite: 'በ Mesob Games Solutions የተሰራውን ባህላዊውን የ3D ገበጣ ጨዋታ ከእኔ ጋር ይጫወቱ!',
  dashboardTitle: 'የተጫዋች ዳሽቦርድ',
  dashboardSubtitle: 'የጨዋታ ውጤቶችን፣ የተሰበሰቡ ጠጠሮችን እና ተከታታይ ድሎችን ይከታተሉ።',
  dashMatchesPlayed: 'የተጫወቱ ጨዋታዎች',
  dashWinRate: 'የድል መጠን',
  dashBestScore: 'ምርጥ ነጥብ',
  dashWinStreak: 'ተከታታይ ድል',
  dashAvgLabel: 'አማካይ',
  dashBestStreakLabel: 'ምርጥ ተከታታይ',
  dashRecentChartTitle: 'የቅርብ ጊዜ ነጥቦች',
  dashHistoryTitle: 'የጨዋታ ታሪክ',
  dashFilterAll: 'ሁሉም',
  dashFilterWins: 'ድሎች',
  dashColDate: 'ቀን',
  dashColMode: 'ሁነታ',
  dashColScore: 'ውጤት',
  dashColTurns: 'ተራዎች',
  dashColResult: 'ሁኔታ',
  dashOutcomeWin: 'ድል',
  dashOutcomeLoss: 'ሽንፈት',
  dashOutcomeDraw: 'አቻ',
  dashEmptyTitle: 'እስካሁን የተጠናቀቀ ጨዋታ የለም',
  dashEmptyBody: 'ውጤቶችዎን እና ስታቲስቲክስዎን እዚህ ለማየት አንድ ጨዋታ ያጠናቅቁ።',
  dashPlayFirst: 'የመጀመሪያውን ጨዋታ ጀምር',
  dashClearHistory: 'ታሪክ አጽዳ',
  dashConfirmClear: 'ማጽዳቱን አረጋግጥ',
  dashCancelClear: 'ሰርዝ',
  pitAriaLabel: (side, num, count) => `${side} ጉድጓድ ${num}፣ ${count} ጠጠሮች`,
};

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en,
  ti,
  am,
};

export function getTurnStatusText(
  t: TranslationDict,
  mode: GameMode,
  currentPlayer: 'player' | 'opponent',
  isAnimating: boolean,
): string {
  if (isAnimating) return t.sowingInProgress;
  if (mode === 'ai') {
    return currentPlayer === 'player' ? t.yourTurn : t.aiThinking;
  }
  return currentPlayer === 'player' ? t.player1Turn : t.player2Turn;
}

export function getDifficultyLabel(t: TranslationDict, d: AIDifficulty): string {
  if (d === 'easy') return t.difficultyEasy;
  if (d === 'medium') return t.difficultyMedium;
  return t.difficultyHard;
}

export function getThemeLabel(t: TranslationDict, theme: BoardTheme): string {
  if (theme === 'wanza') return t.themeWanza;
  if (theme === 'basalt') return t.themeBasalt;
  return t.themeAcacia;
}

export function getAccentLabel(t: TranslationDict, accent: AccentPalette): string {
  if (accent === 'gold') return t.accentGold;
  if (accent === 'terracotta') return t.accentTerracotta;
  if (accent === 'emerald') return t.accentEmerald;
  return t.accentCobalt;
}

export function getFontLabel(t: TranslationDict, font: FontChoice): string {
  if (font === 'editorial') return t.fontEditorial;
  if (font === 'modern') return t.fontModern;
  return t.fontGeometric;
}

export function getSpeedLabel(t: TranslationDict, speed: AnimationSpeed): string {
  if (speed === 'brisk') return t.speedBrisk;
  if (speed === 'classic') return t.speedClassic;
  return t.speedMeasured;
}
