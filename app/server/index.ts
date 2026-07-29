import { getDatabaseContext } from './db/context'
import { runMigrations } from './db/migrate'
import { seedDatabase } from './db/seed'
import { startApiServer } from './app'

async function main() {
  const database = getDatabaseContext()
  runMigrations(database)
  await seedDatabase(database)
  startApiServer(database)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})