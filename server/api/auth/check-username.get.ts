export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { username, excludeId } = getQuery(event)

  if (!username || typeof username !== 'string' || !username.trim()) {
    throw createError({ statusCode: 400, message: 'Kullanıcı adı gerekli' })
  }

  let existing

  if (excludeId) {
    existing = await db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .bind(username.trim(), Number(excludeId))
      .first()
  }
  else {
    existing = await db
      .prepare('SELECT id FROM users WHERE username = ?')
      .bind(username.trim())
      .first()
  }

  return { available: !existing }
})
