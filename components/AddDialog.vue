<script setup lang="ts">
import type { SensorType, SoilType, Unit } from '~/types'
import { useDialogPluginComponent } from 'quasar'
import BaseDialog from '~/components/BaseDialog.vue'
import { useNotify } from '~/composables/useNotify'

// ─── Props ───────────────────────────────────────────────
const props = defineProps<{
  type: 'field' | 'device' | 'sensor'
  // Sensor
  sensorTypes?: SensorType[]
  units?: Unit[]
  deviceId?: number | string
  // Device
  fields?: { label: string, value: number | null }[]
  // Field
  soilTypes?: SoilType[]
}>()

defineEmits([...useDialogPluginComponent.emits])

const { notifySuccess, notifyError } = useNotify()
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

// ─── Form state ───────────────────────────────────────────
const form = ref({
  name: '',
  // Field
  soil_type: '',
  soil_type_custom: '',
  lat: undefined as number | undefined,
  lon: undefined as number | undefined,
  area_m2: undefined as number | undefined,
  // Device
  type: '',
  location: '',
  field_id: null as number | null,
  // Sensor
  type_id: null as number | null,
  unit_id: null as number | null,
  min_value: undefined as number | undefined,
  max_value: undefined as number | undefined,
})

const saving = ref(false)

// ─── Soil type options (DB + virtual "Diğer") ─────────────
const soilTypeOptions = computed(() => {
  const opts = (props.soilTypes || []).map(st => ({ label: st.name, value: st.name }))
  opts.push({ label: 'Diğer', value: '__other__' })
  return opts
})

const isCustomSoilType = computed(() => form.value.soil_type === '__other__')

// ─── Filtered units based on selected sensor type ─────────
const availableUnits = computed(() => {
  if (!props.units || !form.value.type_id)
    return []
  return props.units.filter(u => u.sensor_type_id === form.value.type_id)
})

// Auto-select default unit when sensor type changes
watch(() => form.value.type_id, () => {
  const units = availableUnits.value
  const defaultUnit = units.find(u => u.is_default === 1)
  if (defaultUnit) {
    form.value.unit_id = defaultUnit.id
  }
  else if (units.length > 0) {
    form.value.unit_id = units[0]!.id
  }
  else {
    form.value.unit_id = null
  }
})

// ─── Config per type ──────────────────────────────────────
const config = computed(() => {
  if (props.type === 'field')
    return { title: 'Yeni Tarla Ekle', icon: 'landscape' }
  if (props.type === 'device')
    return { title: 'Yeni Cihaz Ekle', icon: 'memory' }
  return { title: 'Yeni Sensör Ekle', icon: 'sensors' }
})

const canSave = computed(() => {
  if (!form.value.name)
    return false
  if (props.type === 'field' && isCustomSoilType.value && !form.value.soil_type_custom.trim())
    return false
  if (props.type === 'sensor')
    return !!form.value.type_id && !!form.value.unit_id
  return true
})

