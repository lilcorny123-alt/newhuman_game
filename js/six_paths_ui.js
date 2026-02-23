getCurrentStoryLine() {
        return this.currentStoryLine;
    }
}

// 全局六道轮回UI实例
document.addEventListener('DOMContentLoaded', () => {
    window.sixPathsUI = new SixPathsUI();
});
