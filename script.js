document.addEventListener('DOMContentLoaded', () => {
    // --- A. 取得所有需要操作的 HTML 元素 ---
    const profileSection = document.getElementById('profile-section');
    const mainAppSection = document.getElementById('main-app');
    const profileForm = document.getElementById('profile-form');
    const tdeeDisplayEl = document.getElementById('tdee-display');
    const mealButtons = document.querySelectorAll('.food-selector button');
    const exerciseBtn = document.getElementById('add-exercise-btn');
    const logLists = {
        breakfast: document.getElementById('breakfast-log'),
        lunch: document.getElementById('lunch-log'),
        dinner: document.getElementById('dinner-log'),
        exercise: document.getElementById('exercise-log-list')
    };
    const summary = {
        totalCalories: document.getElementById('total-calories'),
        totalProtein: document.getElementById('total-protein'),
        balanceCalories: document.getElementById('balance-calories')
    };
    const feedbackTextEl = document.getElementById('feedback-text');

    // --- B. 資料庫與狀態管理 ---
    let foodDatabase = []; // 預設為空陣列，將從 food.json 載入
    let userProfile = {};
    let todayLog = { breakfast: [], lunch: [], dinner: [], exercise: [] };

    // --- C. 核心功能函式 ---

    // 取得今天的日期字串，作為 localStorage 的 key
    function getTodayKey() {
        const today = new Date();
        // 格式化成 YYYY-MM-DD，確保月份和日期是兩位數
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `log_${today.getFullYear()}-${month}-${day}`;
    }

    // 非同步載入食物資料庫
    async function loadFoodDatabase() {
        try {
            const response = await fetch('food.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            foodDatabase = await response.json();
        } catch (error) {
            console.error('無法從 food.json 載入資料庫:', error);
            // 如果載入失敗，使用內建的簡易版作為備用
            foodDatabase = [
                { name: '白飯', calories: 280, protein: 5 },
                { name: '雞胸肉', calories: 180, protein: 35 },
                { name: '炒青菜', calories: 150, protein: 3 }
            ];
        }
    }

    function loadData() {
        userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;
        const savedLog = JSON.parse(localStorage.getItem(getTodayKey()));
        if (savedLog) {
            todayLog = savedLog;
        } else {
            todayLog = { breakfast: [], lunch: [], dinner: [], exercise: [] };
        }
    }

    function saveData() {
        localStorage.setItem(getTodayKey(), JSON.stringify(todayLog));
    }

    function generateFeedback(totals) {
        const { totalCalories, totalProtein, burnedCalories } = totals;
        const tdee = userProfile.tdee;
        const deficit = tdee - totalCalories + burnedCalories;
        const proteinGoal = Math.round(userProfile.weight * 1.6);
        const proteinShortfall = proteinGoal - totalProtein;

        if (proteinShortfall > 15 && totalCalories > 0) {
            return `今天的蛋白質有點不夠喔 (目標: ${proteinGoal}g, 目前: ${totalProtein}g)。要不要試著在點心時間補充一份乳清蛋白或無糖豆漿呢？`;
        }
        if (deficit > 800) {
            return `今天有點過頭了，熱量赤字達到 ${deficit} 大卡。減脂是長期抗戰，別給自己太大的壓力，吃太少反而會讓代謝變慢喔~`;
        } else if (deficit >= 300) {
            return `今天超級棒！創造了 ${deficit} 大卡的熱量赤字，成果斐然！請保持下去！`;
        } else if (deficit >= 0) {
            return `今天很好，維持了基本的熱量消耗平衡。明天可以試著多散步十分鐘，或將一碗白飯換成糙米飯，來創造一點小小的赤字！`;
        } else {
            return `今天稍微超標了 ${Math.abs(deficit)} 大卡。沒關係的，減脂路上偶爾需要放鬆！明天回到正軌就好，千萬別因此焦慮。`;
        }
    }
    
    function render() {
        if (!userProfile) return;

        for (const key in logLists) {
            const listEl = logLists[key];
            listEl.innerHTML = '';
            if (todayLog[key] && todayLog[key].length > 0) {
                todayLog[key].forEach((item, index) => {
                    const li = document.createElement('li');
                    const textSpan = document.createElement('span');
                    if (key === 'exercise') {
                        textSpan.textContent = `${item.desc} - ${item.calories} kcal`;
                    } else {
                        textSpan.textContent = `${item.name} - ${item.calories} kcal / ${item.protein}g 蛋白`;
                    }
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.dataset.type = key;
                    deleteBtn.dataset.index = index;
                    li.appendChild(textSpan);
                    li.appendChild(deleteBtn);
                    listEl.appendChild(li);
                });
            }
        }
        
        const totalCalories = ['breakfast', 'lunch', 'dinner'].reduce((sum, meal) => sum + (todayLog[meal] ? todayLog[meal].reduce((s, item) => s + item.calories, 0) : 0), 0);
        const totalProtein = ['breakfast', 'lunch', 'dinner'].reduce((sum, meal) => sum + (todayLog[meal] ? todayLog[meal].reduce((s, item) => s + item.protein, 0) : 0), 0);
        const burnedCalories = todayLog.exercise ? todayLog.exercise.reduce((sum, item) => sum + item.calories, 0) : 0;
        
        summary.totalCalories.textContent = `${totalCalories} kcal`;
        summary.totalProtein.textContent = `${totalProtein} g`;
        summary.balanceCalories.textContent = `${userProfile.tdee - totalCalories + burnedCalories} kcal`;
        
        if (totalCalories > 0 || burnedCalories > 0) {
           feedbackTextEl.textContent = generateFeedback({ totalCalories, totalProtein, burnedCalories });
        } else {
           feedbackTextEl.textContent = '開始記錄今天的第一餐吧！';
        }
    }

    function handleDelete(type, index) {
        if (todayLog[type]) {
            todayLog[type].splice(index, 1);
            saveData();
            render();
        }
    }

    function handleAddFood(mealType) {
        const inputEl = document.getElementById(`${mealType}-input`);
        const foodName = inputEl.value.trim();
        if (!foodName) return;

        // 使用 includes 來做模糊搜尋，找到第一個匹配的食物
        const foodItem = foodDatabase.find(food => food.name.includes(foodName));
        
        if (foodItem) {
            if (!todayLog[mealType]) todayLog[mealType] = [];
            // 複製一份物件，避免未來修改資料庫時影響到已記錄的項目
            todayLog[mealType].push(JSON.parse(JSON.stringify(foodItem)));
            saveData();
            render();
            inputEl.value = '';
        } else {
            alert('在我們的資料庫中找不到這個食物喔！');
        }
    }
    
    function handleAddExercise() {
        const descInput = document.getElementById('exercise-desc');
        const calInput = document.getElementById('exercise-calories');
        const desc = descInput.value.trim();
        const calories = parseInt(calInput.value) || 0;
        if (!desc) { alert('請填寫活動描述！'); return; }
        if (!todayLog.exercise) todayLog.exercise = [];
        todayLog.exercise.push({ desc, calories });
        saveData();
        render();
        descInput.value = '';
        calInput.value = '';
    }

    function calculateTDEE(profile) { const { gender, age, weight, height, activityLevel } = profile; let bmr; if (gender === 'male') { bmr = 10 * weight + 6.25 * height - 5 * age + 5; } else { bmr = 10 * weight + 6.25 * height - 5 * age - 161; } return Math.round(bmr * activityLevel); }
    function saveProfile(profile) { localStorage.setItem('userProfile', JSON.stringify(profile)); }
    function showMainApp(profile) { profileSection.classList.add('hidden'); mainAppSection.classList.remove('hidden'); tdeeDisplayEl.textContent = `您的每日總消耗熱量 (TDEE) 約為: ${profile.tdee} kcal`; }
    
    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const profile = {
            gender: document.querySelector('input[name="gender"]:checked').value,
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseInt(document.getElementById('height').value),
            activityLevel: parseFloat(document.getElementById('activity-level').value),
        };
        if (!profile.age || !profile.weight || !profile.height) { alert('請填寫所有欄位！'); return; }
        profile.tdee = calculateTDEE(profile);
        saveProfile(profile);
        userProfile = profile;
        
        const tdeeResultEl = document.getElementById('tdee-result');
        tdeeResultEl.textContent = `計算結果：您的 TDEE 約為 ${profile.tdee} kcal`;
        tdeeResultEl.classList.remove('hidden');
        
        setTimeout(() => {
            showMainApp(userProfile);
            render();
        }, 1500);
    });

    mainAppSection.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const type = event.target.dataset.type;
            const index = parseInt(event.target.dataset.index);
            handleDelete(type, index);
        }
    });
    
    mealButtons.forEach(button => { button.addEventListener('click', () => { const mealType = button.dataset.meal; handleAddFood(mealType); }); });
    exerciseBtn.addEventListener('click', handleAddExercise);

    // --- E. 初始載入 (改為非同步) ---
    async function initializeApp() {
        await loadFoodDatabase();
        loadData();
        if (userProfile) {
            showMainApp(userProfile);
            render();
        } else {
            profileSection.classList.remove('hidden');
        }
    }
    
    initializeApp();
});