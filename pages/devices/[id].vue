<script setup lang="ts">
import type { Device, Field, Sensor, SensorType } from '~/types'
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

const deviceId = route.params.id as string
const device = ref<Device | null>(null)
const sensors = ref<Sensor[]>([])
const fields = ref<Field[]>([])
const loading = ref(true)
const showAddDialog = ref(false)
const showEditDialog = ref(false)

const newSensor = ref({
  name: '',
  type_id: null as number | null,
  unit_id: null as number | null,
  min_value: undefined as number | undefined,
  max_value: undefined as number | undefined,
})

const sensorTypes = ref<SensorType[]>([])
const availableUnits = ref<{ id: number, name: string, symbol: string, is_default: number }[]>([])

async function loadSensorTypes() {
  try {
    const response = await $fetch<{ success: boolean, sensorTypes: SensorType[] }>('/api/sensor-types')
    sensorTypes.value = response.sensorTypes
  }
  catch (error) {
    console.error('Sensör tipleri yüklenemedi:', error)
  }
}

async function loadUnitsForType(typeId: number) {
  try {
    const response = await $fetch<{ success: boolean, units: any[] }>(`/api/units?sensor_type_id=${typeId}`)
    availableUnits.value = response.units
    const defaultUnit = response.units.find((u: any) => u.is_default === 1)
    if (defaultUnit) {
      newSensor.value.unit_id = defaultUnit.id
    }
    else if (response.units.length > 0) {
      newSensor.value.unit_id = response.units[0].id
    }
  }
  catch (error) {
    console.error('Birimler yüklenemedi:', error)
  }
}

watch(() => newSensor.value.type_id, (newTypeId) => {
  if (newTypeId) {
    loadUnitsForType(newTypeId)
  }
  else {
    availableUnits.value = []
    newSensor.value.unit_id = null
  }
})

async function loadDevice() {
  try {
    const response = await $fetch<{ success: boolean, device: Device }>(
      `/api/devices/${deviceId}`,
    )
    device.value = response.device
  }
  catch (error) {
    console.error('Cihaz yüklenemedi:', error)
    router.push('/devices')
  }
}

async function loadFields() {
  try {
    const response = await $fetch<{ success: boolean, fields: Field[] }>('/api/fields')
    fields.value = response.fields
  }
  catch (error) {
    console.error('Tarlalar yüklenemedi:', error)
  }
}

async function loadSensors() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, sensors: Sensor[] }>(`/api/sensors?device_id=${deviceId}`)
    sensors.value = response.sensors
  }
  catch (error) {
    console.error('Sensörler yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

async function removeFromField() {
  Dialog.create({
    title: 'Onay',
    message: 'Cihazı tarladan kaldırmak istediğinizden emin misiniz?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await $fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        body: { field_id: null },
      })
      await loadDevice()
      Notify.create({
        type: 'positive',
        message: 'Cihaz tarladan kaldırıldı',
      })
    }
    catch (error: any) {
      Notify.create({
        type: 'negative',
        message: error.data?.message || 'İşlem başarısız',
      })
    }
  })
}

