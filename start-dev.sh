#!/bin/bash

echo "Starting Marketplace Mandi Development Environment..."

echo ""
echo "Step 1: Starting PostgreSQL and Redis with Docker..."
docker run --name marketplace-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=marketplace_mandi -p 5432:5432 -d postgres:13
docker run --name marketplace-redis -p 6379:6379 -d redis:alpine

echo ""
echo "Step 2: Waiting for databases to start..."
sleep 10

echo ""
echo "Step 3: Setting up backend database..."
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed

echo ""
echo "Step 4: Starting backend server..."
gnome-terminal -- bash -c "npm run dev; exec bash" &

echo ""
echo "Step 5: Starting frontend server..."
cd ../frontend
gnome-terminal -- bash -c "npm run dev; exec bash" &

echo ""
echo "Setup complete!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo ""