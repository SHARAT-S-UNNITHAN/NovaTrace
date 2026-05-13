# NovaTrace 🚀

NovaTrace is a FULLY ADVANCED, production-grade SaaS web application for URL shortening, realtime analytics, and developer tools.

## ✨ Features

- **Premium UI/UX**: Futuristic dark mode, glassmorphism, and smooth Framer Motion animations.
- **URL Shortener**: Custom aliases, password protection, expiration dates, and QR code generation.
- **Realtime Analytics**: Live click tracking with Socket.IO, device/browser/geo stats, and interactive Recharts.
- **Developer Platform**: API key management, request logging, and full REST API.
- **Enterprise Ready**: Workspace support, JWT auth, rate limiting, and security headers.

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + ShadCN UI
- Framer Motion (Animations)
- Zustand (State Management)
- TanStack Query (Data Fetching)
- Recharts (Data Visualization)

### Backend
- Node.js + Express
- Prisma ORM + SQLite
- Socket.IO (Realtime)
- JWT + Bcrypt (Security)
- Winston (Logging)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/novatrace.git
   cd novatrace
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env file
   npx prisma generate
   npx prisma migrate dev --name init
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🐳 Docker Support

Run the entire stack with a single command:
```bash
docker-compose up -d
```

## 📜 License

MIT License. Built with ❤️ by Antigravity.
