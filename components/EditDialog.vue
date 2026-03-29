<script setup lang="ts">
import type { Device, Field, Sensor, SensorType, SoilType, Unit } from '~/types'
import { useDialogPluginComponent } from 'quasar'
import BaseDialog from '~/components/BaseDialog.vue'
import { useNotify } from '~/composables/useNotify'

// ─── Props ───────────────────────────────────────────────
const props = defineProps<{
  type: 'field' | 'device' | 'sensor'
  item: Field | Device | Sensor | null
  fields?: { label: string, value: number | null }[]
  sensorTypes?: SensorType[]
  units?: Unit[]
  soilTypes?: SoilType[]
}>()

defineEmits([...useDialogPluginComponent.emits])

const { notifySuccess, notifyError } = useNotify()
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

// ─── Soil types (Field için) ──────────────────────────────

// ─── Form state ───────────────────────────────────────────
const form = ref({
  // Field fields
  soil_type: '',
  soil_type_custom: '',
  lat: undefined as number | undefined,
  lon: undefined as number | undefined,
  area_m2: undefined as number | undefined,
  is_active: 1,
  // Device fields
  type: '',
  location: '',
  field_id: null as number | null,
  status: 1,
  // Sensor fields
  type_id: null as number | null,
  unit_id: null as number | null,
  min_value: undefined as number | undefined,
  max_value: undefined as number | undefined,
  // Shared
  name: '',
})

const saving = ref(false)

// ─── Original values snapshot (dirty check için) ─────────
const originalValues = ref<Record<string, any>>({})

function snapshotOriginal() {
  if (props.type === 'field') {
    originalValues.value = {
      name: form.value.name,
      soil_type: form.value.soil_type,
      soil_type_custom: form.value.soil_type_custom,
      lat: form.value.lat,
      lon: form.value.lon,
      area_m2: form.value.area_m2,
      is_active: form.value.is_active,
    }
  }
  else if (props.type === 'device') {
    originalValues.value = {
      name: form.value.name,
      type: form.value.type,
      location: form.value.location,
      field_id: form.value.field_id,
      status: form.value.status,
    }
  }
  else {
    originalValues.value = {
      name: form.value.name,
      type_id: form.value.type_id,
      unit_id: form.value.unit_id,
      min_value: form.value.min_value,
      max_value: form.value.max_value,
    }
  }
}

const isDirty = computed(() => {
  for (const key of Object.keys(originalValues.value)) {
    if (form.value[key as keyof typeof form.value] !== originalValues.value[key])
      return true
  }
  return false
})

const soilTypeOptions = computed(() => {
  const opts = (props.soilTypes || []).map(st => ({ label: st.name, value: st.name }))
  opts.push({ label: 'Diğer', value: '__other__' })
  return opts
})

const isCustomSoilType = computed(() => form.value.soil_type === '__other__')

// Item değişince formu doldur
watch(
  () => props.item,
  (item) => {
    if (!item)
      return
    form.value.name = item.name || ''
    form.value.is_active = (item as Field).is_active ?? 1

    if (props.type === 'field') {
      const f = item as Field
      // Eğer mevcut soil_type, bilinen seçeneklerde yoksa "Diğer" olarak ayarla
      const knownNames = (props.soilTypes || []).map(st => st.name)
      if (f.soil_type && !knownNames.includes(f.soil_type)) {
        form.value.soil_type = '__other__'
        form.value.soil_type_custom = f.soil_type
      }
      else {
        form.value.soil_type = f.soil_type || ''
        form.value.soil_type_custom = ''
      }
      form.value.lat = f.lat ?? undefined
      form.value.lon = f.lon ?? undefined
      form.value.area_m2 = f.area_m2 ?? undefined
    }
    else if (props.type === 'device') {
      const d = item as Device
      form.value.type = d.type || ''
      form.value.location = d.location || ''
      form.value.field_id = d.field_id ?? null
      form.value.status = d.status ?? 1
    }
    else {
      const s = item as Sensor
      form.value.type_id = s.type_id ?? null
      form.value.unit_id = s.unit_id ?? null
      form.value.min_value = s.min_value ?? undefined
      form.value.max_value = s.max_value ?? undefined
    }
  },
  { immediate: true },
)

// İlk yükleme sonrası orijinal değerleri kaydet
watch(
  () => props.item,
  () => {
    nextTick(() => snapshotOriginal())
  },
  { immediate: true },
)

// ─── Filtered units based on selected sensor type ─────────
const availableUnits = computed(() => {
  if (!props.units || !form.value.type_id)
    return []
  return props.units.filter(u => u.sensor_type_id === form.value.type_id)
})

// Auto-select default unit when sensor type changes (only if type actually changed)
watch(() => form.value.type_id, (newTypeId, oldTypeId) => {
  if (props.type !== 'sensor' || !newTypeId)
    return
  // Only auto-select if type actually changed (not initial load)
  if (oldTypeId !== undefined && oldTypeId !== null) {
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
  }
})

// ─── Save ─────────────────────────────────────────────────
const config = computed(() => {
  if (props.type === 'field')
    return { title: 'Tarlayı Düzenle', icon: 'landscape' }
  if (props.type === 'device')
    return { title: 'Cihazı Düzenle', icon: 'memory' }
  return { title: 'Sensörü Düzenle', icon: 'sensors' }
})

async function save() {
  if (!props.item)
    return

  saving.value = true

  let endpoint: string
  let body: Record<string, any>

  if (props.type === 'field') {
    endpoint = `/api/fields/${props.item.id}`

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
      lat: form.value.lat || null,
      lon: form.value.lon || null,
      area_m2: form.value.area_m2 || null,
      is_active: form.value.is_active,
    }
  }
  else if (props.type === 'device') {
    endpoint = `/api/devices/${props.item.id}`
    body = {
      name: form.value.name,
      type: form.value.type || null,
      location: form.value.location || null,
      field_id: form.value.field_id || null,
      status: form.value.status,
    }
  }
  else {
    endpoint = `/api/sensors/${props.item.id}`
    body = {
      name: form.value.name,
      type_id: form.value.type_id,
      unit_id: form.value.unit_id,
      min_value: form.value.min_value,
      max_value: form.value.max_value,
    }
  }

  const labels = { field: 'Tarla', device: 'Cihaz', sensor: 'Sensör' }

  try {
    await $fetch(endpoint, { method: 'PUT', body })
    notifySuccess(`${labels[props.type]} güncellendi`)
    onDialogOK()
  }
  catch (error: any) {
    notifyError(error.data?.message || 'Güncelleme başarısız')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <q-dialog ref="dialogRef" :persistent="isDirty" @hide="onDialogHide">
    <BaseDialog
      :title="config.title"
      :icon="config.icon"
      confirm-label="Kaydet"
      :confirm-loading="saving"
      :confirm-disable="!form.name"
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
          hide-bottom-space
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
          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="form.lat"
              outlined
              dense
              type="number"
              label="Enlem (Lat)"
              step="0.0001"
            />
          </div>
          <div class="col-12 col-sm-6">
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
        <div class="row items-center">
          <q-toggle
            v-model="form.is_active"
            :true-value="1"
            :false-value="0"
            color="green-8"
            label="Aktif"
          />
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
        <div class="row items-center">
          <q-toggle
            v-model="form.status"
            :true-value="1"
            :false-value="0"
            color="green-8"
            label="Aktif"
          />
        </div>
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
          hide-bottom-space
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
          hide-bottom-space
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
