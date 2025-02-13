<template>
  <div class="flex flex-col gap-2 items-center">
    <el-card class="w-full" style="max-width: 40rem">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">选择发送方</span>
        </div>
      </template>
      <div>send to：{{ selPid }}</div>
      <el-select v-model="selPid" placeholder="Select" style="width: 240px">
        <el-option
          v-for="item in connectionKeyOpt"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-card>

    <el-upload
      class="w-full max-w-72"
      drag
      multiple
      ref="uploadRef"
      v-model:file-list="fileList"
      :http-request="upload"
      :limit="3"
      :on-success="handleUploadSuccess"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
      <template #tip>
        <div class="el-upload__tip">文件上传个数限制为3,提交即自动上传</div>
      </template>
    </el-upload>
    {{ fileList }}
    <el-card class="w-full" style="max-width: 40rem">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">ReceiveData</span>
        </div>
      </template>
      <div
        :key="item.id"
        v-for="item in downloadFiles"
        className="flex items-center space-x-4 rounded-md border p-4"
      >
        <el-icon><Bell /></el-icon>
        <div className="flex-1 flex justify-between gap-2 items-center space-y-1">
          <!-- 对于连续不带空格的字符串，需要添加break-all才能换行 -->
          <div class="text-pretty break-all">
            <p className="text-sm font-medium">{{ item.fileName }}</p>
            <p className="text-sm text-[#a1a1aa]">{{ formatBytes(item.size ?? 0) }}</p>
            <p className="text-sm text-[#a1a1aa]">from {{ item.from }}</p>
          </div>
          <el-button
            type="primary"
            @click="
              () =>
                item.file && downloadBlob(item.file as Uint8Array, item.fileType!, item.fileName)
            "
          >
            <el-icon><Download /></el-icon
          ></el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useDownloadFilesStore } from '@/stores/file'
import { DataType, usePeerStore } from '@/stores/peer'
import { downloadBlob, formatBytes } from '@/utils'
import { UploadFilled } from '@element-plus/icons-vue'
import { type UploadRequestOptions, type UploadUserFile } from 'element-plus'
import { UploadAjaxError } from 'element-plus/es/components/upload/src/ajax.mjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const store = usePeerStore()
const downloadFilesStore = useDownloadFilesStore()
const { sendData, sendCloseACK } = store
const { peerId, connectionMap } = storeToRefs(store)
const { downloadFiles } = storeToRefs(downloadFilesStore)
const connectionKeyOpt = computed(() => {
  const res = [...connectionMap.value.keys()].map((item) => ({ value: item, label: item }))
  return res.length ? res : []
})
const fileList = ref<UploadUserFile[]>([])
const selPid = ref('')
const upload = async (opt: UploadRequestOptions) => {
  try {
    console.log('opt:', opt, fileList.value)
    if (!selPid.value) {
      ElMessage.warning('Please select a connection')
      fileList.value = []
      return
    }

    const file = opt.file
    const blob = new Blob([file], { type: file.type })
    await sendData(selPid.value, {
      dataType: DataType.FILE,
      file: blob,
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      id: Date.now().toString(),
      from: selPid.value,
    })
    opt.onSuccess('success')
  } catch (error) {
    console.error('error:', error)
    opt.onError(new UploadAjaxError('upload fail', 500, 'post', ''))
  }
}

const handleUploadSuccess = (res: any, ...obj) => {
  console.log('res:', res, obj)
  fileList.value = []
  ElMessage.success('Upload success')
}
// const handlebeforeunload = async (e) => {
//   await sendCloseACK(selPid.value)
//   e.preventDefault()
// }
// onMounted(() => {
//   window.addEventListener('beforeunload', handlebeforeunload)
// })

// onUnmounted(() => {
//   window.removeEventListener('beforeunload', handlebeforeunload)
// })
</script>
