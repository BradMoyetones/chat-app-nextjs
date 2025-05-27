# Chat Frontend – Next.js + TailwindCSS + Zustand + ShadCN + Socket.IO

---

This is the frontend of a real-time chat application built with **Next.js**, **TailwindCSS**, **Zustand**, **ShadCN UI**, and **Socket.IO**.  
It includes a **responsive layout** with separate interfaces for desktop and mobile users.

## 🚀 Tech Stack

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white)](https://github.com/pmndrs/zustand)
[![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-blueviolet?style=for-the-badge)](https://ui.shadcn.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

- **Next.js** – React framework for SSR, routing, and build optimization.
- **TailwindCSS** – Utility-first CSS framework for fast UI development.
- **Zustand** – Simple and scalable state management.
- **ShadCN UI** – Accessible, beautifully styled UI components.
- **Socket.IO** – Real-time communication with the backend.

---

## 🖥️ Interfaces

The application provides two fully responsive interfaces, each with its own structure and components:

- `/chats` → **Desktop interface**
- `/mb/chats` → **Mobile interface**

Each interface is optimized for its target device and uses separated UI components under the hood for better maintainability.

---

## 📦 Installation

To run this project locally, follow these steps:

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/your-chat-frontend.git
cd your-chat-frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create a `.env` file:**

Create a `.env` file and set the API base URL and any other required environment variables. For example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

4. **Run the development server:**

```bash
npm run dev
```

## 🛠️ Build

To create a production build:

```bash
npm run build
```

To start the production server after building:

```bash
npm start
```

## 📁 Project Structure

The backend is organized following a modular architecture:

```bash
src/
├── app/               # Next.js App Router structure
│   ├── chats/         # Desktop interface routes and components
│   └── mb/chats/      # Mobile interface routes and components
├── components/        # Shared UI components
├── stores/            # Zustand stores for global state
├── lib/               # Utility functions and client helpers (e.g. socket)
├── hooks/             # Custom React hooks
├── styles/            # Global Tailwind styles
└── types/             # TypeScript types and interfaces
```

## 📌 Notes

- Socket.IO client is initialized in a shared utility and listens/emits real-time events.

- Zustand is used to manage auth state, conversations, socket connection, etc.

- ShadCN provides elegant and accessible UI components throughout the app.

- Mobile and desktop interfaces are developed independently to provide the best UX on each platform.

## 👨‍💻 Author

Built with ❤️ by [Brad](https://github.com/BradMoyetones)
