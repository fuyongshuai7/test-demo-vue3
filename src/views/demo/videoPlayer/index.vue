<template>
    <div class="video-player">
        <video ref="videoRef"></video>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { Player } from './player'

const videoRef = ref<HTMLVideoElement>()
let palyerInstance: Player

onMounted(() => {
    if (videoRef.value) {
        palyerInstance = new Player(videoRef.value, { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' })
    }
})
</script>
<style lang="scss" scoped></style>