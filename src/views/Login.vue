<template>
    <div class="login-container">
        <!-- 动态背景 -->
        <div class="animated-bg">
            <div class="bg-gradient"></div>
            <div class="bg-circles">
                <div class="circle" v-for="n in 6" :key="n" :class="`circle-${n}`"></div>
            </div>
        </div>

        <!-- 返回首页按钮 -->
        <router-link to="/" class="back-home">
            <span class="back-icon">←</span>
            <span class="back-text">返回首页</span>
        </router-link>

        <!-- 登录卡片 -->
        <div class="login-card">
            <!-- 玻璃态背景 -->
            <div class="glass-bg"></div>

            <!-- 装饰性光晕 -->
            <div class="card-glow"></div>

            <!-- 内容区域 -->
            <div class="card-content">
                <!-- 头部 -->
                <div class="login-header">
                    <div class="logo-section">
                        <div class="logo-icon">🗺️</div>
                        <div class="logo-shine"></div>
                    </div>
                    <div class="brand-section">
                        <h1 class="university-name">
                            <span class="name-char" v-for="(char, index) in universityChars" :key="index"
                                :style="{ animationDelay: `${index * 0.1}s` }">
                                {{ char }}
                            </span>
                        </h1>
                        <div class="brand-line"></div>
                        <h2 class="platform-name">校园可视化平台</h2>
                        <p class="platform-subtitle">Campus Visualization Platform</p>
                    </div>
                    <div class="welcome-section">
                        <p class="welcome-text">欢迎登录</p>
                    </div>
                </div>

                <!-- 表单 -->
                <form class="login-form" @submit.prevent="handleLogin">
                    <!-- 用户名输入 -->
                    <div class="form-group">
                        <label class="form-label">
                            <span class="label-icon">👤</span>
                            <span class="label-text">用户名</span>
                        </label>
                        <div class="input-wrapper">
                            <input v-model="formData.username" type="text" class="form-input" placeholder="请输入用户名"
                                required @focus="handleFocus('username')" @blur="handleBlur('username')" />
                            <div class="input-border" :class="{ active: focusField === 'username' }"></div>
                        </div>
                    </div>

                    <!-- 密码输入 -->
                    <div class="form-group">
                        <label class="form-label">
                            <span class="label-icon">🔒</span>
                            <span class="label-text">密码</span>
                        </label>
                        <div class="input-wrapper">
                            <input v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                                class="form-input" placeholder="请输入密码" required @focus="handleFocus('password')"
                                @blur="handleBlur('password')" />
                            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                            </button>
                            <div class="input-border" :class="{ active: focusField === 'password' }"></div>
                        </div>
                    </div>

                    <!-- 记住我 & 忘记密码 -->
                    <div class="form-options">
                        <label class="remember-label">
                            <input type="checkbox" v-model="formData.remember" class="remember-checkbox" />
                            <span class="checkbox-custom"></span>
                            <span class="remember-text">记住我</span>
                        </label>
                        <a href="#" class="forgot-password">忘记密码？</a>
                    </div>

                    <!-- 登录按钮 -->
                    <button type="submit" class="login-btn" :disabled="isLoading">
                        <span v-if="!isLoading" class="btn-content">
                            <span class="btn-text">立即登录</span>
                            <span class="btn-icon">→</span>
                        </span>
                        <span v-else class="btn-loading">
                            <span class="spinner"></span>
                            <span>登录中...</span>
                        </span>
                    </button>

                    <!-- 分隔线 -->
                    <div class="divider">
                        <span class="divider-line"></span>
                        <span class="divider-text">或</span>
                        <span class="divider-line"></span>
                    </div>

                    <!-- 其他登录方式 -->
                    <div class="social-login">
                        <button type="button" class="social-btn" @click="handleSocialLogin('wechat')">
                            <span class="social-icon">💬</span>
                        </button>
                        <button type="button" class="social-btn" @click="handleSocialLogin('qq')">
                            <span class="social-icon">🐧</span>
                        </button>
                        <button type="button" class="social-btn" @click="handleSocialLogin('github')">
                            <span class="social-icon">🐙</span>
                        </button>
                    </div>
                </form>

                <!-- 底部 -->
                <div class="login-footer">
                    <span class="footer-text">还没有账号？</span>
                    <a href="#" class="register-link">立即注册</a>
                </div>
            </div>
        </div>

        <!-- 装饰性浮动元素 -->
        <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const universityChars = '西南交通大学'.split('')

const formData = reactive({
    username: '',
    password: '',
    remember: false
})

const focusField = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const handleFocus = (field) => {
    focusField.value = field
}

const handleBlur = (field) => {
    focusField.value = ''
}

const handleLogin = async () => {
    // 简单验证
    if (!formData.username || !formData.password) {
        alert('请输入用户名和密码')
        return
    }

    isLoading.value = true

    // 模拟登录请求
    setTimeout(() => {
        // 存储登录状态
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('username', formData.username)

        // 跳转到地图页面或重定向页面
        const redirect = route.query.redirect || '/map'
        router.push(redirect)

        isLoading.value = false
    }, 1500)
}

const handleSocialLogin = (platform) => {
    alert(`${platform} 登录功能开发中...`)
}
</script>

<style scoped>
.login-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 动态背景 */
.animated-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg,
            #667eea 0%,
            #764ba2 25%,
            #f093fb 50%,
            #4facfe 75%,
            #00f2fe 100%);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.bg-circles {
    position: absolute;
    width: 100%;
    height: 100%;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    animation: float 20s infinite ease-in-out;
}

