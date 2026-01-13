import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
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

  const id = getRouterParam(event, 'id')

  try {
    const sensor = await db('sensors')
      .join('devices', 'sensors.device_id', 'devices.id')
      .where('sensors.id', id)
      .where('devices.user_id', userId)
      .select('sensors.*')
      .first()

    if (!sensor) {
      throw createError({
        statusCode: 404,
        message: 'Sensör bulunamadı',
      })
    }

    await db('sensors').where({ id }).delete()

    return {
      success: true,
      message: 'Sensör silindi',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Delete sensor error:', error)
    throw createError({
      statusCode: 500,
      message: 'Sensör silinirken hata oluştu',
    })
  }
})
