<script setup lang="ts">
const { user, logout, checkAuth } = useAuth()
const router = useRouter()

const weather = ref<any>(null)
const weatherLoading = ref(false)

onMounted(async () => {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    router.push('/auth/login')
  }
  else {
    loadWeather()
  }
})

async function loadWeather() {
  weatherLoading.value = true
  try {
    const response = await $fetch('/api/weather')
    weather.value = typeof response.weather === 'string'
      ? JSON.parse(response.weather)
      : response.weather
  }
  catch (error) {
    console.error('Hava durumu yüklenemedi:', error)
    weather.value = null
  }
  finally {
    weatherLoading.value = false
  }
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('tr-TR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getWindDirection(deg: number) {
  const directions = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB']
  return directions[Math.round(deg / 45) % 8]
}

async function handleLogout() {
  await logout()
  router.push('/')
}

async function refreshWeather() {
  await loadWeather()
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8">
      <q-toolbar>
        <q-toolbar-title class="flex row items-center">
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            height="32px"
            class="q-mr-sm"
          >
          AgriSense - Hava Durumu
        </q-toolbar-title>

        <q-btn flat label="Dashboard" to="/dashboard" />
        <q-btn flat label="Cihazlar" to="/devices" />
        <q-btn flat label="Sensörler" to="/sensors" />

        <q-space />

        <div class="q-mr-md">
          {{ user?.name }} {{ user?.surname }}
        </div>
        <q-btn flat round dense icon="account_circle" />
        <q-btn flat label="Çıkış" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-pb-md">
          <div class="text-h5 text-weight-bold">
            Hava Durumu
          </div>
          <q-space />
          <q-btn
            unelevated
            color="primary"
            icon="refresh"
            label="Yenile"
            :loading="weatherLoading"
            @click="refreshWeather"
          />
        </div>

        <!-- Loading -->
        <div v-if="weatherLoading" class="text-center q-py-xl">
          <q-spinner color="primary" size="60px" />
          <div class="text-grey-7 q-mt-md">
            Hava durumu yükleniyor...
          </div>
        </div>

        <!-- Weather Content -->
        <div v-else-if="weather && weather.list" class="q-gutter-md">
          <!-- Current Weather Card -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="location_on" class="q-mr-sm" />
                {{ weather.city?.name || 'Konum' }}, {{ weather.city?.country || '' }}
              </div>

              <div class="row items-center">
                <div class="col-12 col-md-4 text-center">
                  <q-icon
                    :name="`img:https://openweathermap.org/img/wn/${weather.list[0].weather[0].icon}@4x.png`"
                    size="140px"
                  />
                  <div class="text-h2 text-weight-bold text-green-8">
                    {{ Math.round(weather.list[0].main.temp) }}°C
                  </div>
                  <div class="text-h6 text-grey-7 text-capitalize">
                    {{ weather.list[0].weather[0].description }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-sm">
                    Hissedilen: {{ Math.round(weather.list[0].main.feels_like) }}°C
                  </div>
                </div>

                <div class="col-12 col-md-8">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6 col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="thermostat" size="36px" color="red" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Min / Max
                          </div>
                          <div class="text-h6 text-weight-bold">
                            {{ Math.round(weather.list[0].main.temp_min) }}° / {{ Math.round(weather.list[0].main.temp_max) }}°
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="water_drop" size="36px" color="blue" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Nem Oranı
                          </div>
                          <div class="text-h6 text-weight-bold">
                            %{{ weather.list[0].main.humidity }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="air" size="36px" color="cyan" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Rüzgar Hızı
                          </div>
                          <div class="row justify-center items-center">
                            <div class="text-h6 text-weight-bold">
                              {{ Math.round(weather.list[0].wind.speed * 3.6) }} km/h
                            </div>
                            <div class="text-h6 text-weight-bold q-ml-sm">
                              {{ getWindDirection(weather.list[0].wind.deg) }}
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="compress" size="36px" color="purple" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Basınç
                          </div>
                          <div class="text-h6 text-weight-bold">
                            {{ weather.list[0].main.pressure }} hPa
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="cloud" size="36px" color="grey-7" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Bulutluluk
                          </div>
                          <div class="text-h6 text-weight-bold">
                            %{{ weather.list[0].clouds.all }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="visibility" size="36px" color="teal" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Görüş Mesafesi
                          </div>
                          <div class="text-h6 text-weight-bold">
                            {{ Math.round(weather.list[0].visibility / 1000) }} km
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Hourly Forecast -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-pb-md">
                <q-icon name="schedule" class="q-mr-sm" />
                Saatlik Tahmin
              </div>

              <div class="row q-col-gutter-sm">
                <div
                  v-for="(item, index) in weather.list"
                  :key="index"
                  class="col-6 col-sm-4 col-md-3 col-lg-2"
                >
                  <q-card flat bordered class="text-center">
                    <q-card-section class="q-pa-sm">
                      <div class="text-weight-bold text-primary">
                        {{ formatTime(item.dt) }}
                      </div>
                      <div class="text-caption text-grey-6">
                        {{ formatDate(item.dt) }}
                      </div>
                      <q-icon
                        :name="`img:https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`"
                        size="56px"
                      />
                      <div class="text-h5 text-weight-bold">
                        {{ Math.round(item.main.temp) }}°C
                      </div>
                      <div class="text-caption text-grey-7 text-capitalize">
                        {{ item.weather[0].description }}
                      </div>
                      <q-separator class="q-my-sm" />
                      <div class="row text-caption text-grey-6">
                        <div class="col-6">
                          <q-icon name="water_drop" size="12px" color="blue" />
                          %{{ item.main.humidity }}
                        </div>
                        <div class="col-6">
                          <q-icon name="air" size="12px" color="cyan" />
                          {{ Math.round(item.wind.speed * 3.6) }}km/h
                        </div>
                      </div>
                      <div v-if="item.pop > 0" class="text-caption text-blue q-mt-xs">
                        <q-icon name="grain" size="12px" />
                        Yağış: %{{ Math.round(item.pop * 100) }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Detailed Table -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="table_chart" class="q-mr-sm" />
                Detaylı Tablo
              </div>

              <q-table
                :rows="weather.list"
                :columns="[
                  { name: 'time', label: 'Zaman', field: (row: any) => formatDateTime(row.dt), align: 'left' },
                  { name: 'temp', label: 'Sıcaklık', field: (row: any) => `${Math.round(row.main.temp)}°C`, align: 'center' },
                  { name: 'feels', label: 'Hissedilen', field: (row: any) => `${Math.round(row.main.feels_like)}°C`, align: 'center' },
                  { name: 'humidity', label: 'Nem', field: (row: any) => `%${row.main.humidity}`, align: 'center' },
                  { name: 'wind', label: 'Rüzgar', field: (row: any) => `${Math.round(row.wind.speed * 3.6)} km/h`, align: 'center' },
                  { name: 'pressure', label: 'Basınç', field: (row: any) => `${row.main.pressure} hPa`, align: 'center' },
                  { name: 'clouds', label: 'Bulut', field: (row: any) => `%${row.clouds.all}`, align: 'center' },
                  { name: 'rain', label: 'Yağış Olasılığı', field: (row: any) => `%${Math.round(row.pop * 100)}`, align: 'center' },
                  { name: 'desc', label: 'Durum', field: (row: any) => row.weather[0].description, align: 'left' },
                ]"
                row-key="dt"
                flat
                bordered
                dense
                :pagination="{ rowsPerPage: 10 }"
              />
            </q-card-section>
          </q-card>

          <!-- City Info -->
          <q-card v-if="weather.city">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="info" class="q-mr-sm" />
                Konum Bilgileri
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">
                    Şehir
                  </div>
                  <div class="text-weight-bold">
                    {{ weather.city.name }}
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">
                    Ülke
                  </div>
                  <div class="text-weight-bold">
                    {{ weather.city.country }}
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">
                    Koordinatlar
                  </div>
                  <div class="text-weight-bold">
                    {{ weather.city.coord?.lat?.toFixed(4) }}, {{ weather.city.coord?.lon?.toFixed(4) }}
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">
                    Nüfus
                  </div>
                  <div class="text-weight-bold">
                    {{ weather.city.population?.toLocaleString('tr-TR') || '-' }}
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">
                    Gün Doğumu
                  </div>
                  <div class="text-weight-bold">
                    {{ formatTime(weather.city.sunrise) }}
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">
                    Gün Batımı
                  </div>
                  <div class="text-weight-bold">
                    {{ formatTime(weather.city.sunset) }}
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">
                    Zaman Dilimi
                  </div>
                  <div class="text-weight-bold">
                    UTC{{ weather.city.timezone >= 0 ? '+' : '' }}{{ weather.city.timezone / 3600 }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Error State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="cloud_off" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            Hava durumu bilgisi yüklenemedi
          </div>
          <q-btn
            flat
            color="primary"
            label="Tekrar Dene"
            class="q-mt-md"
            @click="refreshWeather"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.select-none {
  user-select: none !important;
}
</style>
