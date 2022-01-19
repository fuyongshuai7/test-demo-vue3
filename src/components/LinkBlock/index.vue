<template>
  <div class="link-block">
      <template v-for="(item, index) in props.data" :key="index">
          <br v-if="index !== 0">
          <a :href="item.href" target="_blank">{{ item.label }}</a>
      </template>
  </div>
</template>

<script setup lang="ts">
import { PropType, defineProps } from "vue"

export type DataType = {
    href: string,
    label: string
}
const props = defineProps({
    data: {
        type: Array as PropType<Array<DataType>>,
        require: true,
        default: () => []
    }
})

</script>
<style lang="scss" scoped>
.link-block {
  padding: 20px 0;
}
</style>