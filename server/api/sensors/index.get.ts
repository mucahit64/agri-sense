import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET!,
  })

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  const query = getQuery(event)
  const deviceId = query.device_id

  try {
    let sensorsQuery = db('sensors')
      .join('devices', 'sensors.device_id', 'devices.id')
      .where('devices.user_id', userId)
      .select('sensors.*')

    if (deviceId) {
      sensorsQuery = sensorsQuery.where('sensors.device_id', deviceId)
    }

    const sensors = await sensorsQuery.orderBy('sensors.created_at', 'desc')

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
