import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './client.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function runMigrations(): Promise<void> {
  console.log('Running database migrations...')
  await migrate(db, { migrationsFolder: resolve(__dirname, './migrations') })
  console.log('Database migrations complete.')
}
