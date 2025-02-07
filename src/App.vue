<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo text-xl"
    mode="horizontal"
    @select="handleSelect"
  >
    <el-menu-item class="text-xl" index="1"
      ><RouterLink to="/">connection</RouterLink></el-menu-item
    >

    <el-menu-item index="2"><RouterLink to="/about">file</RouterLink></el-menu-item>
  </el-menu>

  <RouterView />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const activeIndex = ref('1')

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped></style>
