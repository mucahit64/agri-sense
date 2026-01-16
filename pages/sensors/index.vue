<script setup lang="ts">
import type { Sensor } from '~/types'

definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const { user, logout } = useAuth()
const router = useRouter()

const sensors = ref<Sensor[]>([])
const loading = ref(true)

const sensorTypes = [
  { value: 'temperature', label: 'Sıcaklık', icon: 'thermostat' },
  { value: 'humidity', label: 'Nem', icon: 'water_drop' },
  { value: 'soil_moisture', label: 'Toprak Nemi', icon: 'opacity' },
  { value: 'ph', label: 'pH', icon: 'science' },
  { value: 'light', label: 'Işık', icon: 'wb_sunny' },
  { value: 'pressure', label: 'Basınç', icon: 'compress' },
]

async function loadSensors() {
  try {
    loading.value = true
    const response = await $fetch('/api/sensors')
    sensors.value = response.sensors
  }
  catch (error) {
    console.error('Sensörler yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

function getSensorIcon(type: string) {
  return sensorTypes.find(t => t.value === type)?.icon || 'sensors'
}

function getSensorLabel(type: string) {
  return sensorTypes.find(t => t.value === type)?.label || type
}

async function handleLogout() {
  await logout()
  router.push('/')
}

onMounted(() => {
  loadSensors()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8">
      <q-toolbar>
        <q-toolbar-title class="flex row items-center">
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            height="42px"
          >
          AgriSense - Tüm Sensörler
        </q-toolbar-title>

        <q-btn flat label="Dashboard" to="/dashboard" />
        <q-btn flat label="Cihazlar" to="/devices" />
        <q-btn flat label="Sensörler" />

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
        <div class="text-h5 text-weight-bold q-mb-md">
          Tüm Sensörler
        </div>

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner size="50px" color="green-8" />
        </div>

        <div v-else-if="sensors.length === 0" class="text-center q-pa-xl">
          <q-icon name="sensors" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            Henüz sensör yok
          </div>
          <q-btn
            flat
            color="green-8"
            label="Cihaz Ekle"
            class="q-mt-md"
            to="/devices"
          />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="sensor in sensors" :key="sensor.id" class="col-12 col-md-4">
            <q-card>
              <q-card-section>
                <div class="row items-center">
                  <q-icon :name="getSensorIcon(sensor.sensor_type)" size="32px" color="green-8" />
                  <div class="q-ml-md">
                    <div class="text-subtitle1 text-weight-bold">
                      {{ sensor.name || getSensorLabel(sensor.sensor_type) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ getSensorLabel(sensor.sensor_type) }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="text-caption text-grey-7">
                  Pin: {{ sensor.pin || '-' }}
                </div>
                <div class="text-caption text-grey-7">
                  Birim: {{ sensor.unit || '-' }}
                </div>
                <div class="text-caption text-grey-7">
                  Min: {{ sensor.min_value !== null && sensor.min_value !== undefined ? sensor.min_value : '-' }}
                </div>
                <div class="text-caption text-grey-7">
                  Max: {{ sensor.max_value !== null && sensor.max_value !== undefined ? sensor.max_value : '-' }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions>
                <q-btn
                  flat
                  color="primary"
                  label="Veriler"
                  :to="`/sensors/${sensor.id}`"
                />
              </q-card-actions>
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
