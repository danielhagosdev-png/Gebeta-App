# Gebeta (ገበጣ)

Traditional Ethiopian and Eritrean count-and-capture strategy board game.

## Features

- Authentic Gebeta rules (family-of-four capture)
- 3D interactive board
- Play vs AI (Easy / Medium / Hard) or local 2-player
- English, Tigrinya, and Amharic
- Match history & personal dashboard
- Customizable board themes, accents, and sowing speed

## Run Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Run on your phone (Expo Go)

The game runs inside an Expo app. The web game is bundled into the app, so your phone does not need to reach your PC's dev server.

```bash
npm install
npm start            # builds the game, then starts Expo
npm run start:tunnel # use this if your phone cannot reach your PC on Wi-Fi
```

Then scan the QR code with the Expo Go app (Android or iOS).

After changing any game code, run `npm start` again so the new build is embedded.

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/     # UI screens and board components
  game/           # Rules engine, i18n, stats, sound
  assets/         # Images and static assets
```

## License

© 2026 Mesob Games Solutions. All rights reserved.
