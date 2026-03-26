<script setup lang="ts">
definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const router = useRouter()
const { user } = useAuth()

const stats = ref({
  devices: 0,
  sensors: 0,
  readings: 0,
})

const cityOptions = [
  { label: 'İstanbul', value: 'istanbul', lat: 41.1194, lon: 29.0063 },
  { label: 'Ankara', value: 'ankara', lat: 39.9334, lon: 32.8597 },
  { label: 'İzmir', value: 'izmir', lat: 38.4192, lon: 27.1287 },
  { label: 'Bursa', value: 'bursa', lat: 40.1826, lon: 29.0665 },
  { label: 'Antalya', value: 'antalya', lat: 36.8969, lon: 30.7133 },
  { label: 'Adana', value: 'adana', lat: 37.0000, lon: 35.3213 },
  { label: 'Konya', value: 'konya', lat: 37.8746, lon: 32.4932 },
  { label: 'Gaziantep', value: 'gaziantep', lat: 37.0662, lon: 37.3833 },
  { label: 'Şanlıurfa', value: 'sanliurfa', lat: 37.1591, lon: 38.7969 },
  { label: 'Diyarbakır', value: 'diyarbakir', lat: 37.9144, lon: 40.2306 },
  { label: 'Mersin', value: 'mersin', lat: 36.8000, lon: 34.6333 },
  { label: 'Kayseri', value: 'kayseri', lat: 38.7312, lon: 35.4787 },
  { label: 'Eskişehir', value: 'eskisehir', lat: 39.7767, lon: 30.5206 },
  { label: 'Samsun', value: 'samsun', lat: 41.2928, lon: 36.3313 },
  { label: 'Trabzon', value: 'trabzon', lat: 41.0015, lon: 39.7178 },
  { label: 'Erzurum', value: 'erzurum', lat: 39.9000, lon: 41.2700 },
  { label: 'Van', value: 'van', lat: 38.4891, lon: 43.4089 },
]

const STORAGE_KEY = 'dashboard_selected_city'

const selectedCity = ref(cityOptions[0]!)

watch(selectedCity, (city) => {
  localStorage.setItem(STORAGE_KEY, city.value)
})

const weather = ref<any>(null)
const weatherLoading = ref(false)

const irrigationAI = ref<any>(null)
const irrigationAILoading = ref(false)

const payloadExample = `{
  "device_name": "ARDUINO_001",
  "sensor_name": "SENSOR_001",
  "sensor_type": "soil_moisture",
  "value": 65.5
}`

async function loadStats() {
  try {
    const [devicesRes, sensorsRes, readingsRes] = await Promise.all([
      $fetch<{ success: boolean, devices: any[] }>('/api/devices'),
      $fetch<{ success: boolean, sensors: any[] }>('/api/sensors'),
      $fetch<{ success: boolean, readings: any[] }>('/api/readings'),
    ])
    stats.value = {
      devices: devicesRes.devices?.length || 0,
      sensors: sensorsRes.sensors?.length || 0,
      readings: readingsRes.readings?.length || 0,
    }
  }
  catch (error) {
    console.error('İstatistikler yüklenemedi:', error)
  }
}

async function loadWeather() {
  weatherLoading.value = true
  try {
    const { lat, lon } = selectedCity.value
    const response = await $fetch(`/api/weather?lat=${lat}&lon=${lon}`)
    weather.value = response.weather
  }
  catch (error) {
    console.error('Hava durumu yüklenemedi:', error)
  }
  finally {
    weatherLoading.value = false
  }
}

