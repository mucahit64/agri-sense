export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare.env.DB

  const { results } = await db
    .prepare('SELECT * FROM users')
    .all()

  return results
})
