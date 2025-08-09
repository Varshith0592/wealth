# Wealth - Personal Finance Management Platform

A comprehensive Next.js-based personal finance management platform that helps users track, analyze, and optimize their financial health with AI-powered insights.

## 🚀 Features

### 📊 **Dashboard & Analytics**
- **Real-time Financial Overview**: Get instant insights into your financial health
- **Advanced Analytics**: AI-powered spending pattern analysis with visual charts
- **Multi-account Dashboard**: View all your accounts in one unified interface
- **Transaction Trends**: Track spending habits over time with interactive graphs

### 💳 **Account Management**
- **Multi-Account Support**: Manage checking, savings, and credit card accounts
- **Account Balance Tracking**: Real-time balance updates across all accounts
- **Default Account Setting**: Set primary accounts for quick access
- **Account Creation**: Easy setup for new financial accounts

### 💰 **Transaction Management**
- **Smart Transaction Entry**: Quick and intuitive transaction logging
- **Receipt Scanner**: AI-powered receipt scanning with automatic data extraction
- **Transaction Categorization**: Auto-categorize transactions for better organization
- **Recurring Transactions**: Set up and manage recurring income/expenses
- **Transaction History**: Complete searchable transaction history with filters

### 🎯 **Budget Planning**
- **Smart Budget Creation**: Set monthly budgets with AI recommendations
- **Budget Progress Tracking**: Visual progress bars showing spending vs budget
- **Budget Alerts**: Get notified when approaching budget limits
- **Spending Analysis**: Detailed breakdown of budget utilization

### 📈 **Financial Insights**
- **AI-Powered Recommendations**: Personalized financial advice based on spending patterns
- **Spending Analytics**: Detailed analysis of where your money goes
- **Income vs Expense Tracking**: Visual comparison of earnings vs spending
- **Financial Goal Tracking**: Set and monitor progress toward financial goals

### 📱 **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Toggle between light and dark themes
- **Intuitive Navigation**: Clean, user-friendly interface
- **Quick Actions**: Fast transaction entry and account management

### 🔐 **Security & Privacy**
- **Clerk Authentication**: Secure user authentication and management
- **Data Encryption**: End-to-end encryption for sensitive financial data
- **Privacy Controls**: Full control over data sharing and privacy settings
- **Secure API**: Protected endpoints with rate limiting and security measures

### 📧 **Communication**
- **Email Notifications**: Transaction alerts and budget reminders
- **Weekly Reports**: Automated financial summary emails
- **Custom Alerts**: Set up personalized notification preferences
- **Email Templates**: Beautiful, responsive email designs

### 🛠️ **Technical Features**
- **Server-Side Rendering**: Fast loading with Next.js SSR
- **Database Management**: PostgreSQL with Prisma ORM
- **Real-time Updates**: Instant data synchronization
- **API Integration**: RESTful API for third-party integrations
- **Background Jobs**: Automated processing with Inngest

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React version
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern, accessible components

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Modern database toolkit
- **PostgreSQL** - Primary database
- **Inngest** - Background job processing

### **Authentication & Security**
- **Clerk** - User authentication and management
- **Arcjet** - Security and rate limiting
- **NextAuth.js** - Authentication middleware

### **External Services**
- **Resend** - Email service
- **React Email** - Email template system
- **Google Gemini AI** - AI-powered features

### **Development Tools**
- **ESLint** - Code linting
- **Prisma Studio** - Database management
- **React Email Dev** - Email development server

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Clerk account for authentication
- Resend account for emails

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd wealth
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
# Database
(Connect to Database via connection pooling)
DATABASE_URL=""
(Direct connection to the database. Used for migrations)
DIRECT_URL=""

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Email
RESEND_API_KEY=your_resend_api_key

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Start email development server (optional)**
```bash
npm run email
```

## 📊 Usage

### **Getting Started**
1. Sign up with your email or social login
2. Add your first bank account
3. Start tracking transactions
4. Set up budgets and financial goals

### **Adding Transactions**
- Manual entry through the dashboard
- Upload receipts for automatic scanning
- Import from bank statements
- Set up recurring transactions

### **Managing Budgets**
- Create monthly budgets by category
- Set spending limits with alerts
- Track progress with visual indicators
- Adjust budgets based on spending patterns

### **Analyzing Finances**
- View spending trends over time
- Compare income vs expenses
- Identify areas for savings
- Get AI-powered recommendations

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run email` - Start email development server

### **Database Management**
- `npx prisma studio` - Open Prisma Studio
- `npx prisma db push` - Push schema changes
- `npx prisma migrate dev` - Create migrations

## 🏗️ Architecture

### **Project Structure**
```
wealth/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Protected routes
│   ├── api/               # API routes
│   └── lib/               # Utility functions
├── components/            # Reusable components
├── actions/               # Server actions
├── lib/                   # Shared utilities
├── prisma/                # Database schema
└── public/                # Static assets
```

### **Key Components**
- **Dashboard**: Main financial overview
- **Account Management**: Multi-account support
- **Transaction System**: Complete transaction lifecycle
- **Budget Engine**: Smart budgeting system
- **Analytics Engine**: AI-powered insights

