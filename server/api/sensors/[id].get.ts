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

  const id = getRouterParam(event, 'id')

  try {
    const sensor = await db
      .prepare(`SELECT sensors.*,
        sensor_types.name as type_name, sensor_types.label as type_label, sensor_types.icon as type_icon,
        units.name as unit_name, units.symbol as unit_symbol,
        devices.name as device_name
      FROM sensors
      JOIN devices ON sensors.device_id = devices.id
      LEFT JOIN sensor_types ON sensors.type_id = sensor_types.id
      LEFT JOIN units ON sensors.unit_id = units.id
      WHERE sensors.id = ? AND devices.user_id = ?`)
      .bind(id, userId)
      .first()

    if (!sensor) {
      throw createError({
        statusCode: 404,
        message: 'Sensör bulunamadı',
      })
    }

    return {
      success: true,
      sensor,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Get sensor error:', error)
    throw createError({
      statusCode: 500,
      message: 'Sensör alınırken hata oluştu',
    })
  }
})
