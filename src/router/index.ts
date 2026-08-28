import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: { name: 'consulta' } },
  {
    path: '/consulta',
    name: 'consulta',
    component: () => import('@/views/ConsultaView.vue'),
    meta: { title: 'Consulta', icon: 'mdi-magnify' },
  },
  {
    path: '/alta',
    name: 'alta',
    component: () => import('@/views/AltaView.vue'),
    meta: { title: 'Alta', icon: 'mdi-plus-box-outline' },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'consulta' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · Tarifas` : 'Tarifas'
})

export default router
