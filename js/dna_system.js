// DNA系统 - 隐性标签管理系统
class DNASystem {
    constructor() {
        this.dnaTags = new Set(['新人類', '靈魂體']);
        this.hiddenDNATags = new Set();
        this.worldSpecificDNA = new Map(); // Map<worldId, Set<DNA>>
        this.combatModifiers = new Map(); // Map<dnaTag, modifier>
        this.dnaHistory = []; // 记录DNA变化历史
        
        this.init();
    }
    
    init() {
        // 初始化一些基础DNA效果
        this.setupBaseModifiers();
        this.updateDNADisplay();
    }
    
    setupBaseModifiers() {
        // 基础DNA战斗加成
        this.combatModifiers.set('屠龍者', { attack: 20, defense: 10 });
        this.combatModifiers.set('魔王威嚴', { intimidate: true, defense: 15 });
        this.combatModifiers.set('氣功師血統', { specialAttack: true, energy: 25 });
        this.combatModifiers.set('六道輪迴者', { hpRegen: 5, luck: 10 });
    }
    
    // 添加DNA标签
    addDNATag(tag, isHidden = false, worldId = null) {
        if (isHidden) {
            this.hiddenDNATags.add(tag);
        } else if (worldId) {
            if (!this.worldSpecificDNA.has(worldId)) {
                this.worldSpecificDNA.set(worldId, new Set());
            }
            this.worldSpecificDNA.get(worldId).add(tag);
        } else {
            this.dnaTags.add(tag);
        }
        
        // 记录到历史
        this.dnaHistory.push({
            action: 'add',
            tag: tag,
            isHidden: isHidden,
            worldId: worldId,
            timestamp: new Date().toISOString()
        });
        
        this.updateDNADisplay();
        console.log(`DNA已添加: ${tag}`);
    }
    
    // 移除DNA标签
    removeDNATag(tag, isHidden = false, worldId = null) {
        if (isHidden) {
            this.hiddenDNATags.delete(tag);
        } else if (worldId) {
            if (this.worldSpecificDNA.has(worldId)) {
                this.worldSpecificDNA.get(worldId).delete(tag);
            }
        } else {
            this.dnaTags.delete(tag);
        }
        
        this.dnaHistory.push({
            action: 'remove',
            tag: tag,
            isHidden: isHidden,
            worldId: worldId,
            timestamp: new Date().toISOString()
        });
        
        this.updateDNADisplay();
        console.log(`DNA已移除: ${tag}`);
    }
    
    // 检查是否拥有特定DNA
    hasDNATag(tag, worldId = null) {
        // 检查普通DNA
        if (this.dnaTags.has(tag)) return true;
        
        // 检查隐性DNA
        if (this.hiddenDNATags.has(tag)) return true;
        
        // 检查世界特定DNA
        if (worldId && this.worldSpecificDNA.has(worldId)) {
            return this.worldSpecificDNA.get(worldId).has(tag);
        }
        
        return false;
    }
    
    // 获取所有可见DNA标签
    getAllVisibleDNATags() {
        return Array.from(this.dnaTags);
    }
    
    // 获取战斗修饰符
    getCombatModifiers() {
        const modifiers = {};
        
        // 应用所有DNA的战斗修饰符
        this.dnaTags.forEach(tag => {
            if (this.combatModifiers.has(tag)) {
                const mod = this.combatModifiers.get(tag);
                Object.keys(mod).forEach(key => {
                    modifiers[key] = (modifiers[key] || 0) + mod[key];
                });
            }
        });
        
        return modifiers;
    }
    
    // 检查DNA触发条件
    checkDNATriggers(worldId, eventContext) {
        const triggers = [];
        
        // 示例触发逻辑
        if (worldId === '西幻勇者魔王' && eventContext === '石中劍') {
            if (this.hasDNATag('屠龍者')) {
                triggers.push('可以直接拔出石中劍');
            }
        }
        
        if (worldId === '邪界' && this.hasDNATag('魔王威嚴')) {
            triggers.push('對鬼魂有威懾力');
            triggers.push('可能喚醒隱藏BOSS');
        }
        
        return triggers;
    }
    
    // 更新DNA显示
    updateDNADisplay() {
        const dnaDisplay = document.getElementById('dnaTags');
        if (dnaDisplay) {dnaDisplay.innerHTML = '';
            this.getAllVisibleDNATags().forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'dna-tag';
                tagElement.textContent = tag;
                dnaDisplay.appendChild(tagElement);
            });
        }
    }
    
    // 保存DNA状态到本地存储
    saveToLocalStorage() {
        const state = {
            dnaTags: Array.from(this.dnaTags),
            hiddenDNATags: Array.from(this.hiddenDNATags),
            worldSpecificDNA: Object.fromEntries(
                Array.from(this.worldSpecificDNA.entries()).map(([k, v]) => [k, Array.from(v)])
            ),
            dnaHistory: this.dnaHistory
        };
        localStorage.setItem('newhuman_dna_state', JSON.stringify(state));
    }
    
    // 从本地存储加载DNA状态
    loadFromLocalStorage() {
        const savedState = localStorage.getItem('newhuman_dna_state');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.dnaTags = new Set(state.dnaTags || ['新人類', '靈魂體']);
                this.hiddenDNATags = new Set(state.hiddenDNATags || []);
                this.worldSpecificDNA = new Map(
                    Object.entries(state.worldSpecificDNA || {}).map(([k, v]) => [k, new Set(v)])
                );
                this.dnaHistory = state.dnaHistory || [];
                this.updateDNADisplay();
                console.log('DNA状态已从本地存储加载');
            } catch (e) {
                console.error('加载DNA状态失败:', e);
            }
        }
    }
}

// 全局DNA系统实例
document.addEventListener('DOMContentLoaded', () => {
    window.dnaSystem = new DNASystem();
    // 尝试从本地存储加载
    window.dnaSystem.loadFromLocalStorage();
    
    // 页面卸载时保存状态
    window.addEventListener('beforeunload', () => {
        window.dnaSystem.saveToLocalStorage();
    });
});
