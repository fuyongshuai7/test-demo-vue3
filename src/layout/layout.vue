<template>
  <div class="layout">
      <div class="menu">
          <el-menu @select="menuClick">
            <MenuItem :routes="routes"></MenuItem>
          </el-menu>
      </div>
      <div class="content">
          <router-view></router-view>
      </div>
  </div>
</template>

<script setup lang="ts">
import router, { routes } from '@/router/index'
import MenuItem from './components/menuItem.vue'

function menuClick(index: string, indexPath: string[]) {
    const toPath: string = indexPath.join("/")
    router.push(toPath)
}
</script>
<style lang="scss" scoped>
.layout {
    $width: 200px;
    display: flex;
    flex-direction: row;
    height: 100%;
    .menu {
        width: $width;
    }
    .content {
        flex-grow: 1; 
    }
    &::v-deep {
        .el-menu {
            height: 100%;
        }
    }
}
</style>