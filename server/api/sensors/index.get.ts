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

  const query = getQuery(event)
  const deviceId = query.device_id
  const sensorId = query.sensor_id

  try {
    let sql = 'SELECT sensors.* FROM sensors JOIN devices ON sensors.device_id = devices.id WHERE devices.user_id = ?'
    const params: any[] = [userId]

    if (deviceId) {
      sql += ' AND sensors.device_id = ?'
      params.push(deviceId)
    }

    if (sensorId) {
      sql += ' AND sensors.id = ?'
      params.push(sensorId)
    }

    sql += ' ORDER BY sensors.created_at DESC'

    const { results: sensors } = await db
      .prepare(sql)
      .bind(...params)
      .all()

    return {
      success: true,
      sensors,
    }
  }
  catch (error: any) {
    console.error('Get sensors error:', error)
    throw createError({
      statusCode: 500,
      message: 'Sensörler alınırken hata oluştu',
    })
  }
})
