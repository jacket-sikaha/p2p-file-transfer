<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo text-xl flex justify-between items-center"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <div class="flex">
      <RouterLink to="/"
        ><el-menu-item class="text-xl" index="1">Connection</el-menu-item></RouterLink
      >

      <RouterLink to="/about"><el-menu-item index="2">File </el-menu-item></RouterLink>
    </div>
    <el-popover title="ID" :width="200" trigger="hover" :content="peer?.id">
      <template #reference>
        <div class="m-3">
          <el-avatar> {{ peer?.id.slice(0, 1) }} </el-avatar>
        </div>
      </template>
    </el-popover>
  </el-menu>
  <!-- 每次路由切换时，Vue 会销毁旧组件并创建新组件，因此 onMounted 会重新执行。 -->
  <!-- 在路由切换时避免重复执行 onMounted，使用 keep-alive,可以缓存组件实例，避免重复挂载和卸载 -->
  <div class="m-6">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { usePeerStore } from './stores/peer'
import { storeToRefs } from 'pinia'

const activeIndex = ref('1')
const store = usePeerStore()
const { closePeerSession } = store
const { peer } = storeToRefs(store)
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  activeIndex.value = key
}

onUnmounted(() => {
  closePeerSession()
})
</script>

<style scoped></style>
