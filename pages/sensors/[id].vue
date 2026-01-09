<script setup lang="ts">
import type { Reading, Sensor } from '~/types'

definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth()

const sensorId = route.params.id as string
const readings = ref<Reading[]>([])
const loading = ref(true)
const limit = ref(50)

async function loadReadings() {
  try {
    loading.value = true
    const response = await $fetch(`/api/readings?sensor_id=${sensorId}&limit=${limit.value}`)
    readings.value = response.readings
  }
  catch (error) {
    console.error('Okumalar yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

async function handleLogout() {
  await logout()
  router.push('/')
}

const _chartData = computed(() => {
  return readings.value.slice().reverse().map(r => ({
    time: new Date(r.recorded_at).toLocaleTimeString('tr-TR'),
    value: r.value,
  }))
})

const latestValue = computed(() => {
  return readings.value[0]?.value ?? null
})

const avgValue = computed(() =>
  readings.value.length
    ? (
        readings.value.reduce((a, r) => a + Number(r.value), 0)
        / readings.value.length
      ).toFixed(2)
    : null,
)

const minValue = computed(() => {
  if (readings.value.length === 0)
    return null
  return Math.min(...readings.value.map(r => r.value))
})

const maxValue = computed(() => {
  if (readings.value.length === 0)
    return null
  return Math.max(...readings.value.map(r => r.value))
})

onMounted(() => {
  loadReadings()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="router.back()" />
        <q-toolbar-title>
          <q-icon name="eco" size="28px" class="q-mr-sm" />
          Sensör Verileri
        </q-toolbar-title>

        <q-btn flat label="Dashboard" to="/dashboard" />
        <q-btn flat label="Cihazlar" to="/devices" />

        <q-space />

        <div class="q-mr-md">
          {{ user?.name }} {{ user?.surname }}
        </div>
        <q-btn flat label="Çıkış" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Stats -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">
                  Son Değer
                </div>
                <div class="text-h4 text-weight-bold text-green-8">
                  {{ latestValue !== null ? latestValue : '-' }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">
                  Ortalama
                </div>
                <div class="text-h4 text-weight-bold text-blue">
                  {{ avgValue || '-' }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">
                  Minimum
                </div>
                <div class="text-h4 text-weight-bold text-cyan">
                  {{ minValue !== null ? minValue : '-' }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">
                  Maksimum
                </div>
                <div class="text-h4 text-weight-bold text-orange">
                  {{ maxValue !== null ? maxValue : '-' }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Readings List -->
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6">
                Okumalar
              </div>
              <q-space />
              <q-select
                v-model="limit"
                outlined
                dense
                :options="[20, 50, 100, 200]"
                label="Limit"
                style="min-width: 100px"
                @update:model-value="loadReadings"
              />
              <q-btn
                flat
                icon="refresh"
                class="q-ml-sm"
                @click="loadReadings"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="loading" class="text-center">
            <q-spinner size="50px" color="green-8" />
          </q-card-section>

          <q-card-section v-else-if="readings.length === 0" class="text-center">
            <q-icon name="database" size="80px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">
              Henüz veri yok
            </div>
          </q-card-section>

          <q-markup-table v-else flat>
            <thead>
              <tr>
                <th class="text-left">
                  Tarih/Saat
                </th>
                <th class="text-right">
                  Değer
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reading in readings" :key="reading.id">
                <td class="text-left">
                  {{ new Date(reading.recorded_at).toLocaleString('tr-TR') }}
                </td>
                <td class="text-right text-weight-bold">
                  {{ reading.value }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
  .select-none {
  user-select: none !important;
}
</style>
