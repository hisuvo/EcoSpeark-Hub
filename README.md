# 🌱 EcoSpark Hub - Backend

![EcoSpark Hub](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Prisma](https://img.shields.io/badge/Prisma-7.5.0-blue)
![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey)

**EcoSpark Hub** is a robust backend engine designed to empower eco-friendly initiatives. It facilitates a platform where users can share innovative ideas, engage in community voting, and support impactful projects through secure payment integrations.

---

## 🌐 Live URLs

- **Frontend Application**: [https://ecospark-client-seven.vercel.app](https://ecospark-client-seven.vercel.app)
- **Backend API**: [https://ecospark-hub-backend.vercel.app](https://ecospark-hub-backend.vercel.app) (Production API Endpoint)

---

## ✨ Features

- **🔐 Advanced Authentication**: Powered by **Better-Auth**, supporting secure session management and role-based access control.
- **💡 Idea Ecosystem**: Create, manage, and showcase eco-friendly ideas with ease.
- **🗳️ Dynamic Voting System**: Community-driven ranking using upvotes and downvotes to highlight high-impact projects.
- **💬 Social Engagement**: Integrated commenting system for collaborative feedback and discussion.
- **💳 Secure Payments**: Seamless **Stripe** integration for project support and transactions.
- **🛠️ Admin Command Center**: Comprehensive dashboard for managing users, categories, and moderating content.
- **📁 Multi-file Prisma Schema**: Clean and scalable database architecture using Prisma's latest modular schema approach.

---

## 🚀 Technologies Used

- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Better-Auth](https://better-auth.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Tools**: `tsup`, `tsx`, `http-status`, `nodemailer`, `cloudinary`

---

## ⚙️ Setup Instructions

Follow these steps to get your local development environment up and running:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ecospark-hub.git
cd ecospark-hub
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```
Fill in the required credentials for Database, Stripe, Cloudinary, and Better-Auth.

### 4. Database Setup
Sync your database schema and generate the Prisma client:
```bash
pnpm prisma generate
pnpm prisma migrate dev
```

### 5. Run the Application
Start the development server with hot-reloading:
```bash
pnpm dev
```
The API will be available at `http://localhost:5000`.

---

## 📜 Scripts

- `pnpm dev`: Start development server using `tsx`.
- `pnpm build`: Build the project for production using `tsup`.
- `pnpm start`: Start the production server.
- `pnpm migrate`: Run Prisma migrations.
- `pnpm studio`: Open Prisma Studio to manage your data visually.

---

Developed with ❤️ for a Greener Future.
