import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
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

  const query = getQuery(event)
  const sensorId = query.sensor_id
  const limit = Number(query.limit) || 100

  try {
    let readingsQuery = db('readings')
      .join('sensors', 'readings.sensor_id', 'sensors.id')
      .join('devices', 'sensors.device_id', 'devices.id')
      .where('devices.user_id', userId)
      .select('readings.*')

    if (sensorId) {
      readingsQuery = readingsQuery.where('readings.sensor_id', sensorId)
    }

    const readings = await readingsQuery
      .orderBy('readings.recorded_at', 'desc')
      .limit(limit)

    return {
      success: true,
      readings,
    }
  }
  catch (error: any) {
    console.error('Get readings error:', error)
    throw createError({
      statusCode: 500,
      message: 'Okumalar alınırken hata oluştu',
    })
  }
})
