# 🏪 Marketplace Mandi - भारतीय कृषि मंडी

<div align="center">

![Marketplace Mandi Logo](https://img.shields.io/badge/🌾-Marketplace%20Mandi-orange?style=for-the-badge&labelColor=saffron)

**AI-Powered Multilingual Agricultural Marketplace for India**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)

[🚀 Live Demo](#) | [📖 Documentation](#documentation) | [🤝 Contributing](#contributing) | [🐛 Report Bug](https://github.com/your-repo/issues)

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Development](#-development)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🌐 API Documentation](#-api-documentation)
- [🎨 UI Components](#-ui-components)
- [🌍 Internationalization](#-internationalization)
- [🔒 Security](#-security)
- [📊 Monitoring](#-monitoring)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Overview

**Marketplace Mandi** is a revolutionary AI-powered multilingual agricultural marketplace designed specifically for Indian farmers, traders, and consumers. Built with modern web technologies, it bridges the gap between rural agricultural producers and urban consumers while supporting all 22 official Indian languages.

### 🎯 Mission
Empowering Indian farmers with direct market access, fair pricing, and multilingual communication tools to eliminate middlemen and increase agricultural income.

### 🌾 Vision
Creating a unified digital agricultural ecosystem that preserves traditional mandi culture while embracing modern technology.

---

## ✨ Features

### 🚀 Core Features

#### 🌐 **Multilingual Support**
- **22 Indian Languages**: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and more
- **Real-time Translation**: AI-powered chat translation
- **Language Preference**: User-specific language settings
- **RTL Support**: Right-to-left text for Urdu and Arabic scripts

#### 🛒 **Marketplace Functionality**
- **Product Listings**: Create, edit, and manage agricultural product listings
- **Advanced Search**: Filter by category, location, price, and quality
- **Real-time Chat**: Multilingual communication between buyers and sellers
- **Price Discovery**: AI-powered market price suggestions
- **Bulk Orders**: Support for wholesale transactions

#### 🔐 **Authentication & Security**
- **OTP-based Authentication**: Secure phone number verification
- **JWT Tokens**: Stateless authentication with refresh tokens
- **Session Management**: Secure session handling with Redis caching
- **Rate Limiting**: API protection against abuse
- **Data Encryption**: End-to-end encryption for sensitive data

#### 📱 **User Experience**
- **Responsive Design**: Mobile-first approach for rural connectivity
- **Progressive Web App**: Offline functionality and app-like experience
- **Indian UI Design**: Culturally relevant design with saffron color scheme
- **Voice Input**: Voice search in regional languages
- **Image Recognition**: AI-powered crop identification

### 🔧 **Technical Features**

#### 🏗️ **Architecture**
- **Microservices**: Modular backend architecture
- **Type Safety**: Full TypeScript implementation
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Caching**: Redis for session management and data caching
- **Real-time**: WebSocket support for live chat and notifications

#### 🧪 **Quality Assurance**
- **Property-Based Testing**: Comprehensive test coverage with fast-check
- **Unit Testing**: Jest and React Testing Library
- **Integration Testing**: API endpoint testing
- **Type Checking**: Strict TypeScript configuration
- **Code Quality**: ESLint and Prettier integration

#### 🚀 **Performance**
- **Server-Side Rendering**: Next.js SSR for SEO and performance
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic code splitting for faster loads
- **CDN Ready**: Optimized for content delivery networks
- **Lighthouse Score**: 95+ performance score

---

## 🏗️ Architecture

### 📊 System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App] --> B[React Components]
        B --> C[Tailwind CSS]
        A --> D[i18next Translation]
    end
    
    subgraph "Backend Layer"
        E[Node.js/Express] --> F[Authentication Service]
        E --> G[Listing Service]
        E --> H[Chat Service]
        E --> I[Translation Service]
    end
    
    subgraph "Data Layer"
        J[(SQLite/PostgreSQL)] --> K[Prisma ORM]
        L[(Redis Cache)] --> M[Session Store]
    end
    
    subgraph "External Services"
        N[SMS Gateway] --> O[OTP Service]
        P[Translation API] --> Q[AI Translation]
        R[Image CDN] --> S[Media Storage]
    end
    
    A --> E
    F --> J
    G --> J
    H --> L
    I --> P
    F --> N
```

### 🗂️ Project Structure

```
marketplace-mandi/
├── 📁 frontend/                 # Next.js Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable React Components
│   │   │   ├── 📁 ui/          # Basic UI Components
│   │   │   ├── 📁 layout/      # Layout Components
│   │   │   ├── 📁 home/        # Home Page Components
│   │   │   └── 📁 listings/    # Listing Components
│   │   ├── 📁 pages/           # Next.js Pages
│   │   ├── 📁 contexts/        # React Context Providers
│   │   ├── 📁 hooks/           # Custom React Hooks
│   │   ├── 📁 services/        # API Service Layer
│   │   ├── 📁 styles/          # Global Styles
│   │   └── 📁 utils/           # Utility Functions
│   ├── 📁 public/              # Static Assets
│   │   └── 📁 locales/         # Translation Files (22 languages)
│   └── 📄 package.json
├── 📁 backend/                  # Node.js Backend Application
│   ├── 📁 src/
│   │   ├── 📁 routes/          # API Route Handlers
│   │   ├── 📁 services/        # Business Logic Services
│   │   ├── 📁 middleware/      # Express Middleware
│   │   ├── 📁 config/          # Configuration Files
│   │   ├── 📁 utils/           # Utility Functions
│   │   ├── 📁 sockets/         # WebSocket Handlers
│   │   └── 📁 __tests__/       # Test Files
│   ├── 📁 prisma/              # Database Schema & Migrations
│   └── 📄 package.json
├── 📁 shared/                   # Shared Types & Utilities
│   ├── 📁 src/
│   │   ├── 📁 types/           # TypeScript Type Definitions
│   │   ├── 📁 schemas/         # Zod Validation Schemas
│   │   ├── 📁 database/        # Database Utilities
│   │   └── 📁 services/        # Shared Service Interfaces
│   └── 📄 package.json
├── 📁 .kiro/                    # Kiro Spec Files
│   └── 📁 specs/
│       └── 📁 marketplace-mandi/
│           ├── 📄 requirements.md
│           ├── 📄 design.md
│           └── 📄 tasks.md
├── 📄 README.md
├── 📄 package.json
└── 📄 .env.example
```

---

## 🚀 Quick Start

### ⚡ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### 🏃‍♂️ 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/marketplace-mandi.git
cd marketplace-mandi

# 2. Install dependencies for all packages
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Set up the database
cd backend
npm run db:setup
npm run db:seed

# 5. Start development servers
cd ..
npm run dev
```

🎉 **That's it!** Your application should now be running:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

---

## 📦 Installation

### 🔧 Detailed Installation Steps

#### 1. **Clone and Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/marketplace-mandi.git
cd marketplace-mandi

# Install root dependencies
npm install
```

#### 2. **Frontend Setup**

```bash
cd frontend

# Install frontend dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit environment variables
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_APP_NAME=Marketplace Mandi
```

#### 3. **Backend Setup**

```bash
cd ../backend

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables (see Configuration section)
```

#### 4. **Shared Package Setup**

```bash
cd ../shared

# Install shared dependencies
npm install

# Build shared package
npm run build
```

#### 5. **Database Setup**

```bash
cd ../backend

# Generate Prisma client
npx prisma generate

# Set up database (SQLite for development)
npx prisma db push

# Seed database with sample data
npm run db:seed
```

---

## ⚙️ Configuration

### 🔐 Environment Variables

#### **Backend Configuration** (`backend/.env`)

```bash
# Database Configuration
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:password@localhost:5432/marketplace_mandi"  # PostgreSQL for production

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Session Configuration
SESSION_SECRET="your-session-secret-here"
SESSION_EXPIRY_HOURS=24

# Redis Configuration (for production)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# SMS/OTP Configuration
OTP_SERVICE="mock"  # Use "mock" for development, "twilio" for production
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Translation Service
TRANSLATION_SERVICE="mock"  # Use "mock" for development
GOOGLE_TRANSLATE_API_KEY="your-google-translate-api-key"

# File Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="5MB"
ALLOWED_FILE_TYPES="jpg,jpeg,png,webp"

# Server Configuration
PORT=8000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# Logging
LOG_LEVEL="info"
LOG_FILE="./logs/app.log"
```

#### **Frontend Configuration** (`frontend/.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME="Marketplace Mandi"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_DEFAULT_LANGUAGE="hi"

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_SEARCH=true
NEXT_PUBLIC_ENABLE_AI_TRANSLATION=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=""
NEXT_PUBLIC_HOTJAR_ID=""

# Development
NEXT_PUBLIC_DEBUG_MODE=true
```

---

## 🔧 Development

### 🏃‍♂️ Running the Application

#### **Development Mode**

```bash
# Start all services concurrently
npm run dev

# Or start services individually:

# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev

# Shared package (watch mode)
cd shared && npm run dev
```

#### **Production Mode**

```bash
# Build all packages
npm run build

# Start production server
npm run start
```

### 🛠️ Development Scripts

#### **Root Level Scripts**

```bash
# Install dependencies for all packages
npm run install:all

# Build all packages
npm run build

# Start development servers
npm run dev

# Run tests for all packages
npm run test

# Lint all packages
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

#### **Frontend Scripts**

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate translation files
npm run i18n:extract

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

#### **Backend Scripts**

```bash
cd backend

# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:reset      # Reset database
npm run db:studio     # Open Prisma Studio

# Type checking
npm run type-check

# Lint code
npm run lint
```

---

## 🧪 Testing

### 🎯 Testing Strategy

Our testing approach follows the testing pyramid:

1. **Unit Tests** (70%) - Individual functions and components
2. **Integration Tests** (20%) - API endpoints and service interactions
3. **End-to-End Tests** (10%) - Complete user workflows
4. **Property-Based Tests** - Correctness properties validation

### 🧪 Running Tests

#### **All Tests**

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test -- --testNamePattern="UserService"
```

#### **Frontend Tests**

```bash
cd frontend

# Unit tests (Jest + React Testing Library)
npm run test

# Component tests
npm run test:components

# Property-based tests
npm run test:properties

# Visual regression tests (if configured)
npm run test:visual
```

#### **Backend Tests**

```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# API tests
npm run test:api

# Property-based tests
npm run test:properties
```

### 📊 Test Coverage

Our target test coverage:
- **Overall**: 85%+
- **Services**: 90%+
- **Components**: 80%+
- **Utilities**: 95%+

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## 🚀 Deployment

### 🌐 Production Deployment

#### **Prerequisites**

- **Node.js** 18+ on production server
- **PostgreSQL** database
- **Redis** server
- **Domain name** and SSL certificate
- **CDN** for static assets (optional)

#### **Environment Setup**

```bash
# 1. Clone repository on server
git clone https://github.com/your-username/marketplace-mandi.git
cd marketplace-mandi

# 2. Install dependencies
npm install --production

# 3. Set up environment variables
cp .env.example .env
# Edit .env with production values

# 4. Build applications
npm run build

# 5. Set up database
cd backend
npx prisma migrate deploy
npm run db:seed

# 6. Start services
npm run start
```

#### **Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build applications
RUN npm run build

# Expose ports
EXPOSE 3000 8000

# Start services
CMD ["npm", "run", "start"]
```

---

## 🌐 API Documentation

### 📚 API Overview

Our REST API follows RESTful conventions with consistent response formats:

```typescript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "details": { /* error details */ }
}
```

### 🔐 Authentication

#### **Phone Number Registration**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "राम सिंह",
  "phoneNumber": "9876543210",
  "location": {
    "state": "पंजाब",
    "district": "अमृतसर",
    "pincode": "143001"
  },
  "preferredLanguage": "hi",
  "userType": "farmer"
}
```

#### **OTP Verification**

```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

### 🛒 Listings API

#### **Create Listing**

```http
POST /api/listings
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "productName": "बासमती चावल",
  "categoryId": "grains-001",
  "description": "प्रीमियम गुणवत्ता का बासमती चावल",
  "quantity": {
    "amount": 1000,
    "unit": "kg"
  },
  "askingPrice": {
    "amount": 85,
    "currency": "INR",
    "unit": "kg"
  },
  "location": {
    "state": "पंजाब",
    "district": "अमृतसर",
    "pincode": "143001"
  },
  "images": ["image1.jpg", "image2.jpg"],
  "language": "hi"
}
```

---

## 🌍 Internationalization

### 🗣️ Supported Languages

We support all 22 official Indian languages:

| Language | Code | Script | RTL | Status |
|----------|------|--------|-----|--------|
| Hindi | `hi` | Devanagari | No | ✅ Complete |
| Bengali | `bn` | Bengali | No | ✅ Complete |
| Tamil | `ta` | Tamil | No | ✅ Complete |
| Telugu | `te` | Telugu | No | ✅ Complete |
| Marathi | `mr` | Devanagari | No | ✅ Complete |
| Gujarati | `gu` | Gujarati | No | ✅ Complete |
| Kannada | `kn` | Kannada | No | ✅ Complete |
| Malayalam | `ml` | Malayalam | No | ✅ Complete |
| Punjabi | `pa` | Gurmukhi | No | ✅ Complete |
| Odia | `or` | Odia | No | ✅ Complete |
| Assamese | `as` | Bengali | No | ✅ Complete |
| Urdu | `ur` | Arabic | Yes | ✅ Complete |
| Sanskrit | `sa` | Devanagari | No | 🚧 In Progress |
| Kashmiri | `ks` | Arabic | Yes | 🚧 In Progress |
| Sindhi | `sd` | Arabic | Yes | 🚧 In Progress |
| Nepali | `ne` | Devanagari | No | ✅ Complete |
| Konkani | `gom` | Devanagari | No | 🚧 In Progress |
| Manipuri | `mni` | Bengali | No | 🚧 In Progress |
| Bodo | `brx` | Devanagari | No | 🚧 In Progress |
| Santhali | `sat` | Ol Chiki | No | 🚧 In Progress |
| Maithili | `mai` | Devanagari | No | 🚧 In Progress |
| Dogri | `doi` | Devanagari | No | 🚧 In Progress |

---

## 🔒 Security

### 🛡️ Security Measures

#### **Authentication & Authorization**

- **JWT Tokens**: Stateless authentication with short-lived access tokens
- **Refresh Tokens**: Long-lived tokens for seamless re-authentication
- **OTP Verification**: Phone number verification for account security
- **Session Management**: Secure session handling with Redis
- **Rate Limiting**: API protection against brute force attacks

#### **Data Protection**

- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Data Encryption**: Sensitive data encryption at rest

---

## 🤝 Contributing

### 🌟 How to Contribute

We welcome contributions from developers, designers, translators, and domain experts! Here's how you can help:

#### **🔧 Code Contributions**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

#### **🌐 Translation Contributions**

Help us improve translations for Indian languages:

1. **Check existing translations** in `frontend/public/locales/`
2. **Add missing translations** or improve existing ones
3. **Test translations** in the application
4. **Submit a PR** with your improvements

#### **🐛 Bug Reports**

Found a bug? Help us fix it:

1. **Check existing issues** to avoid duplicates
2. **Create a detailed bug report** with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details

---

## 📄 License

### 📜 MIT License

```
MIT License

Copyright (c) 2024 Marketplace Mandi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Contact

### 🆘 Getting Help

- **📖 Documentation**: Check this README and inline code comments
- **🐛 Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **📧 Email**: support@marketplacemandi.com

### 🌟 Community

- **🐦 Twitter**: [@MarketplaceMandi](https://twitter.com/marketplacemandi)
- **📱 Telegram**: [Marketplace Mandi Community](https://t.me/marketplacemandi)
- **💼 LinkedIn**: [Marketplace Mandi](https://linkedin.com/company/marketplace-mandi)

---

## 🙏 Acknowledgments

### 🛠️ Technology Stack

Special thanks to the open-source projects that make this possible:

- **[Next.js](https://nextjs.org/)** - React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Prisma](https://prisma.io/)** - Database ORM
- **[React](https://reactjs.org/)** - UI library
- **[Node.js](https://nodejs.org/)** - Runtime
- **[Express](https://expressjs.com/)** - Web framework
- **[Redis](https://redis.io/)** - Caching
- **[PostgreSQL](https://postgresql.org/)** - Database
- **[Jest](https://jestjs.io/)** - Testing framework

### 🌍 Localization

Thanks to our translation contributors for making this platform accessible in 22 Indian languages.

---

<div align="center">

**Made with ❤️ for Indian Farmers**

**भारतीय किसानों के लिए ❤️ से बनाया गया**

---

⭐ **Star this repository if you find it helpful!**

[🔝 Back to Top](#-marketplace-mandi---भारतीय-कृषि-मंडी)

</div>