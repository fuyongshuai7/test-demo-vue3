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
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
