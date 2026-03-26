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
    const device = await db
      .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()

    if (!device) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    // Get sensors of this device to delete their readings
    const { results: sensors } = await db
      .prepare('SELECT id FROM sensors WHERE device_id = ?')
      .bind(id)
      .all()

    if (sensors.length > 0) {
      const sensorIds = sensors.map((s: any) => s.id)
      await db
        .prepare(`DELETE FROM readings WHERE sensor_id IN (${sensorIds.map(() => '?').join(',')})`)
        .bind(...sensorIds)
        .run()
    }

    await db.prepare('DELETE FROM sensors WHERE device_id = ?').bind(id).run()
    await db.prepare('DELETE FROM device_assignments WHERE device_id = ?').bind(id).run()

    await db
      .prepare('DELETE FROM devices WHERE id = ?')
      .bind(id)
      .run()

    return {
      success: true,
      message: 'Cihaz ve bağlı tüm sensörler silindi',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Delete device error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihaz silinirken hata oluştu',
    })
  }
})
