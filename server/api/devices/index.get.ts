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

  try {
    const devices = await db('devices')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')

    return {
      success: true,
      devices,
    }
  }
  catch (error: any) {
    console.error('Get devices error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihazlar alınırken hata oluştu',
    })
  }
})
