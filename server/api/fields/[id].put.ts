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
  const body = await readBody(event)

  try {
    // Tarlanın kullanıcıya ait olduğunu kontrol et
    const existing = await db
      .prepare('SELECT id FROM fields WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()

    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Tarla bulunamadı',
      })
    }

    const now = new Date().toISOString()

    const field = await db
      .prepare('UPDATE fields SET name = ?, lat = ?, lon = ?, area_m2 = ?, soil_type = ?, is_active = ?, updated_at = ? WHERE id = ? AND user_id = ? RETURNING *')
      .bind(
        body.name || null,
        body.lat || null,
        body.lon || null,
        body.area_m2 || null,
        body.soil_type || null,
        body.is_active !== undefined ? body.is_active : 1,
        now,
        id,
        userId,
      )
      .first()

    return {
      success: true,
      field,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Update field error:', error)
    throw createError({
      statusCode: 500,
      message: 'Tarla güncellenirken hata oluştu',
    })
  }
})
