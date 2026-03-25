import { useQuasar } from 'quasar'

export function useNotify() {
  const $q = useQuasar()

  function notifySuccess(message: string) {
    $q.notify({
      message,
      color: 'positive',
      position: 'top',
      timeout: 3000,
    })
  }

  function notifyError(message: string) {
    $q.notify({
      message,
      color: 'negative',
      position: 'top',
      timeout: 3000,
    })
  }

  function notifyInfo(message: string) {
    $q.notify({
      message,
      color: 'info',
      position: 'top',
      timeout: 3000,
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
  }
}
