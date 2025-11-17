<template>
    <div class="home-container">
        <!-- 粒子背景画布 -->
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>

        <!-- 渐变背景层 -->
        <div class="gradient-bg"></div>

        <!-- 顶部导航 -->
        <nav class="top-nav">
            <div class="nav-logo">
                <span class="logo-icon">🗺️</span>
                <span class="logo-text">校园地图</span>
            </div>
            <div class="nav-links">
                <a href="#" class="nav-link">关于</a>
                <a href="#" class="nav-link">功能</a>
                <a href="#" class="nav-link">帮助</a>
                <button class="nav-login-btn" @click="navigateTo('/login')">
                    <span>登录</span>
                    <span class="btn-glow"></span>
                </button>
            </div>
        </nav>

        <!-- 主内容区 -->
        <div class="content-wrapper">
            <!-- 标题区域 -->
            <div class="title-section">
                <h1 class="university-name">
                    <span class="title-char" v-for="(char, index) in titleChars" :key="index"
                        :style="{ animationDelay: `${index * 0.08}s` }">
                        {{ char }}
                    </span>
                </h1>

                <h2 class="main-title">
                    <span class="subtitle-char" v-for="(char, index) in subtitleChars" :key="index"
                        :style="{ animationDelay: `${0.8 + index * 0.06}s` }">
                        {{ char }}
                    </span>
                </h2>

                <p class="english-subtitle">UNIVIZPLATFORM</p>
                <div class="title-line"></div>

                <p class="platform-desc">
                    基于大数据与人工智能的新一代智慧校园可视化解决方案
                </p>
            </div>

            <!-- 功能介绍区域 -->
            <div class="features-section">
                <h3 class="section-title">
                    <span class="title-icon">✨</span>
                    核心功能
                    <span class="title-icon">✨</span>
                </h3>

                <div class="features-grid">
                    <div class="feature-card" v-for="(feature, index) in features" :key="index" :style="{
                        animationDelay: `${1.5 + index * 0.2}s`,
                        '--card-gradient': feature.gradient
                    }">
                        <div class="feature-icon-wrapper">
                            <div class="icon-glow"></div>
                            <div class="feature-icon">{{ feature.icon }}</div>
                        </div>
                        <h4 class="feature-title">{{ feature.title }}</h4>
                        <p class="feature-desc">{{ feature.desc }}</p>
                        <div class="feature-number">0{{ index + 1 }}</div>
                    </div>
                </div>
            </div>

        </div>

        <!-- 浮动装饰元素 -->
        <div class="floating-elements">
            <div class="float-circle" v-for="n in 5" :key="n" :style="getFloatStyle(n)"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const particleCanvas = ref(null)
const titleChars = '西南交通大学'.split('')
const subtitleChars = '校园可视化平台'.split('')

const features = [
    {
        icon: '🗺',
        title: '探索地图',
        desc: '3D 实景校园地图，实时位置与智能导航',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        icon: '📊',
        title: '数据可视化',
        desc: '校园热力图、人流量统计、实时数据分析',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        icon: '🎯',
        title: '智能服务',
        desc: '一键导航、场馆预约、失物招领等服务',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
]

let animationFrame = null
let particles = []

// 粒子系统
class Particle {
    constructor(canvas) {
        this.canvas = canvas
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.3
    }

    update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`
        ctx.fill()
    }
}

const initParticles = () => {
    const canvas = particleCanvas.value
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    particles = []

    // 创建粒子
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(canvas))
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 更新和绘制粒子
        particles.forEach(particle => {
            particle.update()
            particle.draw(ctx)
        })

        // 绘制连线
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x
                const dy = p1.y - p2.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 150) {
                    ctx.beginPath()
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - distance / 150)})`
                    ctx.lineWidth = 1
                    ctx.moveTo(p1.x, p1.y)
                    ctx.lineTo(p2.x, p2.y)
                    ctx.stroke()
                }
            })
        })

        animationFrame = requestAnimationFrame(animate)
    }

    animate()
}

const handleResize = () => {
    if (particleCanvas.value) {
        particleCanvas.value.width = window.innerWidth
        particleCanvas.value.height = window.innerHeight
    }
}

