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
    const device = await db
      .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()

    if (!device) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    await db
      .prepare('DELETE FROM devices WHERE id = ?')
      .bind(id)
      .run()

    return {
      success: true,
      message: 'Cihaz silindi',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Delete device error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihaz silinirken hata oluştu',
    })
  }
})
