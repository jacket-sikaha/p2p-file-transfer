<template>
  <div class="text-center text-4xl m-6">p2p-file-transfer</div>
  <div class="flex justify-center">
    <el-card class="w-full" style="max-width: 50rem">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">Id: </span>
          <el-skeleton v-if="loading" variant="text" :rows="1" animated />
          <span v-else> {{ peer?.id }}</span>
        </div>
      </template>
      <div>
        <p class="font-bold text-lg">shareLink:</p>
        <p>
          <el-skeleton v-if="loading" variant="text" :rows="1" animated />
          <el-link v-else :href="shareLink" type="primary">{{ shareLink }}</el-link>
        </p>
        <div class="flex justify-center">
          <el-skeleton-item
            v-show="loading"
            variant="image"
            class="flex justify-center items-center"
            style="width: 10rem; height: 10rem"
            animated
          />
          <el-image
            class="m-3"
            style="width: 10rem; height: 10rem"
            v-show="!loading"
            :src="img"
            fit="contain"
            :preview-src-list="[img]"
          />
        </div>
      </div>
      <template #footer>
        <p class="font-bold text-lg">Connection</p>
        <el-tag
          :key="key"
          v-for="key in connectionKey"
          class="m-3"
          type="primary"
          size="large"
          effect="dark"
          >{{ key }}</el-tag
        >
      </template>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { usePeerStore } from '@/stores/peer'
import { handleQRCode, toQRCodeDataURL } from '@/utils'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const store = usePeerStore()
const { startPeer, connectPeer, closePeerSession } = store
const { peerId, peer, connectionMap } = storeToRefs(store)
const loading = ref(false)
const img = ref('')
const shareLink = computed(() => {
  return `${window.location.origin}?id=${peerId.value}`
})
const connectionKey = computed(() => {
  const res = [...connectionMap.value.keys()]
  return res.length ? res : ['No Connection']
})

onMounted(async () => {
  loading.value = true
  await startPeer()
  img.value = (await toQRCodeDataURL(shareLink.value)) as unknown as string
  loading.value = false
  if (route.query.id) {
    connectPeer(route.query.id as string)
    router.replace({
      query: {},
    })
  }
  console.log('route.query:', route.query.id as string)
})

onUnmounted(() => {
  closePeerSession()
})
</script>
