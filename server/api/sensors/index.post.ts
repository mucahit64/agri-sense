import type { SensorCreate } from '~/types'
import { useDB } from '~/server/utils/db'

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

  const body = await readBody<SensorCreate>(event)

  if (!body.device_id || !body.sensor_uid || !body.sensor_type) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz ID, sensör UID ve sensör tipi gerekli',
    })
  }

  try {
    // Cihazın kullanıcıya ait olduğunu kontrol et
    const device = await db
      .prepare('SELECT id FROM devices WHERE id = ? AND user_id = ?')
      .bind(body.device_id, userId)
      .first()

    if (!device) {
      throw createError({
        statusCode: 403,
        message: 'Bu cihaza erişim yetkiniz yok',
      })
    }

    const sensor = await db
      .prepare('INSERT INTO sensors (device_id, sensor_uid, sensor_type, name, pin, unit, min_value, max_value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *')
      .bind(
        body.device_id,
        body.sensor_uid,
        body.sensor_type,
        body.name || null,
        body.pin || null,
        body.unit || null,
        body.min_value || null,
        body.max_value || null,
        new Date().toISOString(),
      )
      .first()

    return {
      success: true,
      sensor,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Create sensor error:', error)
    throw createError({
      statusCode: 500,
      message: 'Sensör oluşturulurken hata oluştu',
    })
  }
})
