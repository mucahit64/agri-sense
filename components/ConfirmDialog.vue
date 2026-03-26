<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import BaseDialog from '~/components/BaseDialog.vue'

defineProps<{
  title: string
  message: string
  caption?: string
  confirmLabel?: string
  confirmColor?: string
}>()

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <BaseDialog
      :title="title"
      icon="warning"
      :confirm-label="confirmLabel ?? 'Sil'"
      :confirm-color="confirmColor ?? 'negative'"
      @ok="onDialogOK"
    >
      <div>{{ message }}</div>
      <div v-if="caption" class="text-caption text-grey-7 q-mt-xs">
        {{ caption }}
      </div>
    </BaseDialog>
  </q-dialog>
</template>
