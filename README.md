# 🎵 MusiGuess

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**The ultimate 1v1 music trivia experience for Android.**
Syncs perfectly across devices. Powered by the iTunes API.

[**Download APK**](https://github.com/VICHiNG16/MusiGuess/releases)

</div>

---

<p align="center">
  <img src="./assets/screenshots/home.png" width="30%" alt="Home Screen" />
  <img src="./assets/screenshots/gameplay.png" width="30%" alt="Gameplay Screen" />
  <img src="./assets/screenshots/result.png" width="30%" alt="Result Screen" />
</p>

## 🔥 Features

*   **⚡ Real-Time Multiplayer**: Challenge friends instantly with a 6-digit room code.
*   **🎶 Infinite Library**: Guess from millions of songs using the **iTunes Search API**.
*   **⏱️ Precision Sync**: Sub-second audio synchronization ensures fair play.
*   **💎 Midnight Aesthetic**: A premium dark-mode interface with glassmorphism and smooth animations.
*   **📱 Native Performance**: Runs natively on Android.

## 🛠️ Architecture

MusiGuess is built with modern React Native best practices.

```
MusiGuess/
├── 📁 app/                 # Expo Router (File-based routing)
│   ├── 📁 game/            # Game Logic & Screens
│   ├── 📁 lobby/           # Lobby Management
│   └── index.tsx           # Home Screen
├── 📁 components/          # Reusable UI Components
│   ├── BackgroundGradient  # Shared visual identity
│   └── GlassButton         # Universal button component
├── 📁 constants/           # Design Tokens (Colors, Fonts)
├── 📁 utils/               # Logic & Services
│   ├── firebaseConfig.ts   # Realtime Database Setup
│   └── itunes.ts           # Music API Wrapper
└── 📄 app.json             # Expo Configuration
```

## 🚀 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native** (Expo SDK 54) | Core Framework |
| **TypeScript** | Type Safety |
| **Expo Router** | Navigation |
| **Firebase Realtime DB** | Live Multiplayer State |
| **React Native Reanimated** | 60fps Animations |
| **Expo AV** | Audio Playback |

## 💻 Installation

### Prerequisites
*   Node.js (v18+)
*   Expo CLI (`npm install -g expo-cli`)
*   ADB (for Android debugging)

### Setup
1.  **Clone the repository**
    ```bash
    git clone https://github.com/VICHiNG16/MusiGuess.git
    cd MusiGuess
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the app**
    ```bash
    npx expo start
    ```
    *Scan the QR code with the **Expo Go** app (Android/iOS).*

## 🤝 Contributing

Contributions are welcome!
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/VICHiNG16">VICHiNG16</a></sub>
</div>
