<template>
  <div class="flex flex-col gap-2 items-center">
    <el-upload
      class="w-full max-w-72"
      drag
      multiple
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
      <div className="flex items-center space-x-4 rounded-md border p-4">
        <el-icon><Bell /></el-icon>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Push Notifications</p>
          <p className="text-sm text-[#a1a1aa]">Send notifications to device.</p>
        </div>
        <el-button type="primary">Primary</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { usePeerStore } from '@/stores/peer'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, type UploadRawFile, type UploadRequestOptions } from 'element-plus'
import { UploadAjaxError } from 'element-plus/es/components/upload/src/ajax.mjs'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const store = usePeerStore()
const { sendData } = store
const { peerId, peer, connectionMap } = storeToRefs(store)
// const loading = ref(false)
const fileList = ref<UploadRawFile[]>([])
const upload = async (opt: UploadRequestOptions) => {
  try {
    console.log('opt:', opt, fileList.value)
    await sendData('', {})
    opt.onSuccess('success')
  } catch (error) {
    console.error('error:', error)
    opt.onError(new UploadAjaxError('upload fail', 500, 'post', ''))
  }
}

const handleUploadSuccess = (res: any, ...obj) => {
  console.log('res:', res, obj)
  ElMessage.success('Upload success')
}
console.log('fileList:', fileList)
</script>
