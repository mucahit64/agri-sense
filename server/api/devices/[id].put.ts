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
    const existing = await db
      .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()

    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    const body = await readBody(event)
    const now = new Date().toISOString()

    await db
      .prepare(`UPDATE devices SET
        name = ?,
        type = ?,
        status = ?,
        location = ?,
        field_id = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?`)
      .bind(
        body.name ?? existing.name,
        body.type ?? existing.type,
        body.status !== undefined ? body.status : existing.status,
        body.location ?? existing.location,
        body.field_id !== undefined ? body.field_id : existing.field_id,
        now,
        id,
        userId,
      )
      .run()

    const device = await db
      .prepare('SELECT * FROM devices WHERE id = ?')
      .bind(id)
      .first()

    return {
      success: true,
      device,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Update device error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihaz güncellenirken hata oluştu',
    })
  }
})
