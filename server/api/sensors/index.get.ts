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
    let sql = `SELECT sensors.*, 
        sensor_types.name as type_name, sensor_types.label as type_label, sensor_types.icon as type_icon,
        units.name as unit_name, units.symbol as unit_symbol
      FROM sensors 
      JOIN devices ON sensors.device_id = devices.id 
      LEFT JOIN sensor_types ON sensors.type_id = sensor_types.id
      LEFT JOIN units ON sensors.unit_id = units.id
      WHERE devices.user_id = ?`
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
