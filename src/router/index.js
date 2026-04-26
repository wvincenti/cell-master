import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/components/routerviews/MainView.vue'
import LoginContainer from '@/components/login/LoginContainer.vue'
import { useAuthStore } from '@/stores/userauth'
import RegisterContainer from '@/components/login/RegisterContainer.vue'
import AccountSettingsView from '@/components/routerviews/AccountSettingsView.vue'

const routes = [
  { path: '/', name: 'main', component: MainView, meta: { requiresAuth: true } },
  { path: '/Settings', name: 'settings', component: AccountSettingsView, meta: { requiresAuth: true } },
  { path: '/Login', name: 'login', component: LoginContainer, meta: { requiresAuth: false } },
  {
    path: '/Register',
    name: 'register',
    component: RegisterContainer,
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  console.log('running before each')
  const auth = useAuthStore()
  console.log('AUTH')
  console.log(to)

  console.log(auth)
  console.log(auth.isAuthenticated)
  console.log(auth.isInitialized)

  // await checkAuth(to.meta.requiresAuth, auth)
  if (!auth.isInitialized) {
    await waitForInit(auth);
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
})

async function checkAuth(reqAuth, auth) {
  console.log('CHECKING AUTH!')
  console.log(auth.isAuthenticated)
  console.log(auth.isInitialized)
  if (!auth.isInitialized) {
    return setTimeout(() => {
      return checkAuth(reqAuth, auth)
    }, 1000)
  } else if (reqAuth && auth.isInitialized && !auth.isAuthenticated) {
    // await auth.initSession();
    return { name: 'login' }
  }
}

function waitForInit(auth) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (auth.isInitialized) {
        clearInterval(interval)
        resolve()
      }
    }, 100) // Check every 100ms instead of waiting a full second
  })
}

export default router
