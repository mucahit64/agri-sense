import type { WeatherForecastResponse } from '~/types'
import db from '~/server/db/knex'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD formatı

    // Önce bugün için kayıt var mı kontrol et
    const existingRecommendation = await db('ai_recommendations')
      .where('recommendation_date', today)
      .first()

    if (existingRecommendation) {
      // Bugün için zaten öneri var, cache'den dön
      return {
        success: true,
        answer: existingRecommendation.recommendation,
        soilMoisture: existingRecommendation.soil_moisture,
        weather: {
          temp: existingRecommendation.temperature,
          humidity: existingRecommendation.humidity,
          description: existingRecommendation.weather_description,
          rainProbability: existingRecommendation.rain_probability,
        },
        cached: true,
      }
    }

    // Son toprak nemi okuması
    const latestSoil = await db('readings')
      .join('sensors', 'readings.sensor_id', 'sensors.id')
      .where('sensors.sensor_type', 'soil_moisture')
      .orderBy('readings.recorded_at', 'desc')
      .select('readings.value', 'sensors.min_value', 'sensors.max_value')
      .first()

    // Raw değeri yüzdeye çevir
    let soilMoisture = 50 // Varsayılan

    if (latestSoil?.value !== undefined) {
      const rawValue = latestSoil.value
      const minValue = latestSoil.min_value ?? 305 // en ıslak ölçüm
      const maxValue = latestSoil.max_value ?? 668 // en kuru ölçüm

      if (maxValue > minValue) {
        // Ters çevirme: kuru (max) -> 0%, ıslak (min) -> 100%
        soilMoisture = Math.round(((maxValue - rawValue) / (maxValue - minValue)) * 100)
        // Yüzdeyi 0-100 arasında sınırla
        soilMoisture = Math.max(0, Math.min(100, soilMoisture))
      }
      else {
        // Min/max yoksa raw değeri kullan (farklı bir normalize mantığı uygulanabilir)
        soilMoisture = rawValue
      }
    }

    // Hava durumu
    const weather = await $fetch<WeatherForecastResponse>('/api/weather')
    const todayWeather = weather.list?.[0]

    // OpenAI API
    const openaiApiKey = config.openaiApiKey
    if (!openaiApiKey) {
      throw createError({ statusCode: 500, message: 'OpenAI API anahtarı yapılandırılmamış' })
    }

    // AI'ya gönderilecek prompt
    const prompt = `Bugünkü tarım verileri:
        Toprak Nem Seviyesi: %${soilMoisture}
        Sıcaklık: ${Math.round(todayWeather?.main?.temp ?? 20)}°C
        Hava Nem Oranı: %${todayWeather?.main?.humidity ?? 50}
        Hava Durumu: ${todayWeather?.weather?.[0]?.description ?? 'Bilinmiyor'}
        Yağış Olasılığı: %${Math.round((todayWeather?.pop ?? 0) * 100)}

        Bugün tarlamı sulamalı mıyım? Kısa ve net bir öneri ver (max 2-3 cümle).`

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen tarımsal sulama konusunda uzman bir asistansın. Toprak nemi ve hava durumu verilerine göre kısa ve pratik sulama önerileri veriyorsun.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error('AI API isteği başarısız')
    }

    const aiData = await aiResponse.json()
    const answer = aiData.choices?.[0]?.message?.content || 'Öneri oluşturulamadı.'

    const weatherData = {
      temp: Math.round(todayWeather?.main?.temp ?? 20),
      humidity: todayWeather?.main?.humidity ?? 50,
      description: todayWeather?.weather?.[0]?.description ?? 'Bilinmiyor',
      rainProbability: Math.round((todayWeather?.pop ?? 0) * 100),
    }

    // Yeni öneriyi veritabanına kaydet
    await db('ai_recommendations').insert({
      recommendation: answer,
      soil_moisture: soilMoisture,
      temperature: weatherData.temp,
      humidity: weatherData.humidity,
      weather_description: weatherData.description,
      rain_probability: weatherData.rainProbability,
      recommendation_date: today,
      created_at: new Date(),
    })

    return {
      success: true,
      answer,
      soilMoisture,
      weather: weatherData,
      cached: false,
    }
  }
  catch (error: any) {
    console.error('AI sulama önerisi hatası:', error)
    throw createError({
      statusCode: 500,
      message: 'AI önerisi alınırken hata oluştu',
    })
  }
})
