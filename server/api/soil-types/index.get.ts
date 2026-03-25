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
    const { results: soilTypes } = await db
      .prepare(
        `SELECT id, name, created_by, is_system, is_approved, is_active, created_at
         FROM soil_types
         WHERE is_active = 1 AND (is_system = 1 OR is_approved = 1 OR created_by = ?)
         ORDER BY is_system DESC, name ASC`,
      )
      .bind(userId)
      .all()

    return {
      success: true,
      soilTypes,
    }
  }
  catch (error: any) {
    console.error('Get soil types error:', error)

    if (String(error?.message || '').includes('no such table: soil_types')) {
      throw createError({
        statusCode: 500,
        message: 'soil_types tablosu bulunamadı. D1 migrationlarını uygulayın.',
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Toprak tipleri alınırken hata oluştu',
    })
  }
})
