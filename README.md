# Workshop Booking System

A full-stack web application for managing and booking workshops, with separate client and admin panel frontends and a Node.js/Express backend.

---

## 🚀 Live Demo

- **Client (User Booking Site):** [https://workshop-booking-system.vercel.app/](https://workshop-booking-system.vercel.app/)
- **Admin Panel:** [https://workshop-booking-system-dm7c-q8xynppml.vercel.app/](https://workshop-booking-system-dm7c-q8xynppml.vercel.app/)
- **Backend API:** [https://workshop-booking-system-1.onrender.com](https://workshop-booking-system-1.onrender.com)

---

## 📝 Features

- User registration, login, and booking management
- Browse, search, and filter workshops
- Book workshops and manage your bookings
- Admin panel for managing workshops, time slots, bookings, and users
- Admin notifications for new bookings and pending admin approvals
- Image upload for workshops
- Responsive design for all devices

---

## 🛠️ Tech Stack

- **Frontend (Client & Admin Panel):** React, Vite, Material UI, Axios, Tailwind CSS
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Authentication:** JWT
- **Deployment:**
  - Backend: Render
  - Client/Admin: Vercel

---

## 🖥️ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/TinsuJembere/workshop-booking-system
cd workshop-booking-system
```

### 2. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
cd ../"Admin Panel" && npm install
```

### 3. Set up environment variables
- Copy `.env.example` to `.env` in the `server` directory and fill in your database credentials and JWT secret.
- Example:
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/workshopdb
  JWT_SECRET=your_jwt_secret
  ```

### 4. Run database migrations
```bash
cd server
npx prisma migrate dev --name init
```

### 5. Start the servers
- **Backend:**
  ```bash
  cd server
  npm run dev
  ```
- **Client:**
  ```bash
  cd client
  npm run dev
  ```
- **Admin Panel:**
  ```bash
  cd "Admin Panel"
  npm run dev
  ```

---

## 🌐 Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT authentication

---

## 🚀 Deployment

- **Backend:** Deploy to [Render](https://render.com/)
- **Client/Admin:** Deploy to [Vercel](https://vercel.com/)
- Update all API URLs in the frontend to point to your Render backend URL.
- Ensure CORS is configured on the backend to allow your Vercel domains.

---

## 📄 License

This project is licensed under the MIT License. 
