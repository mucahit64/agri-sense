<script setup lang="ts">
const { user, logout, checkAuth } = useAuth()
const router = useRouter()

const stats = ref({
  devices: 0,
  sensors: 0,
  readings: 0,
})

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
  }
})

async function loadStats() {
  try {
    const [devicesRes, sensorsRes, readingsRes] = await Promise.all([
      $fetch('/api/devices'),
      $fetch('/api/sensors'),
      $fetch('/api/readings?limit=1'),
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

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="eco" size="28px" class="q-mr-sm" />
          AgriSense Dashboard
        </q-toolbar-title>

        <q-btn flat label="Dashboard" />
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

        <div class="row q-col-gutter-md q-mb-md">
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
            <q-card>
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
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
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
