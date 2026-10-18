# Retain: Personal Expense & Budget Manager

Retain is a full-stack web application for recording personal expenses, setting a monthly budget and seeing at a glance whether you are within, approaching or over it. Regular users manage their own expenses and see a spending dashboard, while administrators manage expense categories and view platform-wide insights.

**Live application:** https://retain-app-tikb.onrender.com
**Live API:** https://retain-api-ognq.onrender.com

## Technologies

The backend is a REST API built with Node.js and Express, storing data in MongoDB Atlas through Mongoose. Authentication uses JSON Web Tokens with bcrypt password hashing, and role-based middleware protects admin routes. The frontend is built with React, TypeScript and Vite, with Material UI for the interface. React Context with a reducer handles authentication, roles and protected routes, and Redux Toolkit handles expense searching, filtering, sorting and pagination. Both parts are deployed on Render, the backend as a web service and the frontend as a static site.


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

## Demo accounts

A demo user account is available for trying the live application: `demo.user@example.com` with the password `DemoUser-2026`. It has two months of sample expenses and budgets, which makes it easy to try the search, filters, sorting, pagination, budget statuses and dashboard. You can also create your own account on the sign-up page, and every new account has the normal user role.

The administrator account is not listed here because the admin area shows user details and this repository is public. Its credentials are provided in the submission notes on Canvas.

The backend runs on a free hosting instance that goes to sleep after a period of inactivity, so the first request after a quiet spell can take up to a minute while it wakes up.
