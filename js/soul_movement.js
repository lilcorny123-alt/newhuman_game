// 灵魂体移动系统 - 白猫式操作
class SoulMovement {
    constructor() {
        this.soulElement = document.getElementById('soulCharacter');
        this.gameContainer = document.querySelector('.game-container');
        this.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.isDragging = false;
        this.touchStart = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.lastMoveTime = 0;
        
        this.init();
    }
    
    init() {
        // 触摸事件
        this.gameContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        this.gameContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
        this.gameContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
        
        // 鼠标事件（桌面兼容）
        this.gameContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
        this.gameContainer.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
        this.gameContainer.addEventListener('mouseup', (e) => this.handleMouseUp(e), false);
        
        // 窗口调整
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStart.x = touch.clientX;
        this.touchStart.y = touch.clientY;
        this.isDragging = true;
        this.lastMoveTime = Date.now();
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStart.x;
        const deltaY = touch.clientY - this.touchStart.y;
        
        // 更新位置
        this.position.x += deltaX;
        this.position.y += deltaY;
        
        // 边界限制
        this.constrainPosition();
        
        // 更新视觉位置
        this.updateVisualPosition();
        
        // 更新触摸起点
        this.touchStart.x = touch.clientX;
        this.touchStart.y = touch.clientY;
        
        // 计算速度
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastMoveTime;
        if (deltaTime > 0) {
            this.velocity.x = deltaX / deltaTime * 16; // 60fps equivalent
            this.velocity.y = deltaY / deltaTime * 16;
        }
        this.lastMoveTime = currentTime;
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.isDragging = false;
        
        // 添加轻微的惯性效果
        this.applyInertia();
    }
    
    // 鼠标事件处理（桌面兼容）
    handleMouseDown(e) {
        this.touchStart.x = e.clientX;
        this.touchStart.y = e.clientY;
        this.isDragging = true;
        this.lastMoveTime = Date.now();
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.touchStart.x;
        const deltaY = e.clientY - this.touchStart.y;
        
        this.position.x += deltaX;
        this.position.y += deltaY;
        this.constrainPosition();
        this.updateVisualPosition();
        
        this.touchStart.x = e.clientX;
        this.touchStart.y = e.clientY;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastMoveTime;
        if (deltaTime > 0) {
            this.velocity.x = deltaX / deltaTime * 16;
            this.velocity.y = deltaY / deltaTime * 16;
        }
        this.lastMoveTime = currentTime;
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.applyInertia();
    }
    
    constrainPosition() {
        const containerRect = this.gameContainer.getBoundingClientRect();
        const soulSize = 60; // 灵魂体大小
        
        this.position.x = Math.max(soulSize/2, Math.min(containerRect.width - soulSize/2, this.position.x));
this.position.y = Math.max(soulSize/2, Math.min(containerRect.height - soulSize/2, this.position.y));
    }
    
    updateVisualPosition() {
        if (this.soulElement) {
            this.soulElement.style.left = this.position.x + 'px';
            this.soulElement.style.top = this.position.y + 'px';
        }
    }
    
    applyInertia() {
        // 简单的惯性效果
        let inertiaSteps = 10;
        const decay = 0.8;
        
        const animateInertia = () => {
            if (inertiaSteps > 0 && (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1)) {
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                this.constrainPosition();
                this.updateVisualPosition();
                
                this.velocity.x *= decay;
                this.velocity.y *= decay;
                inertiaSteps--;
                
                requestAnimationFrame(animateInertia);
            }
        };
        
        if (inertiaSteps > 0) {
            requestAnimationFrame(animateInertia);
        }
    }
    
    handleResize() {
        // 重新约束位置以适应新窗口大小
        this.constrainPosition();
        this.updateVisualPosition();
    }
    
    // 获取当前位置
    getPosition() {
        return { ...this.position };
    }
    
    // 设置位置
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.constrainPosition();
        this.updateVisualPosition();
    }
}

// 初始化灵魂体移动系统
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('soulCharacter')) {
        window.soulMovement = new SoulMovement();
    }
});
