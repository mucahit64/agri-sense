<script setup lang="ts">
import type { Device, Field, Sensor, SensorType, Unit } from '~/types'
import AddDialog from '~/components/AddDialog.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import EditDialog from '~/components/EditDialog.vue'
import { useNotify } from '~/composables/useNotify'

definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const { notifySuccess, notifyError } = useNotify()

const deviceId = route.params.id as string
const device = ref<Device | null>(null)
const sensors = ref<Sensor[]>([])
const fields = ref<Field[]>([])
const loading = ref(true)
const sensorTypes = ref<SensorType[]>([])
const allUnits = ref<Unit[]>([])

async function loadSensorTypes() {
  try {
    const response = await $fetch<{ success: boolean, sensorTypes: SensorType[] }>('/api/sensor-types')
    sensorTypes.value = response.sensorTypes
  }
  catch (error: any) {
    notifyError(error.data?.message || 'Sensör tipleri yüklenemedi')
  }
}

async function loadUnits() {
  try {
    const response = await $fetch<{ success: boolean, units: Unit[] }>('/api/units')
    allUnits.value = response.units
  }
  catch (error: any) {
    notifyError(error.data?.message || 'Birimler yüklenemedi')
  }
}

async function loadDevice() {
  try {
    const response = await $fetch<{ success: boolean, device: Device }>(
      `/api/devices/${deviceId}`,
    )
    device.value = response.device
  }
  catch (error: any) {
    notifyError(error.data?.message || 'Cihaz yüklenemedi')
    router.push('/devices')
  }
}

async function loadFields() {
  try {
    const response = await $fetch<{ success: boolean, fields: Field[] }>('/api/fields')
    fields.value = response.fields
  }
  catch (error: any) {
    notifyError(error.data?.message || 'Tarlalar yüklenemedi')
  }
}

async function loadSensors() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, sensors: Sensor[] }>(`/api/sensors?device_id=${deviceId}`)
    sensors.value = response.sensors
  }
  catch (error: any) {
    notifyError(error.data?.message || 'Sensörler yüklenemedi')
  }
  finally {
    loading.value = false
  }
}

async function removeFromField() {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Onayla',
      message: 'Cihazı tarladan kaldırmak istediğinizden emin misiniz?',
      confirmLabel: 'Kaldır',
      confirmColor: 'warning',
    },
  }).onOk(async () => {
    try {
      await $fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        body: { field_id: null },
      })
      await loadDevice()
      notifySuccess('Cihaz tarladan kaldırıldı')
    }
    catch (error: any) {
      notifyError(error.data?.message || 'İşlem başarısız')
    }
  })
}

async function deleteSensor(id: number) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Sensörü Sil',
      message: 'Bu sensörü silmek istediğinizden emin misiniz?',
    },
  }).onOk(async () => {
    try {
      await $fetch(`/api/sensors/${id}`, { method: 'DELETE' })
      await loadSensors()
    }
    catch (error: any) {
      notifyError(error.data?.message || 'Sensör silinemedi')
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

function openEditDialog(item: Device | null) {
  $q.dialog({
    component: EditDialog,
    componentProps: {
      type: 'device',
      item,
      fields: fieldOptions.value,
    },
  }).onOk(() => {
    loadDevice()
  })
}

function openSensorEditDialog(sensor: Sensor) {
  $q.dialog({
    component: EditDialog,
    componentProps: {
      type: 'sensor',
      item: sensor,
      sensorTypes: sensorTypes.value,
      units: allUnits.value,
    },
  }).onOk(() => {
    loadSensors()
  })
}

function openAddDialog() {
  $q.dialog({
    component: AddDialog,
    componentProps: {
      type: 'sensor',
      deviceId,
      sensorTypes: sensorTypes.value,
      units: allUnits.value,
    },
  }).onOk(() => {
    loadSensors()
  })
}

onMounted(() => {
  loadDevice()
  loadSensors()
  loadFields()
  loadSensorTypes()
  loadUnits()
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
                @click="openEditDialog(device)"
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
            @click="openAddDialog()"
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
            @click="openAddDialog()"
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
                  color="warning"
                  icon="edit"
                  @click="openSensorEditDialog(sensor)"
                />
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
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.select-none {
  user-select: none !important;
}
</style>
