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
      .prepare('SELECT id FROM fields WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()

    if (!field) {
      throw createError({
        statusCode: 404,
        message: 'Tarla bulunamadı',
      })
    }

    // Clear field_id from devices (devices themselves are kept)
    await db
      .prepare('UPDATE devices SET field_id = NULL WHERE field_id = ?')
      .bind(id)
      .run()

    // Delete dependent records
    await db.prepare('DELETE FROM device_assignments WHERE field_id = ?').bind(id).run()
    await db.prepare('DELETE FROM weather WHERE field_id = ?').bind(id).run()
    await db.prepare('DELETE FROM ai_decisions WHERE field_id = ?').bind(id).run()

    await db
      .prepare('DELETE FROM fields WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .run()

    return {
      success: true,
      message: 'Tarla silindi',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Delete field error:', error)
    throw createError({
      statusCode: 500,
      message: 'Tarla silinirken hata oluştu',
    })
  }
})
