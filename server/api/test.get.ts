export default defineEventHandler(async (event) => {
  try {
    const db = event.context.cloudflare.env.DB

    if (!db) {
      return { error: 'D1 database binding bulunamadı', context: Object.keys(event.context.cloudflare?.env || {}) }
    }

    const { results } = await db
      .prepare('SELECT * FROM users')
      .all()

    return { success: true, count: results.length, users: results }
  }
  catch (error: any) {
    return { success: false, error: error.message, stack: error.stack }
  }
})
