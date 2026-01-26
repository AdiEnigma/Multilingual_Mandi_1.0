-- Migration script for Marketplace Mandi database
-- This script creates all the necessary tables and relationships

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "preferred_language" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "reputation_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Create product_listings table
CREATE TABLE IF NOT EXISTS "product_listings" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "description" TEXT,
    "quantity" JSONB NOT NULL,
    "asking_price" JSONB NOT NULL,
    "location" JSONB NOT NULL,
    "images" TEXT[],
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_listings_pkey" PRIMARY KEY ("id")
);

-- Create chats table
CREATE TABLE IF NOT EXISTS "chats" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "original_language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Create deals table
CREATE TABLE IF NOT EXISTS "deals" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "agreed_price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS "ratings" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "rater_id" TEXT NOT NULL,
    "rated_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- Create price_data table
CREATE TABLE IF NOT EXISTS "price_data" (
    "id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "category" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "location" JSONB,
    "confidence_score" DOUBLE PRECISION,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_data_pkey" PRIMARY KEY ("id")
);

-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS "otp_verifications" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_number_key" ON "users"("phone_number");
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_deal_id_rater_id_key" ON "ratings"("deal_id", "rater_id");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "sessions"("token");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "price_data_product_name_category_idx" ON "price_data"("product_name", "category");
CREATE INDEX IF NOT EXISTS "price_data_collected_at_idx" ON "price_data"("collected_at");
CREATE INDEX IF NOT EXISTS "otp_verifications_phone_number_otp_idx" ON "otp_verifications"("phone_number", "otp");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions"("token");

-- Add foreign key constraints
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_listings" ADD CONSTRAINT "product_listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_listings" ADD CONSTRAINT "product_listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "chats" ADD CONSTRAINT "chats_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chats" ADD CONSTRAINT "chats_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chats" ADD CONSTRAINT "chats_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "product_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "deals" ADD CONSTRAINT "deals_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deals" ADD CONSTRAINT "deals_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deals" ADD CONSTRAINT "deals_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rated_id_fkey" FOREIGN KEY ("rated_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert sample categories
INSERT INTO "categories" ("id", "name", "parent_id") VALUES 
('cat-1', 'Grains & Cereals', NULL),
('cat-2', 'Vegetables', NULL),
('cat-3', 'Fruits', NULL),
('cat-4', 'Spices', NULL),
('cat-5', 'Pulses', NULL),
('cat-6', 'Dairy Products', NULL),
('cat-7', 'Rice', 'cat-1'),
('cat-8', 'Wheat', 'cat-1'),
('cat-9', 'Leafy Vegetables', 'cat-2'),
('cat-10', 'Root Vegetables', 'cat-2'),
('cat-11', 'Citrus Fruits', 'cat-3'),
('cat-12', 'Seasonal Fruits', 'cat-3')
ON CONFLICT ("id") DO NOTHING;

COMMIT;