.circle-1 {
    width: 300px;
    height: 300px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.circle-2 {
    width: 200px;
    height: 200px;
    top: 60%;
    left: 70%;
    animation-delay: 2s;
}

.circle-3 {
    width: 150px;
    height: 150px;
    top: 20%;
    right: 20%;
    animation-delay: 4s;
}

.circle-4 {
    width: 250px;
    height: 250px;
    bottom: 10%;
    left: 50%;
    animation-delay: 6s;
}

.circle-5 {
    width: 180px;
    height: 180px;
    top: 50%;
    left: 20%;
    animation-delay: 8s;
}

.circle-6 {
    width: 220px;
    height: 220px;
    bottom: 20%;
    right: 15%;
    animation-delay: 10s;
}

@keyframes float {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    33% {
        transform: translate(30px, -30px) scale(1.1);
    }

    66% {
        transform: translate(-20px, 20px) scale(0.9);
    }
}

/* 返回首页按钮 */
.back-home {
    position: absolute;
    top: 2rem;
    left: 2rem;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    color: white;
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.3s;
}

.back-home:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-5px);
}

.back-icon {
    font-size: 1.2rem;
}

/* 登录卡片 */
.login-card {
    position: relative;
    z-index: 5;
    width: 90%;
    height: 90vh;
    max-width: 450px;
    padding: 2.5rem 3rem 3rem;
    animation: cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardSlideIn {
    from {
        opacity: 0;
        transform: translateY(50px) scale(0.9);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.glass-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
    animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {

    0%,
    100% {
        opacity: 0.5;
        transform: scale(1);
    }

    50% {
        opacity: 0.8;
        transform: scale(1.1);
    }
}

.card-content {
    position: relative;
    z-index: 2;
}

/* 头部 */
.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.logo-section {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
}

.logo-icon {
    font-size: 3rem;
    position: relative;
    z-index: 2;
    animation: iconFloat 3s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
}

.logo-shine {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: shinePulse 3s ease-in-out infinite;
}

@keyframes iconFloat {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-10px) rotate(5deg);
    }
}

@keyframes shinePulse {

    0%,
    100% {
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(1);
    }

    50% {
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(1.2);
    }
}

.brand-section {
    margin-bottom: 1.5rem;
}

.university-name {
    font-size: 1.6rem;
    font-weight: 300;
    color: white;
    margin-bottom: 0.6rem;
    letter-spacing: 0.15em;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.name-char {
    display: inline-block;
    animation: charFadeIn 0.8s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

@keyframes charFadeIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.brand-line {
    width: 150px;
    height: 2px;
    margin: 0 auto 0.8rem;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    animation: lineExpand 1.2s ease-out 0.6s forwards;
    transform: scaleX(0);
}

@keyframes lineExpand {
    to {
        transform: scaleX(1);
    }
}

.platform-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 0.4rem;
    letter-spacing: 0.2em;
    animation: fadeInUp 0.8s ease-out 0.8s forwards;
    opacity: 0;
}

.platform-subtitle {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 300;
    animation: fadeInUp 0.8s ease-out 1s forwards;
    opacity: 0;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.welcome-section {
    padding-top: 0.8rem;
    margin-top: 0.8rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    animation: fadeInUp 0.8s ease-out 1.2s forwards;
    opacity: 0;
}

.welcome-text {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 300;
    letter-spacing: 0.05em;
}

/* 表单 */
.login-form {
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}

.label-icon {
    font-size: 1.1rem;
}

.input-wrapper {
    position: relative;
}

.form-input {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.form-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
}

.input-border {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s;
    border-radius: 2px;
}

.input-border.active {
    transform: scaleX(1);
}

.password-toggle {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.7;
    transition: opacity 0.3s;
}

.password-toggle:hover {
    opacity: 1;
}

/* 选项 */
.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.remember-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
}

.remember-checkbox {
    display: none;
}

.checkbox-custom {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    transition: all 0.3s;
}

.remember-checkbox:checked+.checkbox-custom {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: #667eea;
}

.remember-checkbox:checked+.checkbox-custom::after {
    content: '✓';
    display: block;
    color: white;
    text-align: center;
    line-height: 14px;
    font-size: 12px;
}

.forgot-password {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s;
}

.forgot-password:hover {
    color: white;
}

/* 登录按钮 */
.login-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

.login-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
}

.login-btn:hover::before {
    left: 100%;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
}

.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 分隔线 */
.divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
}

.divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
}

.divider-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
}

/* 社交登录 */
.social-login {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.social-btn {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1.5rem;
}

.social-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-3px);
}

/* 底部 */
.login-footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

.register-link {
    color: white;
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.5rem;
    transition: opacity 0.3s;
}

.register-link:hover {
    opacity: 0.8;
}

/* 浮动形状 */
.floating-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
}

.shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    animation: shapeFloat 15s infinite ease-in-out;
}

.shape-1 {
    width: 100px;
    height: 100px;
    top: 20%;
    left: 10%;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    animation-delay: 0s;
}

.shape-2 {
    width: 80px;
    height: 80px;
    top: 70%;
    right: 15%;
    border-radius: 50%;
    animation-delay: 5s;
}

.shape-3 {
    width: 120px;
    height: 120px;
    bottom: 15%;
    left: 20%;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    animation-delay: 10s;
}

@keyframes shapeFloat {

    0%,
    100% {
        transform: translate(0, 0) rotate(0deg);
    }

    33% {
        transform: translate(50px, -30px) rotate(120deg);
    }

    66% {
        transform: translate(-30px, 50px) rotate(240deg);
    }
}

/* 响应式 */
@media (max-width: 768px) {
    .login-card {
        padding: 2rem;
    }

    .back-home {
        top: 1rem;
        left: 1rem;
    }
}
</style>
