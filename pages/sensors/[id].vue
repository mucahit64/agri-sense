<script setup lang="ts">
import type { Reading, Sensor, SensorType, Unit } from '~/types'
import EditDialog from '~/components/EditDialog.vue'

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
const $q = useQuasar()

const sensorId = route.params.id as string
const sensor = ref<Sensor | null>(null)
const readings = ref<Reading[]>([])
const loading = ref(true)
const limit = ref(50)
const sensorTypes = ref<SensorType[]>([])
const allUnits = ref<Unit[]>([])

function getSensorLabel(sensor: Sensor | null) {
  return sensor?.type_label || sensor?.type_name || ''
}

async function loadSensor() {
  try {
    const response = await $fetch<{ success: boolean, sensor: Sensor }>(
      `/api/sensors/${sensorId}`,
    )
    sensor.value = response.sensor
  }
  catch (error) {
    console.error('Sensör yüklenemedi:', error)
  }
}

async function loadSensorTypes() {
  try {
    const response = await $fetch<{ success: boolean, sensorTypes: SensorType[] }>('/api/sensor-types')
    sensorTypes.value = response.sensorTypes
  }
  catch (error) {
    console.error('Sensör tipleri yüklenemedi:', error)
  }
}

async function loadUnits() {
  try {
    const response = await $fetch<{ success: boolean, units: Unit[] }>('/api/units')
    allUnits.value = response.units
  }
  catch (error) {
    console.error('Birimler yüklenemedi:', error)
  }
}

function openEditDialog() {
  $q.dialog({
    component: EditDialog,
    componentProps: {
      type: 'sensor',
      item: sensor.value,
      sensorTypes: sensorTypes.value,
      units: allUnits.value,
    },
  }).onOk(() => {
    loadSensor()
  })
}

async function loadReadings() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, readings: Reading[] }>(
      `/api/readings?sensor_id=${sensorId}&limit=${limit.value}`,
    )
    readings.value = response.readings
  }
  catch (error) {
    console.error('Okumalar yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

const _chartData = computed(() => {
  return readings.value
    .slice()
    .reverse()
    .map(r => ({
      time: new Date(r.recorded_at || '').toLocaleTimeString('tr-TR'),
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

// Raw sensör değerini % nem olarak çevirir
function convertToPercentage(
  rawValue: number,
  min_value?: number,
  max_value?: number,
): number | null {
  if (rawValue == null)
    return null

  const minVal = min_value ?? 305 // en ıslak ölçüm
  const maxVal = max_value ?? 668 // en kuru ölçüm

  if (maxVal > minVal) {
    // Ters çevirme: kuru (max) -> 0%, ıslak (min) -> 100%
    const percentage = Math.round(
      ((maxVal - rawValue) / (maxVal - minVal)) * 100,
    )
    return Math.max(0, Math.min(100, percentage))
  }

  // maxVal <= minVal ise raw değeri direkt döndür
  return rawValue
}

onMounted(() => {
  loadSensor()
  loadReadings()
  loadSensorTypes()
  loadUnits()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar title="Sensör Verileri" back-to="/sensors" />

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Sensor Info Card -->
        <q-card v-if="sensor" class="q-mb-md rounded-borders shadow-2">
          <q-card-section>
            <!-- HEADER -->
            <div class="row items-center q-mb-md">
              <q-icon
                name="sensors"
                size="28px"
                color="green-8"
                class="q-mr-sm"
              />
              <div class="text-h6 text-weight-bold">
                {{ sensor.name || "Sensör Bilgileri" }}
              </div>
              <q-space />
              <q-btn
                flat
                color="primary"
                icon="edit"
                label="Düzenle"
                @click="openEditDialog()"
              />
            </div>

            <q-separator />

            <!-- CONTENT -->
            <div class="row q-col-gutter-md q-mt-md">
              <!-- CIHAZ -->
              <div v-if="sensor.device_name" class="col-6 col-md-3">
                <q-card flat bordered class="q-pa-sm text-center">
                  <div class="text-caption text-grey-7">
                    Bağlı Cihaz
                  </div>
                  <div class="text-body1 text-weight-medium">
                    {{ sensor.device_name }}
                  </div>
                </q-card>
              </div>

              <!-- TIP -->
              <div class="col-6 col-md-3">
                <q-card flat bordered class="q-pa-sm text-center">
                  <div class="text-caption text-grey-7">
                    Tip
                  </div>
                  <div class="text-body1 text-weight-medium">
                    {{ getSensorLabel(sensor) }}
                  </div>
                </q-card>
              </div>

              <!-- BIRIM -->
              <div class="col-6 col-md-3">
                <q-card flat bordered class="q-pa-sm text-center">
                  <div class="text-caption text-grey-7">
                    Birim
                  </div>
                  <div class="text-body1 text-weight-medium">
                    {{ sensor.unit_symbol || "-" }}
                  </div>
                </q-card>
              </div>

              <!-- MIN -->
              <div class="col-6 col-md-3">
                <q-card flat bordered class="q-pa-sm text-center">
                  <div class="text-caption text-grey-7">
                    Min Değer
                  </div>
                  <div class="text-body1 text-weight-medium">
                    {{ sensor.min_value ?? "-" }}
                  </div>
                </q-card>
              </div>

              <!-- MAX -->
              <div class="col-6 col-md-3">
                <q-card flat bordered class="q-pa-sm text-center">
                  <div class="text-caption text-grey-7">
                    Max Değer
                  </div>
                  <div class="text-body1 text-weight-medium">
                    {{ sensor.max_value ?? "-" }}
                  </div>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Stats -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">
                  Son Değer
                </div>
                <div class="text-h4 text-weight-bold text-green-8">
                  {{ latestValue !== null ? latestValue : "-" }}
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
                  {{ avgValue || "-" }}
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
                  {{ minValue !== null ? minValue : "-" }}
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
                  {{ maxValue !== null ? maxValue : "-" }}
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
                  Ham Değer
                </th>
                <th
                  v-if="
                    sensor?.min_value !== null
                      && sensor?.min_value !== undefined
                      && sensor?.max_value !== null
                      && sensor?.max_value !== undefined
                  "
                  class="text-right"
                >
                  Yüzde (%)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reading in readings" :key="reading.id">
                <td class="text-left">
                  {{
                    new Date(reading.recorded_at || "").toLocaleString("tr-TR")
                  }}
                </td>
                <td class="text-right text-weight-bold">
                  {{ reading.value }}
                </td>
                <td
                  v-if="
                    sensor?.min_value !== null
                      && sensor?.min_value !== undefined
                      && sensor?.max_value !== null
                      && sensor?.max_value !== undefined
                  "
                  class="text-right text-weight-bold text-green-8"
                >
                  {{
                    convertToPercentage(
                      reading.value,
                      sensor.min_value,
                      sensor.max_value,
                    )
                  }}%
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
