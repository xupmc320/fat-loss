// 等待 HTML 頁面完全載入後再執行
document.addEventListener('DOMContentLoaded', () => {

    // --- A. 取得所有需要操作的 HTML 元素 ---
    const foodSearchInput = document.getElementById('food-search');
    const addFoodBtn = document.getElementById('add-food-btn');
    const dailyLogList = document.getElementById('daily-log-list');

    const exerciseDescInput = document.getElementById('exercise-desc');
    const exerciseCaloriesInput = document.getElementById('exercise-calories');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const exerciseLogList = document.getElementById('exercise-log-list');

    const totalCaloriesEl = document.getElementById('total-calories');
    const burnedCaloriesEl = document.getElementById('burned-calories');
    const balanceCaloriesEl = document.getElementById('balance-calories');


    // --- B. 資料庫與狀態管理 ---

    // 我們的迷你食物資料庫 (符合您的「簡單」原則)
    const foodDatabase = [
        { name: '白飯', unit: '碗', calories: 280, protein: 5 },
        { name: '糙米飯', unit: '碗', calories: 220, protein: 6 },
        { name: '雞腿', unit: '隻', calories: 350, protein: 30 },
        { name: '排骨', unit: '塊', calories: 400, protein: 25 },
        { name: '雞胸肉', unit: '份', calories: 180, protein: 35 },
        { name: '炒青菜', unit: '份', calories: 150, protein: 3 },
        { name: '蒸蛋', unit: '份', calories: 130, protein: 12 },
        { name: '貢丸湯', unit: '碗', calories: 200, protein: 10 },
        { name: '滷蛋', unit: '顆', calories: 90, protein: 7 },
        { name: '無糖豆漿', unit: '杯', calories: 110, protein: 10 },
        { name: '乳清蛋白', unit: '份', calories: 150, protein: 25 },
    ];

    // 從 localStorage 讀取舊資料，如果沒有就用空陣列
    let dailyLog = JSON.parse(localStorage.getItem('dailyLog')) || [];
    let exerciseLog = JSON.parse(localStorage.getItem('exerciseLog')) || [];


    // --- C. 核心功能函式 ---

    // 畫面總管：根據目前的資料狀態，重繪整個畫面
    function render() {
        // 1. 更新飲食列表
        dailyLogList.innerHTML = ''; // 先清空
        if (dailyLog.length === 0) {
            dailyLogList.innerHTML = '<li class="placeholder">今天還沒有紀錄喔！</li>';
        } else {
            dailyLog.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.name} (${item.unit}) - ${item.calories} kcal`;
                dailyLogList.appendChild(li);
            });
        }

        // 2. 更新運動列表
        exerciseLogList.innerHTML = ''; // 先清空
        exerciseLog.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.desc} - ${item.calories} kcal`;
            exerciseLogList.appendChild(li);
        });

        // 3. 更新總結區塊
        const totalCalories = dailyLog.reduce((sum, item) => sum + item.calories, 0);
        const burnedCalories = exerciseLog.reduce((sum, item) => sum + item.calories, 0);
        const balance = totalCalories - burnedCalories;

        totalCaloriesEl.textContent = `${totalCalories} kcal`;
        burnedCaloriesEl.textContent = `${burnedCalories} kcal`;
        balanceCaloriesEl.textContent = `${balance} kcal`;
    }

    // 儲存資料到瀏覽器的 localStorage
    function saveData() {
        localStorage.setItem('dailyLog', JSON.stringify(dailyLog));
        localStorage.setItem('exerciseLog', JSON.stringify(exerciseLog));
    }

    // 新增飲食紀錄
    function handleAddFood() {
        const foodName = foodSearchInput.value.trim();
        if (!foodName) return; // 如果輸入是空的，就不執行

        const foodItem = foodDatabase.find(food => food.name === foodName);
        
        if (foodItem) {
            dailyLog.push(foodItem);
            saveData();
            render();
            foodSearchInput.value = ''; // 清空輸入框
        } else {
            alert('在我們的簡易資料庫中找不到這個食物喔！請試試別的。');
        }
    }

    // 新增運動紀錄
    function handleAddExercise() {
        const desc = exerciseDescInput.value.trim();
        const calories = parseInt(exerciseCaloriesInput.value) || 0;

        if (!desc) {
            alert('請填寫活動描述！');
            return;
        }

        exerciseLog.push({ desc, calories });
        saveData();
        render();
        exerciseDescInput.value = '';
        exerciseCaloriesInput.value = '';
    }

    // --- D. 事件監聽 ---
    addFoodBtn.addEventListener('click', handleAddFood);
    addExerciseBtn.addEventListener('click', handleAddExercise);


    // --- E. 初始載入 ---
    // 頁面一載入，就先畫一次畫面，把儲存的資料顯示出來
    render();
});