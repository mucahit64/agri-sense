export default defineEventHandler(async (event) => {
  const db = useDB(event)

  const query = getQuery(event)
  const sensorTypeId = query.sensor_type_id

  try {
    let sql = 'SELECT * FROM units'
    const params: any[] = []

    if (sensorTypeId) {
      sql += ' WHERE sensor_type_id = ?'
      params.push(sensorTypeId)
    }

    sql += ' ORDER BY is_default DESC, name'

    const { results: units } = params.length
      ? await db.prepare(sql).bind(...params).all()
      : await db.prepare(sql).all()

    return {
      success: true,
      units,
    }
  }
  catch (error: any) {
    console.error('Get units error:', error)
    throw createError({
      statusCode: 500,
      message: 'Birimler alınırken hata oluştu',
    })
  }
})
