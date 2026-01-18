<script setup lang="ts">
const { user, logout, checkAuth } = useAuth()
const router = useRouter()

const stats = ref({
  devices: 0,
  sensors: 0,
  readings: 0,
})

const weather = ref<any>(null)
const weatherLoading = ref(false)

const irrigationAI = ref<any>(null)
const irrigationAILoading = ref(false)

const payloadExample = `{
  "device_uid": "ARDUINO_001",
  "sensor_uid": "SENSOR_001",
  "value": 65.5
}`

onMounted(async () => {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    router.push('/auth/login')
  }
  else {
    loadStats()
    loadWeather()
    loadIrrigationAI()
  }
})

async function loadStats() {
  try {
    const [devicesRes, sensorsRes, readingsRes] = await Promise.all([
      $fetch('/api/devices'),
      $fetch('/api/sensors'),
      $fetch('/api/readings'), // ?limit=1
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
    const response = await $fetch('/api/weather')
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

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8 text-white">
      <q-toolbar class="q-py-md q-pl-lg">
        <!-- LOGO -->
        <q-toolbar-title
          class="row items-center cursor-pointer no-wrap"
        >
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            :height="$q.screen.lt.md ? 28 : 32"
            class="q-mr-sm"
          >

          <!-- SADECE DESKTOP -->
          <span class="gt-sm">
            AgriSense Dashboard
          </span>
        </q-toolbar-title>

        <!-- DESKTOP MENU -->
        <div v-if="$q.screen.gt.sm" class="row items-center q-gutter-sm">
          <q-btn flat label="Dashboard" />
          <q-btn flat label="Cihazlar" to="/devices" />
          <q-btn flat label="Sensörler" to="/sensors" />

          <q-space />

          <div class="q-mx-md text-weight-medium">
            {{ user?.name }} {{ user?.surname }}
          </div>

          <q-btn flat round dense icon="account_circle" />
          <q-btn flat label="Çıkış" @click="handleLogout" />
        </div>

        <!-- MOBILE MENU -->
        <q-btn
          v-else
          flat
          round
          dense
          icon="menu"
        >
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item clickable>
                <q-item-section>
                  <div class="text-weight-bold">
                    {{ user?.name }} {{ user?.surname }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ user?.email }}
                  </div>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable>
                <q-item-section>Dashboard</q-item-section>
              </q-item>

              <q-item clickable to="/devices">
                <q-item-section>Cihazlar</q-item-section>
              </q-item>

              <q-item clickable to="/sensors">
                <q-item-section>Sensörler</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="handleLogout">
                <q-item-section class="text-negative">
                  Çıkış
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

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
                          <q-icon name="thermostat" size="32px" color="orange" />
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
                  <q-item clickable to="/devices">
                    <q-item-section avatar>
                      <q-icon name="add_circle" color="green-8" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Yeni Cihaz Ekle</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable to="/sensors">
                    <q-item-section avatar>
                      <q-icon name="view_list" color="blue" />
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
            <q-card class="cursor-pointer" @click="router.push('/weather')">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="wb_sunny" class="q-mr-sm" />
                  Hava Durumu (24 Saat)
                </div>

                <div v-if="weatherLoading" class="text-center q-py-md">
                  <q-spinner color="primary" size="40px" />
                </div>

                <div v-else-if="weather && weather.list" class="q-gutter-sm">
                  <div class="row q-col-gutter-sm">
                    <div
                      v-for="(item, index) in weather.list"
                      :key="index"
                      class="col-3"
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
                  Use the following endpoint to send sensor data from your Arduino / ESP devices.
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
                  The device will be automatically registered if it does not exist.
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
