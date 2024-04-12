import { env } from './env'
import { knex as setupKnex } from 'knex'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE)URL not found')
}

export const config = {
  client: env.DATABASE_CLIENT, // 'sqlite3'
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? { filename: env.DATABASE_URL }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  // connection: {
  //  filename: env.DATABASE_URL,
  // },
}

export const knex = setupKnex(config)
