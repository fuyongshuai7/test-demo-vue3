<template>
  <div class="food-item" :style="{ top: top + 'px', left: left + 'px' }">
    <div class="rect"></div>
    <div class="rect"></div>
    <div class="rect"></div>
    <div class="rect"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, defineExpose } from "vue"
import { PosType } from '../types';

let top: Ref<number> = ref(0)
let left: Ref<number> = ref(0)

function getFoodPos(): PosType {
  return { yPos: top.value, xPos: left.value }
}

function setFoodPos(spaceHeight: number, spaceWidth: number, snake: PosType[]) {
  const x: number = getRandomByRange(0, spaceWidth / 10) * 10
  const y: number = getRandomByRange(0, spaceHeight / 10 - 1) * 10
  let isIdentical: boolean = false
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].xPos === x && snake[i].yPos === y) {
      isIdentical = true
      break;
    }
  }

  if (isIdentical) {
    setFoodPos(spaceHeight, spaceWidth, snake)
  } else {
    top.value = y
    left.value = x
  }
}

function getRandomByRange(lowerValue: number, upperValue: number): number {
  let choices = upperValue - lowerValue + 1;
  return Math.floor(Math.random() * choices + lowerValue);
}

defineExpose({
  getFoodPos,
  setFoodPos,
  getRandomByRange
})

</script>
<style lang="scss" scoped>
.food-item {
  position: absolute;
  width: 10px;
  height: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .rect {
    height: 5px;
    width: 5px;
    background-color: #000;
    transform: rotate(45deg);
  }
}
</style>