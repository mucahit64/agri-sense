export default defineEventHandler(async (event) => {
  const db = useDB(event)

  try {
    const { results: sensorTypes } = await db
      .prepare('SELECT * FROM sensor_types ORDER BY name')
      .all()

    return {
      success: true,
      sensorTypes,
    }
  }
  catch (error: any) {
    console.error('Get sensor types error:', error)
    throw createError({
      statusCode: 500,
      message: 'Sensör tipleri alınırken hata oluştu',
    })
  }
})
