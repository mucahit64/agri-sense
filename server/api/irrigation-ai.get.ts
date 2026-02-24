import type { WeatherForecastResponse } from '~/types'
import { useDB } from '../utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const config = useRuntimeConfig()

  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD formatı

    // Önce bugün için kayıt var mı kontrol et
    const existingRecommendation = await db
      .prepare('SELECT * FROM ai_recommendations ORDER BY id DESC LIMIT 1')
      .first()

    if (existingRecommendation) {
      // Bugün için zaten öneri var, cache'den dön
      return {
        success: true,
        answer: (existingRecommendation as any).recommendation,
        soilMoisture: (existingRecommendation as any).soil_moisture,
        weather: {
          temp: (existingRecommendation as any).temperature,
          humidity: (existingRecommendation as any).humidity,
          description: (existingRecommendation as any).weather_description,
          rainProbability: (existingRecommendation as any).rain_probability,
        },
        cached: true,
      }
    }

    // Son toprak nemi okuması
    const latestSoil = await db
      .prepare('SELECT readings.value, sensors.min_value, sensors.max_value FROM readings JOIN sensors ON readings.sensor_id = sensors.id WHERE sensors.sensor_type = ? ORDER BY readings.recorded_at DESC LIMIT 1')
      .bind('soil_moisture')
      .first<{ value: number, min_value: number | null, max_value: number | null }>()

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
    await db
      .prepare('INSERT INTO ai_recommendations (recommendation, soil_moisture, temperature, humidity, weather_description, rain_probability, recommendation_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(
        answer,
        soilMoisture,
        weatherData.temp,
        weatherData.humidity,
        weatherData.description,
        weatherData.rainProbability,
        today,
        new Date().toISOString(),
      )
      .run()

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
