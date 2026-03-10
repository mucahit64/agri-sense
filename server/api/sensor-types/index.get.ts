export default defineEventHandler(async (event) => {
  const db = useDB(event)

  try {
    const { results: sensorTypes } = await db
      .prepare('SELECT id, name, COALESCE(label, name) as label, icon FROM sensor_types ORDER BY name')
      .all()

    return {
      success: true,
      sensorTypes,
    }
  }
  catch (error: any) {
    console.error('Get sensor types error:', error)

    if (String(error?.message || '').includes('no such table: sensor_types')) {
      throw createError({
        statusCode: 500,
        message: 'sensor_types tablosu bulunamadi. D1 migrationlarini uygulayin.',
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Sensör tipleri alınırken hata oluştu',
    })
  }
})
