# MoKidSafe 🛡️

**A child-safety mobile app: live location, geofence alerts, SOS, screen-time tracking, and a direct line between parent and child.**

Built with Expo / React Native on the front and Express + MongoDB behind it, with Socket.IO carrying anything that needs to arrive *now*.

---

## Features

| | |
|---|---|
| **Live location** | Parents see their child's current position and movement history on a native map (`react-native-maps`) |
| **Geofencing** | Define safe zones; entering or leaving one fires a push notification. Runs via `expo-task-manager` so it keeps working in the background |
| **SOS alerts** | One tap from the child sends an immediate alert to every linked guardian |
| **Screen-time tracking** | Device usage charted over time so parents can see patterns rather than just totals |
| **Real-time chat** | Parent ↔ child messaging over Socket.IO |
| **Secure auth** | Clerk handles sign-up, login and session management; tokens live in `expo-secure-store`, not AsyncStorage |
| **Cross-platform** | iOS, Android and web from one Expo Router codebase |

---

## Stack

**Mobile client**
- Expo SDK 52 + Expo Router 4 (file-based routing)
- React Native 0.76, TypeScript
- NativeWind (Tailwind syntax for React Native)
- `expo-location` + `expo-task-manager` — background location and geofencing
- `expo-notifications` — push
- `react-native-maps` — map rendering
- `react-native-chart-kit` — screen-time charts
- `@clerk/clerk-expo` — auth
- `socket.io-client` — real-time transport

**Server**
- Node.js + Express, written in TypeScript
- MongoDB via Mongoose
- Socket.IO for location broadcasts and chat
- Svix for webhook verification (Clerk user sync)
- Swagger (`swagger-jsdoc` + `swagger-ui-express`) at `/api-docs`

---

## Repository layout

```
mokidsafe/
├── client/     # Expo / React Native app
└── server/     # Express + Socket.IO API (TypeScript)
```

---

## Running locally

**Prerequisites:** Node.js 18+, the Expo CLI, a MongoDB database, and a Clerk application.

```bash
git clone https://github.com/vincedotcode/mokidsafe.git
cd mokidsafe
```

**Server**

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

```bash
MONGODB_URI=
PORT=3000
CLERK_WEBHOOK_SECRET=
```

**Client**

```bash
cd ../client
npm install
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` for a simulator. Note that **background location and geofencing need a physical device** — they do not behave correctly in a simulator.

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_URL=
```

---

## A note on permissions

Background location is the hard part of this app, not the maps. iOS and Android both treat "always allow" as a privileged permission with its own prompt flow, and both will silently downgrade it if the user isn't asked in the right order. The permission sequencing in `client/` is deliberate — changing its order will break geofencing on real devices while still appearing to work in Expo Go.

---

## Disclaimer

MoKidSafe is a supplementary awareness tool for guardians. It is not a substitute for supervision, and it should not be relied on as a sole safety measure.

---

## License

MIT — see [LICENSE](LICENSE).

## Contact

Vince Erkadoo — [vincedotcode.com](https://vincedotcode.com) · [vince@vincedotcode.com](mailto:vince@vincedotcode.com)
