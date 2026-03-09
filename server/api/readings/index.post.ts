import type { SensorPayload } from '~/types'
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const body = await readBody<SensorPayload>(event)

  if (!body.device_name || !body.sensor_name || body.value === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz adı, sensör adı ve değer gerekli',
    })
  }

  try {
    // Cihazı bul
    const device = await db
      .prepare('SELECT * FROM devices WHERE name = ?')
      .bind(body.device_name)
      .first() as { id: number } | null

    if (!device) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    // Sensörü bul veya oluştur
    let sensor = await db
      .prepare('SELECT * FROM sensors WHERE name = ? AND device_id = ?')
      .bind(body.sensor_name, device.id)
      .first() as { id: number } | null

    if (!sensor) {
      const now = new Date().toISOString()
      sensor = await db
        .prepare('INSERT INTO sensors (device_id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
        .bind(device.id, body.sensor_name, body.sensor_type, now, now)
        .first() as { id: number } | null
    }

    // Okuma kaydet
    const recordedAt = body.recorded_at ? new Date(body.recorded_at).toISOString() : new Date().toISOString()

    const result = await db
      .prepare('INSERT INTO readings (sensor_id, value, recorded_at, created_at) VALUES (?, ?, ?, ?) RETURNING id')
      .bind(sensor!.id, body.value, recordedAt, new Date().toISOString())
      .first() as { id: number } | null

    return {
      success: true,
      reading_id: result?.id,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Create reading error:', error)
    throw createError({
      statusCode: 500,
      message: 'Okuma kaydedilirken hata oluştu',
    })
  }
})
