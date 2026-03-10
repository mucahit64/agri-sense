export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const session = await useAuthSession(event)

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadi',
    })
  }

  const user = await db
    .prepare('SELECT language, country FROM users WHERE id = ?')
    .bind(userId)
    .first<{ language: string | null, country: string | null }>()

  return {
    success: true,
    profile: {
      language: user?.language || null,
      country: user?.country || null,
    },
  }
})
