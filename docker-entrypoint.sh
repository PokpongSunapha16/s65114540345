#!/bin/sh
set -e

echo "🚀 Running Prisma migrations (deploy)..."
npx prisma migrate deploy

if [ "$SEED_ON_STARTUP" = "true" ]; then
  echo "🌱 Seeding sample account (person1)..."
  
  npm run create_account || true

else
  echo "ℹ️ Skipping seed (SEED_ON_STARTUP not set to true)"
fi

echo "✅ Ready! Starting Next.js in production mode..."

exec "$@"
