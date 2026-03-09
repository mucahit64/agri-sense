import type { SensorCreate } from '~/types'
import { useDB } from '~/server/utils/db'

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

  const body = await readBody<SensorCreate>(event)

  if (!body.device_id || !body.name || !body.type) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz ID, sensör adı ve sensör tipi gerekli',
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

    const now = new Date().toISOString()

    const sensor = await db
      .prepare('INSERT INTO sensors (device_id, name, type, unit, min_value, max_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *')
      .bind(
        body.device_id,
        body.name,
        body.type,
        body.unit || null,
        body.min_value || null,
        body.max_value || null,
        now,
        now,
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