async function loadIrrigationAI() {
  irrigationAILoading.value = true
  try {
    const response = await $fetch('/api/irrigation-ai')
    irrigationAI.value = response
  }
  catch (error) {
    console.error('AI sulama önerisi yüklenemedi:', error)
    irrigationAI.value = null
  }
  finally {
    irrigationAILoading.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const city = cityOptions.find(c => c.value === saved)
    if (city)
      selectedCity.value = city
  }
  loadStats()
  loadWeather()
  loadIrrigationAI()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar />

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="q-mb-md">
          <q-card>
            <q-card-section>
              <div class="text-h6">
                Hoş geldiniz, {{ user?.name }} {{ user?.surname }}!
              </div>
              <div class="text-caption text-grey-7">
                {{ user?.email }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- AI Sulama Önerisi -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12">
            <q-card>
              <q-card-section>
                <div class="text-h6 q-pb-md">
                  <q-icon name="psychology" class="q-mr-sm" color="purple" />
                  Bugün Tarlamı Sulamalı Mıyım?
                </div>

                <div v-if="irrigationAILoading" class="text-center q-py-md">
                  <q-spinner color="primary" size="40px" />
                  <div class="text-grey-7 q-mt-md">
                    AI önerisi hazırlanıyor...
                  </div>
                </div>

                <div v-else-if="irrigationAI" class="q-gutter-md">
                  <q-card flat bordered class="bg-blue-1">
                    <q-card-section>
                      <div class="text-body1">
                        <q-icon name="auto_awesome" color="blue" size="20px" />
                        <span class="text-weight-bold q-ml-sm">AI Önerisi:</span>
                      </div>
                      <div class="text-body1 q-mt-sm">
                        {{ irrigationAI.answer }}
                      </div>
                    </q-card-section>
                  </q-card>

                  <div class="row q-col-gutter-sm">
                    <div class="col-6 col-md-3">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="water_drop" size="32px" color="blue" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Toprak Nemi
                          </div>
                          <div class="text-h6 text-weight-bold">
                            %{{ irrigationAI.soilMoisture }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-3">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon
                            name="thermostat"
                            size="32px"
                            color="orange"
                          />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Sıcaklık
                          </div>
                          <div class="text-h6 text-weight-bold">
                            {{ irrigationAI.weather.temp }}°C
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-3">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="opacity" size="32px" color="cyan" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Hava Nemi
                          </div>
                          <div class="text-h6 text-weight-bold">
                            %{{ irrigationAI.weather.humidity }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-3">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="grain" size="32px" color="blue-grey" />
                          <div class="text-caption text-grey-7 q-mt-sm">
                            Yağış Olasılığı
                          </div>
                          <div class="text-h6 text-weight-bold">
                            %{{ irrigationAI.weather.rainProbability }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center text-grey-6 q-py-md">
                  <q-icon name="error_outline" size="48px" />
                  <div class="q-mt-sm">
                    AI önerisi alınamadı
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-md q-pb-md">
          <div class="col-12 col-md-4">
            <q-card class="cursor-pointer" @click="router.push('/devices')">
              <q-card-section class="text-center">
                <q-icon name="memory" size="48px" color="green-8" />
                <div class="text-h4 q-mt-md text-weight-bold">
                  {{ stats.devices }}
                </div>
                <div class="text-caption text-grey-7">
                  Cihazlar
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card class="cursor-pointer" @click="router.push('/sensors')">
              <q-card-section class="text-center">
                <q-icon name="sensors" size="48px" color="blue" />
                <div class="text-h4 q-mt-md text-weight-bold">
                  {{ stats.sensors }}
                </div>
                <div class="text-caption text-grey-7">
                  Sensörler
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card class="cursor-pointer" @click="router.push('/sensors')">
              <q-card-section class="text-center">
                <q-icon name="analytics" size="48px" color="orange" />
                <div class="text-h4 q-mt-md text-weight-bold">
                  {{ stats.readings }}
                </div>
                <div class="text-caption text-grey-7">
                  Toplam Okuma
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  Hızlı Erişim
                </div>
                <q-list>
                  <q-item clickable to="/fields">
                    <q-item-section avatar>
                      <q-icon name="landscape" color="green-8" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Tarlalarım</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable to="/devices">
                    <q-item-section avatar>
                      <q-icon name="memory" color="green-8" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Cihazlarım</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable to="/sensors">
                    <q-item-section avatar>
                      <q-icon name="sensors" color="blue" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Tüm Sensörler</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable to="/weather">
                    <q-item-section avatar>
                      <q-icon name="wb_sunny" color="orange" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Hava Durumunu Gör</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="row items-center q-mb-md no-wrap">
                  <div class="text-subtitle1 text-weight-bold cursor-pointer ellipsis" @click="router.push('/weather')">
                    <q-icon name="wb_sunny" class="q-mr-xs" />
                    Hava Durumu
                  </div>
                  <q-space />
                  <q-select
                    v-model="selectedCity"
                    :options="cityOptions"
                    option-label="label"
                    dense
                    outlined
                    options-dense
                    class="col-auto"
                    style="min-width: 130px; max-width: 160px"
                    @update:model-value="loadWeather"
                  />
                </div>

                <div v-if="weatherLoading" class="text-center q-py-md">
                  <q-spinner color="primary" size="40px" />
                </div>

                <div v-else-if="weather && weather.list" class="q-gutter-sm">
                  <div class="row q-col-gutter-sm">
                    <div
                      v-for="(item, index) in weather.list"
                      :key="index"
                      class="col-6 col-sm-3"
                    >
                      <q-card flat bordered class="text-center">
                        <q-card-section class="q-pa-sm">
                          <div class="text-caption text-grey-7">
                            {{ new Date(item.dt * 1000).getHours() }}:00
                          </div>
                          <q-icon
                            :name="`img:https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`"
                            size="32px"
                          />
                          <div class="text-weight-bold">
                            {{ Math.round(item.main.temp) }}°C
                          </div>
                          <div class="text-caption text-grey-6">
                            {{ item.weather[0].description }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center text-grey-6 q-py-md">
                  Hava durumu bilgisi yüklenemedi
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12">
            <q-card>
              <q-card-section>
                <div class="text-h6 q-mb-sm">
                  API Information
                </div>

                <div class="text-body2 text-grey-7 q-mb-md">
                  Use the following endpoint to send sensor data from your
                  Arduino / ESP devices.
                </div>

                <q-input
                  readonly
                  outlined
                  dense
                  label="Endpoint"
                  model-value="POST /api/readings"
                  class="q-mb-sm"
                />

                <q-input
                  readonly
                  outlined
                  dense
                  type="textarea"
                  label="Request Payload"
                  :model-value="payloadExample"
                />

                <div class="text-caption text-grey-6 q-mt-sm">
                  The device will be automatically registered if it does not
                  exist.
                </div>
              </q-card-section>
            </q-card>
          </div>
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
