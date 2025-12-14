import knex from 'knex'

const db = knex({
  client: 'mssql',
  connection: {
    server: 'localhost',
    database: 'agrisense',
    user: 'sa',
    password: '12345678tT',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  },
  pool: {
    min: 0,
    max: 10,
  },
})

export default db