async function addSensor() {
  try {
    await $fetch('/api/sensors', {
      method: 'POST',
      body: {
        device_id: Number(deviceId),
        name: newSensor.value.name,
        type_id: newSensor.value.type_id,
        unit_id: newSensor.value.unit_id,
        min_value: newSensor.value.min_value,
        max_value: newSensor.value.max_value,
      },
    })
    showAddDialog.value = false
    newSensor.value = {
      name: '',
      type_id: null,
      unit_id: null,
      min_value: undefined,
      max_value: undefined,
    }
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
  }).onOk(async () => {
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
}

function getSensorIcon(sensor: Sensor) {
  return sensor.type_icon || 'sensors'
}

function getSensorLabel(sensor: Sensor) {
  return sensor.type_label || sensor.type_name || ''
}

const fieldOptions = computed(() => [
  { label: 'Atanmamış', value: null },
  ...fields.value.map(f => ({ label: f.name || `Tarla #${f.id}`, value: f.id })),
])

onMounted(() => {
  loadDevice()
  loadSensors()
  loadSensorTypes()
  loadFields()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar :title="device?.name || 'Cihaz Detayı'" back-to="/devices" />

    <q-page-container>
      <q-page class="q-pa-md">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6">
                Cihaz Bilgileri
              </div>
              <q-space />
              <q-btn
                flat
                color="primary"
                icon="edit"
                label="Düzenle"
                @click="showEditDialog = true"
              />
            </div>

            <div class="text-caption text-grey-7 q-mt-sm">
              Tip: {{ device?.type || '-' }} | Konum:
              {{ device?.location || '-' }}
            </div>
            <div class="text-caption text-grey-7">
              Tarla:
              <template v-if="device?.field_name">
                <q-badge color="green-8" class="q-ml-xs">
                  {{ device.field_name }}
                </q-badge>
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="negative"
                  icon="link_off"
                  class="q-ml-xs"
                  @click="removeFromField"
                >
                  <q-tooltip>Tarladan Kaldır</q-tooltip>
                </q-btn>
              </template>
              <template v-else>
                Atanmamış
              </template>
            </div>
            <div class="q-mt-sm">
              <q-badge :color="device?.status === 1 ? 'positive' : 'grey'">
                {{ device?.status === 1 ? 'Aktif' : 'Pasif' }}
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
          <div
            v-for="sensor in sensors"
            :key="sensor.id"
            class="col-12 col-md-4"
          >
            <q-card>
              <q-card-section>
                <div class="row items-center">
                  <q-icon
                    :name="getSensorIcon(sensor)"
                    size="32px"
                    color="green-8"
                  />
                  <div class="q-ml-md">
                    <div class="text-subtitle1 text-weight-bold">
                      {{ sensor.name || getSensorLabel(sensor) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ getSensorLabel(sensor) }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="text-caption text-grey-7">
                  Birim: {{ sensor.unit_symbol || '-' }}
                </div>
                <div class="text-caption text-grey-7">
                  Min:
                  {{
                    sensor.min_value !== null && sensor.min_value !== undefined
                      ? sensor.min_value
                      : '-'
                  }}
                </div>
                <div class="text-caption text-grey-7">
                  Max:
                  {{
                    sensor.max_value !== null && sensor.max_value !== undefined
                      ? sensor.max_value
                      : '-'
                  }}
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

        <!-- Edit Device Dialog -->
        <EditDialog
          v-model="showEditDialog"
          type="device"
          :item="device"
          :fields="fieldOptions"
          @saved="loadDevice"
        />

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
                v-model="newSensor.name"
                outlined
                label="Sensör Adı *"
                class="q-mb-md"
                hint="Örn: Bahçe Sıcaklık Sensörü"
                :rules="[(val) => !!val || 'Sensör adı zorunludur']"
              />
              <q-select
                v-model="newSensor.type_id"
                outlined
                :options="sensorTypes"
                option-value="id"
                option-label="label"
                emit-value
                map-options
                label="Sensör Tipi *"
                :rules="[(val: number | null) => !!val || 'Sensör tipi zorunludur']"
              />
              <q-select
                v-model="newSensor.unit_id"
                outlined
                :options="availableUnits"
                option-value="id"
                :option-label="(opt: any) => `${opt.name} (${opt.symbol})`"
                emit-value
                map-options
                label="Birim *"
                class="q-mt-md"
                :disable="!newSensor.type_id"
                :hint="!newSensor.type_id ? 'Önce sensör tipi seçin' : ''"
                :rules="[(val: number | null) => !!val || 'Birim zorunludur']"
              />
              <q-input
                v-model.number="newSensor.min_value"
                outlined
                type="number"
                label="Minimum Değer"
                class="q-mt-md"
                hint="Sensörün ölçebileceği minimum değer"
              />
              <q-input
                v-model.number="newSensor.max_value"
                outlined
                type="number"
                label="Maksimum Değer"
                class="q-mt-md"
                hint="Sensörün ölçebileceği maksimum değer"
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
