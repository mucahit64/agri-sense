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

  const body = await readBody<{ language?: string, country?: string }>(event)

  const language = body.language?.trim() || null
  const country = body.country?.trim() || null

  if (language && language.length > 10) {
    throw createError({
      statusCode: 400,
      message: 'Dil kodu en fazla 10 karakter olabilir',
    })
  }

  if (country && country.length > 100) {
    throw createError({
      statusCode: 400,
      message: 'Ulke en fazla 100 karakter olabilir',
    })
  }

  const now = new Date().toISOString()

  await db
    .prepare('UPDATE users SET language = ?, country = ?, updated_at = ? WHERE id = ?')
    .bind(language, country, now, userId)
    .run()

  return {
    success: true,
    profile: {
      language,
      country,
    },
  }
})
