<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">📦 StockSense</h1>
<p align="center">
  <strong>Precision Inventory. Zero Guesswork.</strong>
</p>
<p align="center">
  A full-stack Stock Maintenance System (SMS) built with Next.js, featuring real-time inventory tracking, role-based access control, comprehensive reporting, and a premium dark-themed UI.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-testing">Testing</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Features

### 📊 Dashboard & Analytics
- **Real-time statistics** — Total SKUs, low stock alerts, out-of-stock counts, and daily transaction volume
- **Interactive charts** — Stock distribution by category (Bar chart) and transaction trend over time (Area chart) powered by Recharts
- **Quick actions** — One-click navigation to add stock, generate reports, or view alerts

### 📦 Inventory Management
- **Full CRUD operations** — Add, view, edit, and manage stock items with SKU-level detail
- **Smart filtering** — Search by name/SKU, filter by stock status and category with debounced queries
- **Status tracking** — Visual status flow (In Stock → Low Stock → Out of Stock → Backordered) with color-coded badges
- **QR Code generation** — Built-in QR code support for each inventory item
- **Inline quantity adjustments** — Quick stock-in/stock-out operations directly from the inventory table

### 💸 Transaction Ledger
- **Complete audit trail** — Every stock movement (Sale, Restock, Return, Adjustment, Reservation, Damage Write-off) is recorded
- **Quantity change tracking** — Previous quantity, new quantity, and net change logged per transaction
- **Filterable history** — Filter transactions by action type, date range, and user

### 📋 Reports & Exports
- **4 report types** — Low Stock, Transaction History, Stock Levels, and Sales Summary
- **Multi-format export** — Download reports as **PDF** (with styled tables via jsPDF) or **Excel** (via SheetJS/xlsx)
- **Date range & category filters** — Generate targeted reports with flexible filtering options

### 🔔 Notifications
- **Automated alerts** — Low stock and out-of-stock notifications generated automatically
- **Read/unread tracking** — Mark individual notifications as read, with unread count badge in the top bar
- **Linked navigation** — Each notification links directly to the relevant inventory item

### 👥 User Management (Admin)
- **Role-based access control** — Three roles: **Admin**, **Manager**, and **Staff** with granular permissions
- **User CRUD** — Admins can add, edit roles, and delete users
- **Secure authentication** — bcrypt password hashing with JWT session strategy via NextAuth.js

### 🛡️ Audit Logs (Admin)
- **System activity trail** — Every create, update, and delete operation across the system is logged
- **Changed fields tracking** — JSON diff of before/after states for auditing compliance
- **Export support** — Download audit logs as CSV for external review

