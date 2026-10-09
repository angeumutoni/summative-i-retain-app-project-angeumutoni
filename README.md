# Retain: Personal Expense & Budget Manager

Retain is a full-stack web application for recording personal expenses, setting a monthly budget and seeing at a glance whether you are within, approaching or over it. Regular users manage their own expenses and see a spending dashboard, while administrators manage expense categories and view platform-wide insights.

**Live application:** _to be added after frontend deployment_
**Live API:** https://retain-api-ognq.onrender.com

## Technologies

The backend is a REST API built with Node.js and Express, storing data in MongoDB Atlas through Mongoose. Authentication uses JSON Web Tokens with bcrypt password hashing, and role-based middleware protects admin routes. The frontend (added later) uses React with TypeScript and Vite, React Context for authentication and protected routes, and Redux for searching, filtering and sorting.

## Main features

Users can sign up, sign in and manage their own expenses, each with a title, amount, category, date, payment method and optional notes. The expense list supports search, category, payment method, date and amount filters, sorting by date or amount, and pagination. Users set a monthly budget and see the amount spent, the remaining budget and whether they are within, approaching (80% or more used) or over it. The dashboard shows total spending for a month, the highest expense, spending by category and recent expenses. Admins can create, rename and delete categories (deleting one moves its expenses to the default "Uncategorized" category) and view platform insights covering users, expense totals, per-category spending, the five most and least used categories, and recent expenses and sign-ups. Nobody can sign up as an admin: admin accounts are created with the seed script.

## Backend setup

```bash
git clone <this-repository-url>
cd retain-backend
npm install
cp .env.example .env
```

Fill in `.env` with your MongoDB Atlas connection string, a long random `JWT_SECRET` and the admin seed credentials, then seed the default categories and the admin account and start the server:

```bash
npm run seed
npm run dev
```

The API runs on `http://localhost:5000`, and `GET /api/health` confirms it is up.

## API overview

All routes except register, login and health require an `Authorization: Bearer <token>` header. Routes marked admin return 403 for normal users. Users can only read and modify their own expenses and budgets.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/auth/register | Create a normal user account |
| POST | /api/auth/login | Sign in and receive a token |
| GET | /api/auth/me | Current user |
| GET | /api/categories | List categories |
| POST, PUT, DELETE | /api/categories, /api/categories/:id | Manage categories (admin) |
| GET, POST | /api/expenses | List with filters, or create |
| GET, PUT, DELETE | /api/expenses/:id | One of your expenses |
| GET, PUT | /api/budgets/:month | Read or set the budget for a month (YYYY-MM) |
| GET | /api/dashboard?month=YYYY-MM | User dashboard summary |
| GET | /api/admin/insights | Platform insights (admin) |

The expense list accepts `search`, `category`, `paymentMethod`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy` (date or amount), `order` (asc or desc), `page` and `limit`.
