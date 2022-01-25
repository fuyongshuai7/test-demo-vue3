<template>
  <div class="greedy-snake">
    <div class="panel">
      <div ref="gameSpaceRef" class="game-space">
        <Snake ref="snakeRef" />
        <Food ref="foodRef" />
      </div>
      <div class="info">
        <span class="score">score：{{ score }}</span>
        <span class="level">level：{{ level }}</span>
      </div>
    </div>
    <div class="game-over-panel" v-if="isGameOver">
      <el-button class="btn" @click="restart()">Restart</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, computed, ComputedRef } from "vue"
import { PosType, ArrowCode } from './types';
import Food from './components/FoodItem.vue';
import Snake from './components/SnakeItem.vue';

const levelUpNeed: number = 1 // 等级提升需要多少分数
let score: Ref<number> = ref(0) // 分数
const lowerSpeed: number = 300 // 最低速度
const fastSpeed: number = 50 // 最快速度
const speedStep: number = 290 // 一级level提示的速度
const level: ComputedRef<number> = computed((): number => Math.floor(score.value / levelUpNeed) + 1) // 等级

// set directionList start ===============
const directionList: Set<string> = new Set()
Object.values(ArrowCode).forEach((code: string) => {
  directionList.add(code)
})
// set directionList end ==================

let direction: ArrowCode | "" = ""
let isGameOver: Ref<boolean> = ref(false)

const foodRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>() // 食物ref
const snakeRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>() // 蛇ref
const gameSpaceRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>() //游戏空间ref

onMounted(() => {
  init()
})

function init() {
  const snake: HTMLDivElement | undefined = snakeRef.value
  const food: HTMLDivElement | undefined = foodRef.value

  const spaceHeight: number | undefined = gameSpaceRef.value?.clientHeight;
  const spaceWidth: number | undefined = gameSpaceRef.value?.clientWidth;

  // set food position
  (food as any).setFoodPos(spaceHeight, spaceWidth, (snake as any).getSnake())

  // listen to keydown
  document.addEventListener("keydown", snakeMoveDirection)

  // loop hanlder
  // eslint-disable-next-line no-undef
  const handler: TimerHandler = (): void => {
    if ((snake as any).setBodyPos && !isGameOver.value) {
      (snake as any).setBodyPos(direction)
      checkCrash(spaceHeight as number, spaceWidth as number, (snake as any).getSnake())
    }

    const snakeHead = (snake as any).getSnake()[0]
    if (theEatFood(snakeHead, (food as any).getFoodPos())) {
      // 1.snake add body
      if ((snake as any).addBody) { // 不知道啥原因，如果不加这个if 就会报addBody is not a funtion. 可能ts转js后有问题？？？
        (snake as any).addBody()
      }
      // 2.set food pos
      (food as any).setFoodPos(spaceHeight, spaceWidth, (snake as any).getSnake())
      // 3. add score
      score.value += 1
    }

    let timeInterval = lowerSpeed - speedStep * level.value
    if (timeInterval < fastSpeed) {
      timeInterval = fastSpeed
    }
    setTimeout(handler, timeInterval)
  }
  handler()
}

// 吃到食物
function theEatFood(snakeHead: PosType, food: PosType): boolean {
  return snakeHead.xPos === food.xPos && snakeHead.yPos === food.yPos
}

// 移动
function snakeMoveDirection(e: KeyboardEvent): void {
  if (directionList.has(e.code) && ((snakeRef.value as any).getSnake().length === 1 || checkDirection(e.code as ArrowCode))) {
    direction = ArrowCode[e.code as ArrowCode]
  }
}

// 检查方向
function checkDirection(newDirection: ArrowCode): boolean {
  switch (direction) {
    case ArrowCode.ArrowUp:
      if (newDirection === ArrowCode.ArrowDown) {
        return false
      }
      break;
    case ArrowCode.ArrowDown:
      if (newDirection === ArrowCode.ArrowUp) {
        return false
      }
      break;
    case ArrowCode.ArrowLeft:
      if (newDirection === ArrowCode.ArrowRight) {
        return false
      }
      break;
    case ArrowCode.ArrowRight:
      if (newDirection === ArrowCode.ArrowLeft) {
        return false
      }
      break;
  }
  return true
}

// 撞墙
function checkCrash(spaceHeight: number, spaceWidth: number, snake: PosType[]): void {
  const head: PosType = snake[0]
  // crash wall
  if (head.xPos < 0 || head.xPos > spaceWidth - 10 || head.yPos < 0 || head.yPos > spaceHeight - 10) {
    gameOver()
  }

  // crash body
  if (snake.length > 4) {
    snake.forEach((i: PosType, index: number) => {
      if (index > 3) {
        if (i.xPos === head.xPos && i.yPos === head.yPos) {
          gameOver()
        }
      }
    })
  }
}

// game over
function gameOver(): void {
  console.log("Game Over!")
  isGameOver.value = true
}

// restart
function restart(): void {
  score.value = 0;
  // reset snake position
  if ((snakeRef.value as any).resetPos) {
    (snakeRef.value as any).resetPos()
  }

  // reset food position
  const spaceHeight: number | undefined = gameSpaceRef.value?.clientHeight;
  const spaceWidth: number | undefined = gameSpaceRef.value?.clientWidth;
  (foodRef.value as any).setFoodPos(spaceHeight, spaceWidth, (snakeRef.value as any).getSnake())

  // resset direction
  direction = ""

  // restart
  isGameOver.value = false
  console.log('restart!');
}

</script>
<style lang="scss" scoped>
.greedy-snake {
  $panelPadding: 20px;
  $gameSpaceSize: 500px;
  display: inline-block;
  position: relative;
  .panel {
    padding: $panelPadding;
    margin: auto;
    border: 5px solid #000;
    border-radius: 5px;
    .game-space {
      width: $gameSpaceSize;
      height: $gameSpaceSize;
      border: 1px solid #000;
      position: relative;
    }
    .info {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }
  .game-over-panel {
    position: absolute;
    background-color: red;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background-color: rgba(221,221,221, 0.8);
    .btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>