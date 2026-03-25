<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import BaseDialog from '~/components/BaseDialog.vue'

defineProps<{
  title: string
  message: string
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
      {{ message }}
    </BaseDialog>
  </q-dialog>
</template>
