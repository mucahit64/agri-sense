import type { SensorCreate } from '~/types'
import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET!,
  })

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  const body = await readBody<SensorCreate>(event)

  if (!body.device_id || !body.sensor_type) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz ID ve sensör tipi gerekli',
    })
  }

  try {
    // Cihazın kullanıcıya ait olduğunu kontrol et
    const device = await db('devices')
      .where({ id: body.device_id, user_id: userId })
      .first()

    if (!device) {
      throw createError({
        statusCode: 403,
        message: 'Bu cihaza erişim yetkiniz yok',
      })
    }

    const [sensorId] = await db('sensors').insert({
      device_id: body.device_id,
      sensor_type: body.sensor_type,
      name: body.name || null,
      pin: body.pin || null,
      unit: body.unit || null,
    })

    const sensor = await db('sensors').where({ id: sensorId }).first()

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