// ─── Save ─────────────────────────────────────────────────
async function save() {
  saving.value = true

  let endpoint: string
  let body: Record<string, any>

  if (props.type === 'field') {
    endpoint = '/api/fields'

    let soilType: string | null = null
    if (isCustomSoilType.value && form.value.soil_type_custom.trim()) {
      try {
        await $fetch('/api/soil-types', { method: 'POST', body: { name: form.value.soil_type_custom.trim() } })
      }
      catch (err: any) {
        if (err.data?.statusCode !== 409) {
          notifyError(err.data?.message || 'Toprak tipi eklenemedi')
          saving.value = false
          return
        }
      }
      soilType = form.value.soil_type_custom.trim()
    }
    else if (form.value.soil_type && form.value.soil_type !== '__other__') {
      soilType = form.value.soil_type
    }

    body = {
      name: form.value.name,
      soil_type: soilType,
      lat: form.value.lat ?? null,
      lon: form.value.lon ?? null,
      area_m2: form.value.area_m2 ?? null,
    }
  }
  else if (props.type === 'device') {
    endpoint = '/api/devices'
    body = {
      name: form.value.name,
      type: form.value.type || null,
      location: form.value.location || null,
      field_id: form.value.field_id ?? null,
    }
  }
  else {
    endpoint = '/api/sensors'
    body = {
      device_id: Number(props.deviceId),
      name: form.value.name,
      type_id: form.value.type_id,
      unit_id: form.value.unit_id,
      min_value: form.value.min_value,
      max_value: form.value.max_value,
    }
  }

  try {
    await $fetch(endpoint, { method: 'POST', body })
    notifySuccess(`${config.value.title.replace('Yeni ', '').replace(' Ekle', '')} eklendi`)
    onDialogOK()
  }
  catch (error: any) {
    notifyError(error.data?.message || 'Ekleme başarısız')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <BaseDialog
      :title="config.title"
      :icon="config.icon"
      confirm-label="Ekle"
      :confirm-loading="saving"
      :confirm-disable="!canSave"
      @ok="save"
    >
      <!-- Ad (ortak) -->
      <q-input
        v-model="form.name"
        outlined
        dense
        hide-bottom-space
        :label="type === 'field' ? 'Tarla Adı *' : type === 'device' ? 'Cihaz Adı *' : 'Sensör Adı *'"
        :rules="[(val: string) => !!val || 'Bu alan zorunludur']"
      />

      <!-- FIELD alanları -->
      <template v-if="type === 'field'">
        <q-select
          v-model="form.soil_type"
          outlined
          dense
          clearable
          :options="soilTypeOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          options-dense
          label="Toprak Tipi"
        />
        <q-input
          v-if="isCustomSoilType"
          v-model="form.soil_type_custom"
          outlined
          dense
          label="Toprak Tipi (Diğer) *"
          hint="Toprak tipini giriniz"
          :rules="[(val: string) => !!val?.trim() || 'Bu alan zorunludur']"
        />
        <q-input
          v-model.number="form.area_m2"
          outlined
          dense
          type="number"
          label="Alan (m²)"
          min="0"
        />
        <div class="row q-col-gutter-sm q-gutter-y-md">
          <div class="col-6">
            <q-input
              v-model.number="form.lat"
              outlined
              dense
              type="number"
              label="Enlem (Lat)"
              step="0.0001"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form.lon"
              outlined
              dense
              type="number"
              label="Boylam (Lon)"
              step="0.0001"
            />
          </div>
        </div>
      </template>

      <!-- DEVICE alanları -->
      <template v-else-if="type === 'device'">
        <q-input
          v-model="form.type"
          outlined
          dense
          label="Cihaz Tipi"
          hint="Örn: ESP32, Arduino"
        />
        <q-input
          v-model="form.location"
          outlined
          dense
          label="Konum"
          hint="Örn: Sera 1, Bahçe"
        />
        <q-select
          v-if="fields && fields.length"
          v-model="form.field_id"
          outlined
          dense
          clearable
          :options="fields"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          options-dense
          label="Tarla"
        />
      </template>

      <!-- SENSOR alanları -->
      <template v-else>
        <q-select
          v-model="form.type_id"
          outlined
          dense
          :options="sensorTypes"
          option-value="id"
          option-label="label"
          emit-value
          map-options
          options-dense
          label="Sensör Tipi *"
          :rules="[(val: number | null) => !!val || 'Sensör tipi zorunludur']"
        />
        <q-select
          v-model="form.unit_id"
          outlined
          dense
          :options="availableUnits"
          option-value="id"
          :option-label="(opt: any) => `${opt.name} (${opt.symbol})`"
          emit-value
          map-options
          options-dense
          label="Birim *"
          :disable="!form.type_id"
          :hint="!form.type_id ? 'Önce sensör tipi seçin' : ''"
          :rules="[(val: number | null) => !!val || 'Birim zorunludur']"
        />
        <q-input
          v-model.number="form.min_value"
          outlined
          dense
          type="number"
          label="Minimum Değer"
          hint="Sensörün ölçebileceği minimum değer"
        />
        <q-input
          v-model.number="form.max_value"
          outlined
          dense
          type="number"
          label="Maksimum Değer"
          hint="Sensörün ölçebileceği maksimum değer"
        />
      </template>
    </BaseDialog>
  </q-dialog>
</template>
