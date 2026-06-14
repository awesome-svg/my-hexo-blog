// fireworks.js - 鼠标点击烟花特效
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff'];
        
        // 生成粒子
        const particleCount = 30; // 粒子数量
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.x, this.y, this.colors[Math.floor(Math.random() * this.colors.length)]));
        }
    }

    update() {
        this.particles.forEach((p, index) => {
            p.update();
            if (p.alpha <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        // 随机速度和角度
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 4 + 2;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015; // 消失速度
        this.gravity = 0.05; // 重力
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; // 应用重力
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 主逻辑
const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let fireworks = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 点击事件
document.addEventListener('click', (e) => {
    fireworks.push(new Firework(e.clientX, e.clientY));
});

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    // 清除画布，保留一点拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    // 如果背景不是黑色，建议改为 clearRect 以避免拖尾变色
    // ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    // 如果博客背景是白色/浅色，请使用下面这行代替上面的 fillStyle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((fw, index) => {
        fw.update();
        fw.draw(ctx);
        if (fw.particles.length === 0) {
            fireworks.splice(index, 1);
        }
    });
}
animate();
