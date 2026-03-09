import type { FieldCreate } from '~/types'

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

  const body = await readBody<FieldCreate>(event)

  if (!body.name) {
    throw createError({
      statusCode: 400,
      message: 'Tarla adı gerekli',
    })
  }

  try {
    const now = new Date().toISOString()

    const field = await db
      .prepare('INSERT INTO fields (user_id, name, lat, lon, area_m2, soil_type, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?) RETURNING *')
      .bind(userId, body.name, body.lat || null, body.lon || null, body.area_m2 || null, body.soil_type || null, now, now)
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
    console.error('Create field error:', error)
    throw createError({
      statusCode: 500,
      message: 'Tarla oluşturulurken hata oluştu',
    })
  }
})
