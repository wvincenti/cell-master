import { createRouter, createWebHistory } from 'vue-router'
import GridContainer from '@/components/gridview/GridContainer.vue'
import LoginContainer from '@/components/login/LoginContainer.vue'
import { useAuthStore } from '@/stores/userauth'
import RegisterContainer from '@/components/login/RegisterContainer.vue'

 

const routes = [
  {path: '/', component: GridContainer, meta: {requiresAuth: true}},
  {path: '/login', name: 'login', component: LoginContainer},
  {path: '/register', name: 'register', component: RegisterContainer}
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {

   const auth = useAuthStore();  
  console.log('AUTH')
  console.log(to);

  console.log(auth);
  console.log(auth.isAuthenticated);
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {name: 'login'}
  }
})

export default router
