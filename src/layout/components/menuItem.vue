<template>
  <div class="menu-item" v-for="(route) in props.routes" :key="(route as RouteRecordRaw).name">
        <el-menu-item v-if="!childrenShowCount((route as any).children)" :index="(route as RouteRecordRaw).path">{{ (route as RouteRecordRaw).meta?.title }}</el-menu-item>
        <el-sub-menu v-else :index="(route as RouteRecordRaw).path">
            <template #title>
                <span>{{ (route as RouteRecordRaw).meta?.title }}</span>
            </template>
            <MenuItem :routes="(route as RouteRecordRaw).children"></MenuItem>
        </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue"
import { RouteRecordRaw } from "vue-router";

const props = defineProps({
    routes: {
        type: Array,
        require: true,
        default: () => []
    }
})

function childrenShowCount(routeChildren: any[]): number {
    if(!routeChildren) {
        return 0
    }
    let count: number = 0
    routeChildren.forEach(i => {
        if(!i.meta.hidden) {
            count += 1
        }
    })
    return count
}
// 另一种写法，缺陷比较多，但有ts
// defineProps<{
//     routes: Array<RouteRecordRaw>
// }>()
</script>
<style lang="scss" scoped>
</style>