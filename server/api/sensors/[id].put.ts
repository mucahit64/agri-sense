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
    const existing = await db
      .prepare('SELECT sensors.* FROM sensors JOIN devices ON sensors.device_id = devices.id WHERE sensors.id = ? AND devices.user_id = ?')
      .bind(id, userId)
      .first()

    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Sensör bulunamadı',
      })
    }

    const body = await readBody(event)
    const now = new Date().toISOString()

    // Eğer device_id değişiyorsa, yeni cihazın kullanıcıya ait olduğunu doğrula
    if (body.device_id && body.device_id !== existing.device_id) {
      const targetDevice = await db
        .prepare('SELECT id FROM devices WHERE id = ? AND user_id = ?')
        .bind(body.device_id, userId)
        .first()

      if (!targetDevice) {
        throw createError({
          statusCode: 403,
          message: 'Hedef cihaza erişim yetkiniz yok',
        })
      }
    }

    await db
      .prepare(`UPDATE sensors SET
        name = ?,
        device_id = ?,
        type_id = ?,
        unit_id = ?,
        min_value = ?,
        max_value = ?,
        updated_at = ?
      WHERE id = ?`)
      .bind(
        body.name ?? existing.name,
        body.device_id ?? existing.device_id,
        body.type_id ?? existing.type_id,
        body.unit_id ?? existing.unit_id,
        body.min_value !== undefined ? body.min_value : existing.min_value,
        body.max_value !== undefined ? body.max_value : existing.max_value,
        now,
        id,
      )
      .run()

    const sensor = await db
      .prepare(`SELECT sensors.*,
        sensor_types.name as type_name, sensor_types.label as type_label, sensor_types.icon as type_icon,
        units.name as unit_name, units.symbol as unit_symbol
      FROM sensors
      LEFT JOIN sensor_types ON sensors.type_id = sensor_types.id
      LEFT JOIN units ON sensors.unit_id = units.id
      WHERE sensors.id = ?`)
      .bind(id)
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
    console.error('Update sensor error:', error)
    throw createError({
      statusCode: 500,
      message: 'Sensör güncellenirken hata oluştu',
    })
  }
})
