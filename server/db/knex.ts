import knex from 'knex'

const config = useRuntimeConfig()

const db = knex({
  client: 'mysql2', // veya 'pg' PostgreSQL için
  connection: {
    host: config.dbHost,
    port: Number(config.dbPort),
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
  },
  pool: {
    min: 2,
    max: 10,
  },
})

export default db
