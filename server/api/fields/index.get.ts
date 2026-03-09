export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const session = await useAuthSession(event)

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  try {
    const { results: fields } = await db
      .prepare('SELECT * FROM fields WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all()

    return {
      success: true,
      fields,
    }
  }
  catch (error: any) {
    console.error('Get fields error:', error)
    throw createError({
      statusCode: 500,
      message: 'Tarlalar alınırken hata oluştu',
    })
  }
})
