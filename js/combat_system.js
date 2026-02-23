// 优先级战斗系统
class CombatSystem {
    constructor() {
        this.isInCombat = false;
        this.playerActionPoints = 0;
        this.enemyActionPoints = 0;
        this.currentTurn = 'player'; // 'player' or 'enemy'
        this.combatLog = [];
        this.activeCombatants = {
            player: { name: '玩家', hp: 100, maxHp: 100, stats: { speed: 10, strength: 8 } },
            enemy: { name: '敵人', hp: 80, maxHp: 80, stats: { speed: 8, strength: 10 } }
        };
        
        this.init();
    }
    
    init() {
        // 绑定战斗UI事件
        this.bindCombatEvents();
    }
    
    bindCombatEvents() {
        // 战斗动作按钮
        const combatActions = document.querySelectorAll('.combat-action');
        combatActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.currentTarget.dataset.action;
                this.handlePlayerAction(actionType);
            });
        });
    }
    
    // 开始战斗
    startCombat(enemyData = null) {
        if (enemyData) {
            this.activeCombatants.enemy = { ...enemyData };
        }
        
        // 计算初始行动点
        this.calculateInitialActionPoints();
        
        this.isInCombat = true;
        this.showCombatUI();
        this.addToCombatLog('戰鬥開始！');
        
        // 决定谁先行动
        this.determineFirstTurn();
    }
    
    calculateInitialActionPoints() {
        // 基础行动点 = 速度属性
        this.playerActionPoints = this.activeCombatants.player.stats.speed;
        this.enemyActionPoints = this.activeCombatants.enemy.stats.speed;
        
        // 随机偷袭加成 (4-8点)
        const ambushBonus = Math.floor(Math.random() * 5) + 4;
        if (Math.random() > 0.5) {
            this.playerActionPoints += ambushBonus;
            this.addToCombatLog('玩家獲得偷襲加成 +' + ambushBonus + ' 行動點');
        } else {
            this.enemyActionPoints += ambushBonus;
            this.addToCombatLog('敵人獲得偷襲加成 +' + ambushBonus + ' 行動點');
        }
    }
    
    determineFirstTurn() {
        if (this.playerActionPoints >= this.enemyActionPoints) {
            this.currentTurn = 'player';
            this.addToCombatLog('玩家先行動！');
        } else {
            this.currentTurn = 'enemy';
            this.addToCombatLog('敵人先行動！');
            this.executeEnemyTurn();
        }
    }
    
    // 玩家选择行动
    handlePlayerAction(actionType) {
        if (!this.isInCombat || this.currentTurn !== 'player') {
            return;
        }
        
        let actionCost = 0;
        let actionResult = '';
        
        switch(actionType) {
            case 'attack':
                actionCost = 5;
                const damage = this.calculateDamage('player', 'enemy');
                this.activeCombatants.enemy.hp -= damage;
                actionResult = `攻擊造成 ${damage} 點傷害！`;
                break;
            case 'defend':
                actionCost = 3;
                // 防御增加下回合防御力
                this.activeCombatants.player.defenseBuff = (this.activeCombatants.player.defenseBuff || 0) + 20;
                actionResult = '進入防禦狀態，下回合防禦力提升！';
                break;
            case 'dna':
                // 使用DNA技能
                const dnaSkills = this.getAvailableDNASkills();
                if (dnaSkills.length > 0) {
                    actionCost = 8;
                    const randomSkill = dnaSkills[Math.floor(Math.random() * dnaSkills.length)];
                    actionResult = this.useDNASkill(randomSkill);
                } else {
                    actionResult = '沒有可用的DNA技能！';
                    actionCost = 0;
                }
                break;
            case 'item':
                actionCost = 2;
                actionResult = '使用物品（功能待開發）';
                break;
        }
        
        // 扣除行动点
        if (actionCost > 0) {this.playerActionPoints -= actionCost;
            this.addToCombatLog(`玩家使用 ${actionType}，消耗 ${actionCost} 行動點`);
            this.addToCombatLog(actionResult);
        }
        
        // 检查战斗结束
        if (this.checkCombatEnd()) {
            return;
        }
        
        // 切换回合
        this.switchTurn();
    }
    
    // 敌人AI行动
    executeEnemyTurn() {
        if (!this.isInCombat || this.currentTurn !== 'enemy') {
            return;
        }
        
        // 简单AI：70%攻击，20%防御，10%特殊
        const aiChoice = Math.random();
        let actionCost = 0;
        let actionResult = '';
        
        if (aiChoice < 0.7 || this.activeCombatants.enemy.hp < 30) {
            // 攻击
            actionCost = 5;
            const damage = this.calculateDamage('enemy', 'player');
            this.activeCombatants.player.hp -= damage;
            actionResult = `敵人攻擊造成 ${damage} 點傷害！`;
        } else if (aiChoice < 0.9) {
            // 防御
            actionCost = 3;
            this.activeCombatants.enemy.defenseBuff = (this.activeCombatants.enemy.defenseBuff || 0) + 15;
            actionResult = '敵人進入防禦狀態！';
        } else {
            // 特殊攻击
            actionCost = 7;
            const damage = this.calculateDamage('enemy', 'player') * 1.5;
            this.activeCombatants.player.hp -= damage;
            actionResult = `敵人使用特殊攻擊造成 ${Math.floor(damage)} 點傷害！`;
        }
        
        this.enemyActionPoints -= actionCost;
        this.addToCombatLog(`敵人行動，消耗 ${actionCost} 行動點`);
        this.addToCombatLog(actionResult);
        
        // 检查战斗结束
        if (this.checkCombatEnd()) {
            return;
        }
        
        // 切换回合
        this.switchTurn();
    }
    
    calculateDamage(attacker, defender) {
        const attackerStats = this.activeCombatants[attacker].stats;
        const defenderStats = this.activeCombatants[defender].stats;
        const baseDamage = attackerStats.strength + Math.floor(Math.random() * 6) + 1;
        
        // 应用防御buff
        let defenseReduction = 0;
        if (this.activeCombatants[defender].defenseBuff) {
            defenseReduction = this.activeCombatants[defender].defenseBuff;
            this.activeCombatants[defender].defenseBuff = Math.max(0, this.activeCombatants[defender].defenseBuff - 10);
        }
        
        // 应用DNA修饰符
        if (attacker === 'player') {
            const dnaModifiers = window.dnaSystem ? window.dnaSystem.getCombatModifiers() : {};
            if (dnaModifiers.attack) {
                return Math.max(1, baseDamage + dnaModifiers.attack - defenseReduction);
            }
        }
        
        return Math.max(1, baseDamage - defenseReduction);
    }
    
    getAvailableDNASkills() {
        const skills = [];
        if (window.dnaSystem) {
            if (window.dnaSystem.hasDNATag('屠龍者')) {
                skills.push('屠龍斬');
            }
            if (window.dnaSystem.hasDNATag('氣功師血統')) {
                skills.push('氣功波');
            }
            if (window.dnaSystem.hasDNATag('魔王威嚴')) {
                skills.push('威壓');
            }
        }
        return skills;
    }
    
    useDNASkill(skillName) {
        switch(skillName) {
            case '屠龍斬':
                const damage = this.calculateDamage('player', 'enemy') * 2;
                this.activeCombatants.enemy.hp -= damage;
                return `使用屠龍斬造成 ${Math.floor(damage)} 點傷害！`;
            case '氣功波':
                const aoeDamage = this.calculateDamage('player', 'enemy') * 1.5;
                this.activeCombatants.enemy.hp -= aoeDamage;
                return `發射氣功波造成 ${Math.floor(aoeDamage)} 點傷害！`;
            case '威壓':
                this.enemyActionPoints = Math.max(0, this.enemyActionPoints - 3);
                return '釋放威壓，敵人行動點減少3點！';
            default:
                return '未知的DNA技能';
        }
    }
    
    switchTurn() {
        // 检查是否还有行动点
        if (this.currentTurn === 'player') {if (this.playerActionPoints > 0 && this.playerActionPoints >= this.enemyActionPoints) {
                // 玩家继续行动
                this.currentTurn = 'player';
            } else {
                // 切换到敌人
                this.currentTurn = 'enemy';
                setTimeout(() => this.executeEnemyTurn(), 1000);
            }
        } else {
            if (this.enemyActionPoints > 0 && this.enemyActionPoints > this.playerActionPoints) {
                // 敌人继续行动
                this.currentTurn = 'enemy';
                setTimeout(() => this.executeEnemyTurn(), 1000);
            } else {
                // 切换到玩家
                this.currentTurn = 'player';
            }
        }
    }
    
    checkCombatEnd() {
        if (this.activeCombatants.player.hp <= 0) {
            this.endCombat(false);
            return true;
        }
        if (this.activeCombatants.enemy.hp <= 0) {
            this.endCombat(true);
            return true;
        }
        return false;
    }
    
    endCombat(playerWon) {
        this.isInCombat = false;
        this.hideCombatUI();
        
        if (playerWon) {
            this.addToCombatLog('戰鬥勝利！');
            // 添加胜利奖励DNA
            if (window.dnaSystem) {
                window.dnaSystem.addDNATag('戰鬥勝利者');
            }
        } else {
            this.addToCombatLog('戰鬥失敗...');
            // 游戏结束逻辑（账号重置）
            alert('你已死亡！六道輪迴重新開始...');
            this.resetGame();
        }
    }
    
    resetGame() {
        // 重置游戏状态
        if (window.dnaSystem) {
            window.dnaSystem.dnaTags = new Set(['新人類', '靈魂體']);
            window.dnaSystem.hiddenDNATags = new Set();
            window.dnaSystem.worldSpecificDNA = new Map();
            window.dnaSystem.updateDNADisplay();
        }
        
        // 重置生命值
        this.activeCombatants.player.hp = this.activeCombatants.player.maxHp;
        this.activeCombatants.enemy.hp = this.activeCombatants.enemy.maxHp;
        
        // 隐藏战斗界面
        this.hideCombatUI();
    }
    
    showCombatUI() {
        const combatUI = document.getElementById('combatUI');
        if (combatUI) {
            combatUI.style.display = 'block';
        }
    }
    
    hideCombatUI() {
        const combatUI = document.getElementById('combatUI');
        if (combatUI) {
            combatUI.style.display = 'none';
        }
    }
    
    addToCombatLog(message) {
        this.combatLog.push(message);
        console.log(message);
        // 可以在这里添加到UI显示
    }
    
    // 测试战斗
    testCombat() {
        this.startCombat({
            name: '測試敵人',
            hp: 50,
            maxHp: 50,
            stats: { speed: 6, strength: 5 }
        });
    }
}

// 全局战斗系统实例
document.addEventListener('DOMContentLoaded', () => {
    window.combatSystem = new CombatSystem();
    
    // 添加测试按钮（开发用）
    const testBtn = document.createElement('button');
    testBtn.textContent = '測試戰鬥';
    testBtn.style.position = 'absolute';
    testBtn.style.top = '10px';
    testBtn.style.right = '10px';
    testBtn.style.zIndex = '1000';
    testBtn.onclick = () => window.combatSystem.testCombat();
    document.body.appendChild(testBtn);
});
