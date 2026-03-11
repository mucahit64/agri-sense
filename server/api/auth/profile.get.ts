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
    .prepare('SELECT name, surname, username, mail, phone, language, country FROM users WHERE id = ?')
    .bind(userId)
    .first<{ name: string | null, surname: string | null, username: string, mail: string, phone: string | null, language: string | null, country: string | null }>()

  return {
    success: true,
    profile: {
      name: user?.name || null,
      surname: user?.surname || null,
      username: user?.username || null,
      mail: user?.mail || null,
      phone: user?.phone || null,
      language: user?.language || null,
      country: user?.country || null,
    },
  }
})
