document.addEventListener('DOMContentLoaded', () => {
    // --- A. 取得所有需要操作的 HTML 元素 ---
    // (部分元素與上一版相同，新增了各餐的專屬元素)
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

    // --- B. 資料庫與狀態管理 ---
    const foodDatabase = [
        { name: '白飯', calories: 280, protein: 5 }, { name: '糙米飯', calories: 220, protein: 6 },
        { name: '雞腿', calories: 350, protein: 30 }, { name: '排骨', calories: 400, protein: 25 },
        { name: '雞胸肉', calories: 180, protein: 35 }, { name: '炒青菜', calories: 150, protein: 3 },
        { name: '蒸蛋', calories: 130, protein: 12 }, { name: '貢丸湯', calories: 200, protein: 10 },
        { name: '滷蛋', calories: 90, protein: 7 }, { name: '無糖豆漿', calories: 110, protein: 10 },
        { name: '乳清蛋白', calories: 150, protein: 25 }, { name: '鮭魚', calories: 250, protein: 22 }
    ];

    let userProfile = {};
    let todayLog = { breakfast: [], lunch: [], dinner: [], exercise: [] };

    // --- C. 核心功能函式 ---

    // 取得今天的日期字串，作為 localStorage 的 key
    function getTodayKey() {
        const today = new Date();
        return `log_${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
    }

    function loadData() {
        userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;
        const savedLog = JSON.parse(localStorage.getItem(getTodayKey()));
        if (savedLog) {
            todayLog = savedLog;
        }
    }

    function saveData() {
        localStorage.setItem(getTodayKey(), JSON.stringify(todayLog));
    }

    function render() {
        // ... (省略 TDEE 相關的 render 邏輯) ...

        // 更新各餐列表
        for (const meal in logLists) {
            const listEl = logLists[meal];
            listEl.innerHTML = '';
            todayLog[meal].forEach(item => {
                const li = document.createElement('li');
                if (meal === 'exercise') {
                    li.textContent = `${item.desc} - ${item.calories} kcal`;
                } else {
                    li.textContent = `${item.name} - ${item.calories} kcal / ${item.protein}g 蛋白`;
                }
                listEl.appendChild(li);
            });
        }
        
        // 更新總結
        const totalCalories = ['breakfast', 'lunch', 'dinner'].reduce((sum, meal) => sum + todayLog[meal].reduce((s, item) => s + item.calories, 0), 0);
        const totalProtein = ['breakfast', 'lunch', 'dinner'].reduce((sum, meal) => sum + todayLog[meal].reduce((s, item) => s + item.protein, 0), 0);
        const burnedCalories = todayLog.exercise.reduce((sum, item) => sum + item.calories, 0);
        
        summary.totalCalories.textContent = `${totalCalories} kcal`;
        summary.totalProtein.textContent = `${totalProtein} g`;
        // 熱量結餘 = TDEE - 攝取熱量 + 運動消耗
        summary.balanceCalories.textContent = `${userProfile.tdee - totalCalories + burnedCalories} kcal`;
    }

    function handleAddFood(mealType) {
        const inputEl = document.getElementById(`${mealType}-input`);
        const foodName = inputEl.value.trim();
        if (!foodName) return;

        const foodItem = foodDatabase.find(food => food.name.includes(foodName));
        if (foodItem) {
            todayLog[mealType].push(foodItem);
            saveData();
            render();
            inputEl.value = '';
        } else {
            alert('在簡易資料庫中找不到這個食物喔！');
        }
    }
    
    function handleAddExercise() {
        const descInput = document.getElementById('exercise-desc');
        const calInput = document.getElementById('exercise-calories');
        const desc = descInput.value.trim();
        const calories = parseInt(calInput.value) || 0;
        if (!desc) { alert('請填寫活動描述！'); return; }
        todayLog.exercise.push({ desc, calories });
        saveData();
        render();
        descInput.value = '';
        calInput.value = '';
    }

    // --- D. TDEE 相關 (與上一版相同) ---
    function calculateTDEE(profile) { /* ... */ }
    function saveProfile(profile) { localStorage.setItem('userProfile', JSON.stringify(profile)); }
    function showMainApp(profile) {
        profileSection.classList.add('hidden');
        mainAppSection.classList.remove('hidden');
        tdeeDisplayEl.textContent = `您的每日總消耗熱量 (TDEE) 約為: ${profile.tdee} kcal`;
    }
    profileForm.addEventListener('submit', (event) => { /* ... */ });

    // --- E. 事件監聽 ---
    mealButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mealType = button.dataset.meal;
            handleAddFood(mealType);
        });
    });
    exerciseBtn.addEventListener('click', handleAddExercise);

    // --- F. 初始載入 ---
    loadData();
    if (userProfile) {
        showMainApp(userProfile);
        render(); // 載入後要渲染一次舊資料
    } else {
        profileSection.classList.remove('hidden');
    }
});


// 為了讓您能完整複製，我將被省略的 TDEE 函式補齊
function calculateTDEE(profile) {
    const { gender, age, weight, height, activityLevel } = profile;
    let bmr;
    if (gender === 'male') { bmr = 10 * weight + 6.25 * height - 5 * age + 5; } 
    else { bmr = 10 * weight + 6.25 * height - 5 * age - 161; }
    return Math.round(bmr * activityLevel);
}
document.getElementById('profile-form').addEventListener('submit', (event) => {
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
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    const tdeeResultEl = document.getElementById('tdee-result');
    tdeeResultEl.textContent = `計算結果：您的 TDEE 約為 ${profile.tdee} kcal`;
    tdeeResultEl.classList.remove('hidden');
    
    setTimeout(() => { location.reload(); }, 1500); // 儲存後重新整理頁面，來進入主程式
});