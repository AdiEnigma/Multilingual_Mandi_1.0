# Database Setup Guide

This guide explains how to set up the database for the Marketplace Mandi backend.

## Prerequisites

- PostgreSQL 12+ installed and running
- Redis server installed and running
- Node.js 18+ installed

## Database Schema Overview

The database consists of the following main tables:

### Core Tables
- **users**: User profiles with authentication and reputation data
- **categories**: Product categories with hierarchical structure
- **product_listings**: Product listings created by sellers
- **chats**: Chat sessions between buyers and sellers
- **messages**: Individual messages within chats
- **deals**: Completed transactions between users
- **ratings**: User ratings and reviews after deals

### Supporting Tables
- **price_data**: Market price data from various sources
- **otp_verifications**: OTP codes for phone verification
- **sessions**: User session management

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/marketplace_mandi"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Other required variables (see .env.example)
```

### 2. Database Creation

Create the PostgreSQL database:

```sql
CREATE DATABASE marketplace_mandi;
```

### 3. Run Migrations

#### Option A: Using Prisma (Recommended)

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

#### Option B: Manual SQL Migration

If Prisma migration fails, you can run the SQL script directly:

```bash
# Connect to PostgreSQL
psql -U username -d marketplace_mandi

# Run the migration script
\i scripts/create-migration.sql
```

#### Option C: Using Migration Script

```bash
# Run the automated migration script
node scripts/migrate.js
```

### 4. Verify Setup

Check that all tables were created:

```sql
\dt
```

You should see all the tables listed above.

## Database Relationships

### User Relationships
- Users can create multiple product listings (1:N)
- Users can participate in multiple chats as buyer or seller (1:N)
- Users can send/receive multiple messages (1:N)
- Users can have multiple deals (1:N)
- Users can give/receive multiple ratings (1:N)

### Product & Category Relationships
- Categories have hierarchical structure (self-referencing)
- Each listing belongs to one category (N:1)
- Listings can have multiple associated chats (1:N)

### Chat & Message Relationships
- Each chat belongs to one listing (N:1)
- Each chat has two users: buyer and seller (N:1 each)
- Each chat can have multiple messages (1:N)
- Each chat can result in multiple deals (1:N)

### Deal & Rating Relationships
- Each deal belongs to one chat (N:1)
- Each deal can have multiple ratings (1:N)
- Each rating belongs to one deal (N:1)

## Indexes and Performance

The schema includes several indexes for optimal performance:

- **users.phone_number**: Unique index for authentication
- **price_data.product_name, category**: Composite index for price lookups
- **price_data.collected_at**: Index for time-based queries
- **otp_verifications.phone_number, otp**: Composite index for OTP verification
- **sessions.token**: Unique index for session management
- **sessions.user_id**: Index for user session queries

## Data Types and Constraints

### JSON Fields
- **users.location**: Stores state, district, pincode, coordinates
- **product_listings.quantity**: Stores amount and unit
- **product_listings.asking_price**: Stores amount, currency, unit
- **product_listings.location**: Stores location details
- **price_data.location**: Stores location information

### Validation Rules
- Phone numbers must be unique across users
- Each deal can only have one rating per user (unique constraint)
- Session tokens must be unique
- All foreign key relationships have CASCADE delete for data integrity

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure PostgreSQL is running and credentials are correct
2. **Permission Error**: Make sure the database user has CREATE privileges
3. **Migration Fails**: Try running the SQL script manually
4. **Seed Fails**: Check that all tables exist before seeding

### Reset Database

To completely reset the database:

```bash
npm run db:reset
```

This will drop all tables, run migrations, and seed initial data.

### Database Studio

To explore the database visually:

```bash
npm run db:studio
```

This opens Prisma Studio in your browser.

## Production Considerations

1. **Environment Variables**: Use strong secrets in production
2. **Connection Pooling**: Configure appropriate connection limits
3. **Backups**: Set up regular database backups
4. **Monitoring**: Monitor query performance and slow queries
5. **Security**: Use SSL connections and restrict database access
6. **Scaling**: Consider read replicas for high-traffic scenarios

## Schema Validation

The database schema validates the following requirements:

- **Requirement 1.4**: User profile storage with reputation scoring
- **Requirement 2.2**: Product listing storage with multilingual support
- **Requirement 4.2**: Message storage with original and translated versions
- **Requirement 7.1**: Rating and reputation system
- **Requirement 8.5**: Price data storage with metadata and confidence scoring

All foreign key relationships ensure data integrity and support the multilingual, AI-powered marketplace functionality.