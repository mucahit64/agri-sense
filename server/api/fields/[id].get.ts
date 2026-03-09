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

  const id = getRouterParam(event, 'id')

  try {
    const field = await db
      .prepare('SELECT * FROM fields WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()

    if (!field) {
      throw createError({
        statusCode: 404,
        message: 'Tarla bulunamadı',
      })
    }

    return {
      success: true,
      field,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Get field error:', error)
    throw createError({
      statusCode: 500,
      message: 'Tarla bilgisi alınırken hata oluştu',
    })
  }
})
