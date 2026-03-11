<script setup lang="ts">
import type { Device, Field } from '~/types'
import { Notify } from 'quasar'
import { soilTypes } from '~/utils/constants'

// ─── Props ───────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  type: 'field' | 'device'
  item: Field | Device | null
  fields?: { label: string, value: number | null }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'saved'): void
}>()

// ─── Dialog visibility ────────────────────────────────────
const show = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// ─── Soil types (Field için) ──────────────────────────────

// ─── Form state ───────────────────────────────────────────
const form = ref({
  // Field fields
  soil_type: '',
  lat: undefined as number | undefined,
  lon: undefined as number | undefined,
  area_m2: undefined as number | undefined,
  is_active: 1,
  // Device fields
  type: '',
  location: '',
  field_id: null as number | null,
  status: 1,
  // Shared
  name: '',
})

const saving = ref(false)

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
      form.value.soil_type = f.soil_type || ''
      form.value.lat = f.lat ?? undefined
      form.value.lon = f.lon ?? undefined
      form.value.area_m2 = f.area_m2 ?? undefined
    }
    else {
      const d = item as Device
      form.value.type = d.type || ''
      form.value.location = d.location || ''
      form.value.field_id = d.field_id ?? null
      form.value.status = d.status ?? 1
    }
  },
  { immediate: true },
)

// ─── Save ─────────────────────────────────────────────────
async function save() {
  if (!props.item)
    return

  saving.value = true
  const endpoint
    = props.type === 'field'
      ? `/api/fields/${props.item.id}`
      : `/api/devices/${props.item.id}`

  const body
    = props.type === 'field'
      ? {
          name: form.value.name,
          soil_type: form.value.soil_type || null,
          lat: form.value.lat || null,
          lon: form.value.lon || null,
          area_m2: form.value.area_m2 || null,
          is_active: form.value.is_active,
        }
      : {
          name: form.value.name,
          type: form.value.type || null,
          location: form.value.location || null,
          field_id: form.value.field_id || null,
          status: form.value.status,
        }

  try {
    await $fetch(endpoint, { method: 'PUT', body })
    show.value = false
    emit('saved')
    Notify.create({
      type: 'positive',
      message:
        props.type === 'field' ? 'Tarla güncellendi' : 'Cihaz güncellendi',
    })
  }
  catch (error: any) {
    Notify.create({
      type: 'negative',
      message: error.data?.message || 'Güncelleme başarısız',
    })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 420px; max-width: 95vw">
      <!-- Header -->
      <q-card-section class="bg-green-8 text-white row items-center q-py-sm">
        <q-icon
          :name="type === 'field' ? 'landscape' : 'memory'"
          size="22px"
          class="q-mr-sm"
        />
        <span class="text-subtitle1 text-weight-bold">
          {{ type === "field" ? "Tarlayı Düzenle" : "Cihazı Düzenle" }}
        </span>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" color="white" />
      </q-card-section>

      <q-card-section class="q-pt-md q-gutter-y-sm">
        <!-- Ad (ortak) -->
        <q-input
          v-model="form.name"
          outlined
          dense
          :label="type === 'field' ? 'Tarla Adı *' : 'Cihaz Adı *'"
          :rules="[(val: string) => !!val || 'Bu alan zorunludur']"
        />

        <!-- FIELD alanları -->
        <template v-if="type === 'field'">
          <q-select
            v-model="form.soil_type"
            outlined
            dense
            clearable
            :options="soilTypes"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            options-dense
            label="Toprak Tipi"
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
        <template v-else>
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
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn v-close-popup flat label="İptal" />
        <q-btn
          unelevated
          color="green-8"
          label="Kaydet"
          :loading="saving"
          :disable="!form.name"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
