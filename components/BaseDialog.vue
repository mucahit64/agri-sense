<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
  confirmLabel?: string
  confirmColor?: string
  confirmDisable?: boolean
  confirmLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'ok'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <q-card style="width: 460px; max-width: 95vw">
    <!-- Header -->
    <q-card-section class="bg-green-8 text-white row items-center q-py-sm">
      <q-icon v-if="icon" :name="icon" size="22px" class="q-mr-sm" />
      <span class="text-subtitle1 text-weight-bold">{{ title }}</span>
      <q-space />
      <q-btn v-close-popup flat round dense icon="close" color="white" />
    </q-card-section>

    <!-- Body -->
    <q-card-section>
      <div class="column q-pa-sm q-gutter-y-sm">
        <slot />
      </div>
    </q-card-section>

    <q-separator />

    <!-- Actions -->
    <q-card-actions align="right" class="q-pa-md">
      <q-btn v-close-popup flat label="İptal" />
      <q-btn
        unelevated
        :color="confirmColor ?? 'green-8'"
        :label="confirmLabel ?? 'Kaydet'"
        :loading="confirmLoading"
        :disable="confirmDisable"
        @click="emit('ok')"
      />
    </q-card-actions>
  </q-card>
</template>