const handleCardHover = (index) => {
    // 可以添加额外的悬停效果
}

const handleCardLeave = (index) => {
    // 可以添加额外的离开效果
}

const navigateTo = (route) => {
    router.push(route)
}

const getFloatStyle = (n) => {
    return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${n * 0.5}s`,
        animationDuration: `${8 + n * 2}s`
    }
}

const getCardParticleStyle = (n) => {
    return {
        left: `${20 + n * 25}%`,
        animationDelay: `${n * 0.3}s`,
        animationDuration: `${2 + n * 0.5}s`
    }
}

onMounted(() => {
    initParticles()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame)
    }
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.home-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
}

.particle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.gradient-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    z-index: 2;
}

.content-wrapper {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    padding-top: 8rem;
}

/* 标题区域 */
.title-section {
    text-align: center;
    margin-bottom: 2.5rem;
}

.university-name {
    font-size: 2.2rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 1rem;
    letter-spacing: 0.1em;
}

.main-title {
    font-size: 3rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 0.8rem;
    letter-spacing: 0.3em;
}

.subtitle-char {
    display: inline-block;
    animation: titleFloat 1s ease-out forwards;
    opacity: 0;
    transform: translateY(30px);
}

.title-char {
    display: inline-block;
    animation: titleFloat 1s ease-out forwards;
    opacity: 0;
    transform: translateY(30px);
}

@keyframes titleFloat {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.english-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5em;
    margin-bottom: 2rem;
    animation: fadeInUp 1s ease-out 1.4s forwards;
    opacity: 0;
    font-weight: 300;
}

.title-line {
    width: 300px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    margin: 0 auto 1.2rem;
    animation: lineExpand 1s ease-out 1.2s forwards;
    transform: scaleX(0);
}

.platform-desc {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.8;
    animation: fadeInUp 1s ease-out 1.6s forwards;
    opacity: 0;
}

@keyframes fadeInUp {
    to {
        opacity: 1;
    }
}

@keyframes lineExpand {
    to {
        transform: scaleX(1);
    }
}

/* 功能介绍区域 */
.features-section {
    width: 100%;
    max-width: 1100px;
    margin-bottom: 2rem;
}

.section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-size: 1.4rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1.8rem;
    animation: fadeInUp 1s ease-out 1.8s forwards;
    opacity: 0;
}

.title-icon {
    font-size: 1.5rem;
    animation: iconTwinkle 2s ease-in-out infinite;
}

@keyframes iconTwinkle {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.6;
        transform: scale(1.2);
    }
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.feature-card {
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 2rem 1.5rem;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    animation: cardSlideUp 0.8s ease-out forwards;
    opacity: 0;
    transform: translateY(50px);
    overflow: hidden;
    text-align: center;
}

@keyframes cardSlideUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.feature-card:hover {
    transform: translateY(-10px);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 20px 60px rgba(99, 102, 241, 0.3);
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--card-gradient);
    opacity: 0;
    transition: opacity 0.5s;
}

.feature-card:hover::before {
    opacity: 1;
}

.feature-icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin-bottom: 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
}

.icon-glow {
    position: absolute;
    width: 120%;
    height: 120%;
    background: var(--card-gradient);
    border-radius: 16px;
    opacity: 0.15;
    filter: blur(25px);
    animation: iconGlowPulse 3s ease-in-out infinite;
}

@keyframes iconGlowPulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.15;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.25;
    }
}

.feature-icon {
    position: relative;
    font-size: 2.8rem;
    animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}

.feature-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 0.6rem;
}

.feature-desc {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
    margin-bottom: 1rem;
}

.feature-number {
    position: absolute;
    top: 1.2rem;
    right: 1.5rem;
    font-size: 2.5rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.03);
    transition: all 0.5s;
}

.feature-card:hover .feature-number {
    color: rgba(255, 255, 255, 0.08);
    transform: scale(1.15);
}



/* CTA 按钮区域 */
.cta-section {
    text-align: center;
    margin: 2rem 0 2rem;
    animation: fadeInUp 1s ease-out 2.2s forwards;
    opacity: 0;
}

.cta-button {
    position: relative;
    padding: 1.2rem 3rem;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1),
        0 8px 32px rgba(102, 126, 234, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.cta-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    background-size: 300% 100%;
    opacity: 0.3;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    animation: gradientSlide 8s ease infinite;
    filter: brightness(1.1);
}

@keyframes gradientSlide {

    0%,
    100% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }
}

.cta-button:hover .cta-bg {
    opacity: 0.95;
    filter: brightness(1.3);
    background-size: 200% 100%;
}

.cta-button:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2),
        0 20px 60px rgba(102, 126, 234, 0.6),
        0 0 100px rgba(102, 126, 234, 0.4),
        inset 0 2px 0 rgba(255, 255, 255, 0.2);
}

.cta-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    color: white;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5),
        0 4px 24px rgba(0, 0, 0, 0.4);
}

.cta-icon {
    font-size: 1.8rem;
    animation: rocketShake 2s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

@keyframes rocketShake {

    0%,
    100% {
        transform: rotate(0deg) translateY(0);
    }

    25% {
        transform: rotate(-5deg) translateY(-2px);
    }

    75% {
        transform: rotate(5deg) translateY(-2px);
    }
}

.cta-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.cta-main {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.cta-sub {
    font-size: 0.8rem;
    font-weight: 400;
    opacity: 0.8;
    letter-spacing: 0.1em;
}

.cta-arrow {
    font-size: 2rem;
    transition: all 0.3s;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
}

.cta-button:hover .cta-arrow {
    transform: translateX(10px) scale(1.2);
    animation: arrowBounce 1s ease-in-out infinite;
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.9));
}

@keyframes arrowBounce {

    0%,
    100% {
        transform: translateX(10px);
    }

    50% {
        transform: translateX(20px);
    }
}

.cta-ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.cta-button:active .cta-ripple {
    width: 300px;
    height: 300px;
}

.cta-hint {
    margin-top: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
}

.hint-icon {
    font-size: 1.2rem;
    animation: hintBlink 2s ease-in-out infinite;
}

@keyframes hintBlink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* 底部信息 */
.footer-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-top: 1.5rem;
    animation: fadeInUp 1s ease-out 2.4s forwards;
    opacity: 0;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
}

.info-icon {
    font-size: 1.2rem;
}

.divider {
    color: rgba(255, 255, 255, 0.3);
}

/* 浮动元素 */
.floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.float-circle {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.5), transparent);
    animation: float 10s infinite ease-in-out;
}

@keyframes float {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.3;
    }

    50% {
        transform: translate(50px, -50px) scale(1.5);
        opacity: 0.6;
    }
}

/* 顶部导航 */
.top-nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 4rem;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    animation: navSlideDown 0.8s ease-out;
}

@keyframes navSlideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
}

.logo-icon {
    font-size: 2rem;
    animation: logoSpin 10s linear infinite;
}

@keyframes logoSpin {

    0%,
    90% {
        transform: rotate(0deg);
    }

    95% {
        transform: rotate(360deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.logo-text {
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    position: relative;
    transition: color 0.3s;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s;
}

.nav-link:hover {
    color: white;
}

.nav-link:hover::after {
    width: 100%;
}

.nav-login-btn {
    position: relative;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 50px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s;
}

.nav-login-btn span {
    position: relative;
    z-index: 2;
}

.btn-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
}

.nav-login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
}

.nav-login-btn:hover .btn-glow {
    opacity: 1;
    animation: glowRotate 3s linear infinite;
}

/* 响应式 */
@media (max-width: 768px) {
    .top-nav {
        padding: 1.5rem 2rem;
    }

    .nav-links {
        gap: 1rem;
    }

    .nav-link {
        display: none;
    }

    .main-title {
        font-size: 2.5rem;
    }

    .cards-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 480px) {
    .top-nav {
        padding: 1rem;
    }

    .logo-text {
        font-size: 0.9rem;
    }

    .nav-login-btn {
        padding: 0.6rem 1.5rem;
        font-size: 0.9rem;
    }
}
</style>
