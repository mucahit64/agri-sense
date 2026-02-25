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

  const query = getQuery(event)
  const sensorId = query.sensor_id
  const limit = Number(query.limit) || 100

  try {
    let sql = 'SELECT readings.* FROM readings JOIN sensors ON readings.sensor_id = sensors.id JOIN devices ON sensors.device_id = devices.id WHERE devices.user_id = ?'
    const params: any[] = [userId]

    if (sensorId) {
      sql += ' AND readings.sensor_id = ?'
      params.push(sensorId)
    }

    sql += ' ORDER BY readings.recorded_at DESC LIMIT ?'
    params.push(limit)

    const { results: readings } = await db
      .prepare(sql)
      .bind(...params)
      .all()

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
