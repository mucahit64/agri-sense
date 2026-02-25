import type { SensorPayload } from '~/types'
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const body = await readBody<SensorPayload>(event)

  if (!body.device_uid || !body.sensor_uid || body.value === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz UID, sensör UID ve değer gerekli',
    })
  }

  try {
    // Cihazı bul
    const device = await db
      .prepare('SELECT * FROM devices WHERE device_uid = ?')
      .bind(body.device_uid)
      .first<{ id: number }>()

    if (!device) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    // Son görülme zamanını güncelle
    await db
      .prepare('UPDATE devices SET last_seen_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), device.id)
      .run()

    // Sensörü bul veya oluştur
    let sensor = await db
      .prepare('SELECT * FROM sensors WHERE sensor_uid = ?')
      .bind(body.sensor_uid)
      .first<{ id: number }>()

    if (!sensor) {
      sensor = await db
        .prepare('INSERT INTO sensors (device_id, sensor_uid, sensor_type, created_at) VALUES (?, ?, ?, ?) RETURNING *')
        .bind(device.id, body.sensor_uid, body.sensor_type, new Date().toISOString())
        .first<{ id: number }>()
    }

    // Okuma kaydet
    const recordedAt = body.recorded_at ? new Date(body.recorded_at).toISOString() : new Date().toISOString()

    const result = await db
      .prepare('INSERT INTO readings (sensor_id, value, recorded_at, created_at) VALUES (?, ?, ?, ?) RETURNING id')
      .bind(sensor!.id, body.value, recordedAt, new Date().toISOString())
      .first<{ id: number }>()

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
