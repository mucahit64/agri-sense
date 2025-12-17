// server/api/env.get.ts
export default defineEventHandler(() => {
  return {
    dbHost: process.env.DB_HOST,
    hasPassword: !!process.env.DB_PASSWORD,
  }
})
