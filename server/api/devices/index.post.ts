import type { DeviceCreate } from '~/types'

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

  const body = await readBody<DeviceCreate>(event)

  if (!body.name) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz adı gerekli',
    })
  }

  try {
    const now = new Date().toISOString()

    const device = await db
      .prepare('INSERT INTO devices (user_id, name, type, status, location, field_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *')
      .bind(userId, body.name, body.type || null, body.status || 'active', body.location || null, body.field_id || null, now, now)
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
    console.error('Create device error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihaz oluşturulurken hata oluştu',
    })
  }
})
