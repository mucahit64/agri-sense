import type { DeviceCreate } from '~/types'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const config = useRuntimeConfig()
  const session = await useSession(event, {
    password: config.sessionSecret,
  })

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  const body = await readBody<DeviceCreate>(event)

  if (!body.device_uid) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz UID gerekli',
    })
  }

  try {
    // Cihaz zaten kayıtlı mı kontrol et
    const existing = await db
      .prepare('SELECT id FROM devices WHERE device_uid = ?')
      .bind(body.device_uid)
      .first()

    if (existing) {
      throw createError({
        statusCode: 409,
        message: 'Bu cihaz UID zaten kayıtlı',
      })
    }

    const device = await db
      .prepare('INSERT INTO devices (user_id, device_uid, device_name, is_active, created_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
      .bind(userId, body.device_uid, body.device_name || null, 1, new Date().toISOString())
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
