import { env } from './env'
import { knex as setupKnex } from 'knex'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE)URL not found')
}

export const config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
}

export const knex = setupKnex(config)
