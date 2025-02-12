import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DataType, type Data } from './peer'

export const useDownloadFilesStore = defineStore('files', () => {
  const downloadFiles = ref<Data[]>([])
  const handleReceiveData = (file: Data) => {
    if (file.dataType === DataType.FILE) {
      downloadFiles.value.push(file)
    }
  }

  const clearDownloadFiles = () => {
    downloadFiles.value = []
  }

  return {
    downloadFiles,
    handleReceiveData,
  }
})
