<script setup lang="ts">
import type { Device, Sensor } from '~/types'
import { Dialog, Notify } from 'quasar'

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

const deviceId = route.params.id as string
const device = ref<Device | null>(null)
const sensors = ref<Sensor[]>([])
const loading = ref(true)
const showAddDialog = ref(false)

const newSensor = ref({
  sensor_uid: '',
  sensor_type: 'temperature',
  name: '',
  pin: '',
  unit: '',
})

const sensorTypes = [
  { value: 'temperature', label: 'Sıcaklık', icon: 'thermostat', unit: '°C' },
  { value: 'humidity', label: 'Nem', icon: 'water_drop', unit: '%' },
  { value: 'soil_moisture', label: 'Toprak Nemi', icon: 'opacity', unit: '%' },
  { value: 'ph', label: 'pH', icon: 'science', unit: 'pH' },
  { value: 'light', label: 'Işık', icon: 'wb_sunny', unit: 'lux' },
  { value: 'pressure', label: 'Basınç', icon: 'compress', unit: 'hPa' },
]

async function loadDevice() {
  try {
    const response = await $fetch<{ success: boolean, device: Device }>(`/api/devices/${deviceId}`)
    device.value = response.device
  }
  catch (error) {
    console.error('Cihaz yüklenemedi:', error)
    router.push('/devices')
  }
}

async function loadSensors() {
  try {
    loading.value = true
    const response = await $fetch(`/api/sensors?device_id=${deviceId}`)
    sensors.value = response.sensors
  }
  catch (error) {
    console.error('Sensörler yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

async function addSensor() {
  try {
    const selectedType = sensorTypes.find(t => t.value === newSensor.value.sensor_type)
    await $fetch('/api/sensors', {
      method: 'POST',
      body: {
        device_id: Number(deviceId),
        sensor_uid: newSensor.value.sensor_uid,
        sensor_type: newSensor.value.sensor_type,
        name: newSensor.value.name,
        pin: newSensor.value.pin,
        unit: newSensor.value.unit || selectedType?.unit,
      },
    })
    showAddDialog.value = false
    newSensor.value = { sensor_uid: '', sensor_type: 'temperature', name: '', pin: '', unit: '' }
    await loadSensors()
  }
  catch (error: any) {
    Notify.create({
      type: 'negative',
      message: error.data?.message || 'Sensör eklenemedi',
    })
  }
}

async function deleteSensor(id: number) {
  Dialog.create({
    title: 'Onay',
    message: 'Bu sensörü silmek istediğinizden emin misiniz?',
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      try {
        await $fetch(`/api/sensors/${id}`, { method: 'DELETE' })
        await loadSensors()
      }
      catch (error: any) {
        Notify.create({
          type: 'negative',
          message: error.data?.message || 'Sensör silinemedi',
        })
      }
    })
    .onCancel(() => {
      // Kullanıcı iptal etti
    })
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
  loadDevice()
  loadSensors()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="router.push('/devices')" />
        <q-toolbar-title>
          <q-icon name="eco" size="28px" class="q-mr-sm" />
          {{ device?.device_name || 'Cihaz Detayı' }}
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
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">
              Cihaz Bilgileri
            </div>
            <div class="text-caption text-grey-7">
              UID: {{ device?.device_uid }}
            </div>
            <div class="q-mt-sm">
              <q-badge :color="device?.is_active ? 'positive' : 'grey'">
                {{ device?.is_active ? 'Aktif' : 'Pasif' }}
              </q-badge>
            </div>
          </q-card-section>
        </q-card>

        <div class="row items-center q-mb-md">
          <div class="text-h6 text-weight-bold">
            Sensörler
          </div>
          <q-space />
          <q-btn
            unelevated
            color="green-8"
            label="Yeni Sensör Ekle"
            icon="add"
            @click="showAddDialog = true"
          />
        </div>

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner size="50px" color="green-8" />
        </div>

        <div v-else-if="sensors.length === 0" class="text-center q-pa-xl">
          <q-icon name="sensors" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            Henüz sensör eklenmemiş
          </div>
          <q-btn
            flat
            color="green-8"
            label="İlk Sensörünüzü Ekleyin"
            class="q-mt-md"
            @click="showAddDialog = true"
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
                    <div class="text-caption text-grey-6">
                      UID: {{ sensor.sensor_uid }}
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
              </q-card-section>

              <q-separator />

              <q-card-actions>
                <q-btn
                  flat
                  color="primary"
                  label="Veriler"
                  :to="`/sensors/${sensor.id}`"
                />
                <q-space />
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  @click="deleteSensor(sensor.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Add Sensor Dialog -->
        <q-dialog v-model="showAddDialog">
          <q-card style="min-width: 400px">
            <q-card-section>
              <div class="text-h6">
                Yeni Sensör Ekle
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="newSensor.sensor_uid"
                outlined
                label="Sensör UID *"
                class="q-mb-md"
                hint="Örn: SENSOR_001, ARDUINO_001_SOIL_A0"
                :rules="[val => !!val || 'Sensör UID zorunludur']"
              />
              <q-select
                v-model="newSensor.sensor_type"
                outlined
                :options="sensorTypes"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="Sensör Tipi *"
              />
              <q-input
                v-model="newSensor.name"
                outlined
                label="Sensör Adı"
                class="q-mt-md"
                hint="Örn: Bahçe Sıcaklık Sensörü"
              />
              <q-input
                v-model="newSensor.pin"
                outlined
                label="Pin"
                class="q-mt-md"
                hint="Örn: A0, D4"
              />
              <q-input
                v-model="newSensor.unit"
                outlined
                label="Birim"
                class="q-mt-md"
                hint="Otomatik doldurulur"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn v-close-popup flat label="İptal" />
              <q-btn
                unelevated
                color="green-8"
                label="Ekle"
                @click="addSensor"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
  .select-none {
  user-select: none !important;
}
</style>
