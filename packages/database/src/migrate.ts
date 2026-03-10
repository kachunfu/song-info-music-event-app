import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './client.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function runMigrations(): Promise<void> {
  // In dev (tsx), __dirname is dist/ but migrations are in src/
  // In production (Docker), migrations are copied to dist/migrations
  let migrationsFolder = resolve(__dirname, './migrations')
  if (!existsSync(resolve(migrationsFolder, 'meta/_journal.json'))) {
    migrationsFolder = resolve(__dirname, '../src/migrations')
  }
  console.log('Running database migrations from:', migrationsFolder)
  await migrate(db, { migrationsFolder })
  console.log('Database migrations complete.')
}
