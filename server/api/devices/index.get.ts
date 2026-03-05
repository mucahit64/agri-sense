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
    const { results: devices } = await db
      .prepare('SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all()

    return {
      success: true,
      devices,
    }
  }
  catch (error: any) {
    console.error('Get devices error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihazlar alınırken hata oluştu',
    })
  }
})
