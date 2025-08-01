# MoKidSafe

MoKidSafe is a mobile application designed to keep children safe and give parents peace of mind. Built with React Native (Expo) on the frontend and Node.js with Express on the backend, it provides real‑time location tracking, geofencing alerts, screen‑time monitoring and emergency communication between guardians and their children.

## Features

- **Real‑time location tracking** – parents can view their child’s current location and movement history in the app.
- **Geofencing alerts** – set safe zones; parents receive notifications if a child leaves or enters a designated area.
- **Emergency alerts** – children can send an immediate SOS alert to their guardians; the app uses push notifications.
- **Screen‑time monitoring** – track and chart device usage to help parents manage healthy screen time.
- **Secure authentication** – uses Clerk for sign‑up and login, with sessions stored securely.
- **Real‑time chat** – communication between parents and children via WebSockets (Socket.IO).
- **Cross‑platform** – runs on iOS, Android and the web via Expo Router; dark/light mode supported.
- **Backend API** – built with Node.js and Express, connected to MongoDB via Mongoose, and documented with Swagger.

## Technology Stack

- **Mobile client (Expo/React Native)**  
  - Expo CLI & Router for quick development.  
  - React Navigation for routing.  
  - Tailwind‑style styling via NativeWind.  
  - Location, notifications, haptics and secure storage through Expo modules.  
  - Real‑time communication through `socket.io-client`.

- **Server (Node.js/Express)**  
  - Express for RESTful API routes.  
  - MongoDB with Mongoose for data persistence.  
  - Socket.IO for real‑time updates.  
  - Swagger for API documentation.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.  
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) installed globally.
- A MongoDB database (can be local or managed like Atlas).

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/vincedotcode/mokidsafe.git
   cd mokidsafe
   ```

2. **Setup the mobile client:**

   ```bash
   cd client
   npm install        # or pnpm install
   ```

   - Create a `.env` file (or copy from `.env.example` if provided) with any required client‑side keys.

3. **Start the mobile client:**

   ```bash
   npm start          # starts the Expo development server
   ```

   Use the Expo app on your device or an emulator to run the mobile app.  

4. **Setup the backend server:**

   ```bash
   cd ../server
   npm install
   cp .env.example .env   # create your environment file with MongoDB URI and other secrets
   npm run dev            # start the server with nodemon
   ```

   The API will run on the port specified in `.env` (default 3000).  

## API Documentation

The backend includes Swagger documentation accessible at `/api-docs` when the server is running. It describes all available endpoints for users, authentication, location updates, notifications, etc.

## Contributing

Contributions are welcome! If you find a bug or want to add new features:

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b my-feature
   ```
2. Commit your changes with clear messages.
3. Push to your fork and open a pull request.

Please ensure your code follows the existing style and passes linting. New features should include tests where appropriate.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Disclaimer

MoKidSafe is intended as a supplementary tool for parental awareness. It should not replace active supervision or professional safety measures.
