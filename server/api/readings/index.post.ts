import type { SensorPayload } from '~/types'
import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const body = await readBody<SensorPayload>(event)

  if (!body.device_uid || !body.sensor_type || body.value === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz UID, sensör tipi ve değer gerekli',
    })
  }

  try {
    // Cihazı bul
    const device = await db('devices')
      .where({ device_uid: body.device_uid })
      .first()

    if (!device) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    // Son görülme zamanını güncelle
    await db('devices')
      .where({ id: device.id })
      .update({ last_seen_at: new Date() })

    // Sensörü bul veya oluştur
    let sensor = await db('sensors')
      .where({
        device_id: device.id,
        sensor_type: body.sensor_type,
      })
      .first()

    if (!sensor) {
      const [sensorId] = await db('sensors').insert({
        device_id: device.id,
        sensor_type: body.sensor_type,
      })
      sensor = await db('sensors').where({ id: sensorId }).first()
    }

    // Okuma kaydet
    const recordedAt = body.recorded_at ? new Date(body.recorded_at) : new Date()

    const [readingId] = await db('readings').insert({
      sensor_id: sensor.id,
      value: body.value,
      recorded_at: recordedAt,
    })

    return {
      success: true,
      reading_id: readingId,
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
