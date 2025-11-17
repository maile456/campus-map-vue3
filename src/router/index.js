import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const MapView = () => import('../views/MapView.vue')

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            title: '校园地图可视化平台',
            transition: 'fade-slide'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            title: '登录',
            transition: 'fade-scale'
        }
    },
    {
        path: '/map',
        name: 'MapView',
        component: MapView,
        meta: {
            title: '校园地图',
            transition: 'slide-left',
            requiresAuth: true
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title || '校园地图可视化平台'

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (!isLoggedIn) {
            next({ name: 'Login', query: { redirect: to.fullPath } })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
