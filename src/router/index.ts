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
          title: '首页'      
        },
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