### 🎨 Design System
- **"Dark Industrial Precision"** — A premium dark theme with neon teal accents, glassmorphism, and smooth micro-animations
- **Custom typography** — Syne (headings), DM Sans (body), IBM Plex Mono (data/numbers)
- **Staggered animations** — Entrance animations for tables, cards, and navigation elements
- **Responsive layout** — Collapsible sidebar, mobile-optimized navigation, and fluid grid layouts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + Custom CSS Design System |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (hosted on [Prisma Postgres](https://www.prisma.io/postgres)) |
| **ORM** | [Prisma 7](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js 4](https://next-auth.js.org/) (Credentials + JWT) |
| **Charts** | [Recharts 3](https://recharts.org/) |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) + CSS Keyframes |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Excel Export** | [SheetJS (xlsx)](https://sheetjs.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev/) (Toast notifications) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Selenium](https://www.selenium.dev/) + [pytest](https://pytest.org/) (E2E) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or yarn/pnpm)
- **PostgreSQL** database (local or hosted — [Prisma Postgres](https://www.prisma.io/postgres), [Neon](https://neon.tech/), [Supabase](https://supabase.com/), etc.)

### 1. Clone the Repository

```bash
git clone https://github.com/Arnavpratap2004/StockSense.git
cd StockSense
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="StockSense"

# SMTP (Optional — for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="StockSense <your@gmail.com>"
```

### 4. Set Up the Database

```bash
# Push the Prisma schema to your database
npx prisma db push

# Generate the Prisma client
npx prisma generate
```

### 5. Seed Demo Data

Start the dev server first, then seed the database:

```bash
npm run dev
```

In another terminal:

```bash
curl -X POST http://localhost:3000/api/test/reset-db
```

### 6. Launch the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@stocksense.com` | `Admin@123` |
| **Manager** | `manager@stocksense.com` | `Manager@123` |
| **Staff** | `staff@stocksense.com` | `Staff@123` |

> 💡 **Tip:** Click the role buttons on the login page to auto-fill credentials.

---

## 📁 Project Structure

```
stocksense/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (login page)
│   │   └── login/
│   │       ├── page.tsx          # Login page with branding panel
│   │       └── _components/      # LoginForm (client component)
│   ├── (dashboard)/              # Dashboard group (with sidebar layout)
│   │   ├── layout.tsx            # Sidebar + TopBar shell
│   │   ├── dashboard/            # Overview with stats & charts
│   │   ├── inventory/            # Stock list + [sku] detail + /new form
│   │   ├── transactions/         # Transaction ledger
│   │   ├── reports/              # Report generator with PDF/Excel export
│   │   ├── notifications/        # Notification center
│   │   ├── users/                # User management (Admin only)
│   │   ├── audit-logs/           # System activity trail (Admin only)
│   │   └── account/              # Profile & settings
│   ├── api/                      # RESTful API routes
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── stock/                # Stock CRUD + quantity operations
│   │   ├── transactions/         # Transaction queries
│   │   ├── reports/              # Report generation & export
│   │   ├── notifications/        # Notification CRUD
│   │   ├── users/                # User management
│   │   ├── audit-logs/           # Audit log queries & export
│   │   ├── categories/           # Category listing
│   │   ├── suppliers/            # Supplier listing
│   │   └── dashboard/            # Aggregated dashboard stats
│   ├── globals.css               # Design system & animations
│   └── layout.tsx                # Root layout with fonts & providers
├── components/
│   ├── layout/                   # Sidebar, TopBar, NotificationBell
│   ├── shared/                   # LoadingSkeleton, EmptyState, PageTransition
│   ├── providers/                # SessionProvider, ToastProvider
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── utils/                    # Formatters, status configs
│   └── validations/              # Zod schemas
├── prisma/
│   └── schema.prisma             # Database schema (7 models)
├── tests/
│   └── test_stocksense.py        # Selenium E2E test suite (35+ tests)
├── middleware.ts                  # Route protection & RBAC
└── types/                        # TypeScript type definitions
```

---

## 🔌 API Reference

All API routes are located under `/api/` and follow RESTful conventions.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out/session |

### Stock Items
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stock` | List all stock items (with pagination, search, filters) |
| `POST` | `/api/stock` | Create a new stock item |
| `GET` | `/api/stock/[sku]` | Get stock item detail with transactions |
| `PUT` | `/api/stock/[sku]` | Update stock item fields |
| `PATCH` | `/api/stock/[sku]/quantity` | Adjust stock quantity (sale/restock/return) |
| `POST` | `/api/stock/[sku]/reserve` | Reserve stock for a pending order |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | List transactions (filterable by type, date, user) |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports` | List previously generated reports |
| `POST` | `/api/reports` | Generate a new report |
| `GET` | `/api/reports/[id]/export` | Export a report as PDF/Excel |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get notifications for current user |
| `PATCH` | `/api/notifications/[id]` | Mark a notification as read |

### Users (Admin)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a new user |
| `PUT` | `/api/users/[id]` | Update user role |
| `DELETE` | `/api/users/[id]` | Delete a user |

### Audit Logs (Admin)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/audit-logs` | Query audit logs with filters |
| `GET` | `/api/audit-logs/export` | Export audit logs as CSV |

### Utility
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List all categories |
| `GET` | `/api/suppliers` | List all suppliers |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard statistics |
| `POST` | `/api/test/reset-db` | Reset database to seed state (dev only) |

---

## 🔐 Role-Based Access Control

StockSense implements three-tier RBAC enforced at both the middleware and API level:

| Feature | Admin | Manager | Staff |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| View Inventory | ✅ | ✅ | ✅ |
| Add New Stock | ✅ | ✅ | ❌ |
| Edit Stock Items | ✅ | ✅ | ❌ |
| Adjust Quantities | ✅ | ✅ | ✅ |
| View Transactions | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | ✅ | ❌ |
| View Notifications | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ |
| Account Settings | ✅ | ✅ | ✅ |

---

## 🧪 Testing

StockSense includes a comprehensive **Selenium E2E test suite** with 35+ test cases covering:

| Test Class | Coverage |
|---|---|
| `TestAuthentication` | Login form, demo buttons, password toggle, invalid/valid login |
| `TestDashboard` | Stat cards, quick actions, chart rendering |
| `TestNavigation` | Sidebar links, page navigation, top bar elements |
| `TestInventory` | Table rendering, search filter, detail page, add stock |
| `TestAddStock` | Form fields, validation |
| `TestTransactions` | Table display, data loading, filters |
| `TestReports` | Report type selector, generate button |
| `TestUsers` | User table, data display |
| `TestNotifications` | Page load, notification dropdown |
| `TestAuditLogs` | Table display, empty state |
| `TestResponsive` | Mobile menu, desktop sidebar |
| `TestAPIEndpoints` | Mock data API, categories API |

### Running Tests

```bash
# Prerequisites: Python 3.8+, Chrome browser, ChromeDriver

# Install test dependencies
pip install pytest selenium

# Ensure the dev server is running
npm run dev

# Run the test suite
cd tests
pytest test_stocksense.py -v
```

---

## 📦 Database Schema

The application uses **7 Prisma models** connected via PostgreSQL:

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │────▶│  Transaction │◀────│  StockItem   │
│          │     └──────────────┘     │              │
│  • Admin │                          │  • SKU (PK)  │
│  • Manager                          │  • Quantity   │
│  • Staff │     ┌──────────────┐     │  • Status    │
│          │────▶│    Report    │     │              │
│          │     └──────────────┘     └──────┬───────┘
│          │                                 │
│          │     ┌──────────────┐     ┌──────┴───────┐
│          │────▶│  AuditLog   │     │   Category   │
│          │     └──────────────┘     └──────────────┘
│          │                          ┌──────────────┐
│          │     ┌──────────────┐     │   Supplier   │
│          │────▶│ Notification │     └──────────────┘
└──────────┘     └──────────────┘
```

---

## 🧰 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "Add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Arnavpratap2004">Arnav Pratap</a>
</p>
