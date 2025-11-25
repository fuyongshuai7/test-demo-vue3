import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Layout from '@/layout/layout.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    redirect: "/home",
    component: Layout,
    meta: {
      title: '首页'
    },
    children: [
      {
        path: 'home',
        component: () => import("@/views/home/home.vue"),
        meta: {
          title: '首页',
          hidden: true
        },
      },
      {
        path: 'test',
        component: () => import("@/views/test/index.vue"),
        meta: {
          title: "测试页",
          hidden: true
        }
      }
    ]
  },
  {
    path: "/demo",
    name: "Demo",
    redirect: "/demo/xlsx",
    component: Layout,
    meta: {
      title: 'demo'
    },
    children: [
      {
        path: 'xlsx',
        component: () => import("@/views/demo/xlsx/index.vue"),
        meta: {
          title: 'xlsx导出'
        },
      },
      {
        path: 'bpmn',
        component: () => import("@/views/demo/bpmn/index.vue"),
        meta: {
          title: 'bpmn'
        },
      },
      {
        path: 'greedy-snake',
        component: () => import("@/views/demo/greedySnake/index.vue"),
        meta: {
          title: "greedy-snake"
        }
      },
      {
        path: 'video-player',
        component: () => import("@/views/demo/videoPlayer/index.vue"),
        meta: {
          title: "video-player"
        }
      },
      {
        path: 'drag-and-zoom',
        component: () => import("@/views/demo/dragAndZoom/index.vue"),
        meta: {
          title: "drag-and-zoom"
        }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
