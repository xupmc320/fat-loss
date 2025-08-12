document.addEventListener('DOMContentLoaded', () => {
    // --- 取得所有需要操作的 HTML 元素 ---
    const profileSection = document.getElementById('profile-section');
    const mainAppSection = document.getElementById('main-app');
    const profileForm = document.getElementById('profile-form');
    const tdeeResultEl = document.getElementById('tdee-result');
    const tdeeDisplayEl = document.getElementById('tdee-display');

    // --- 核心功能函式 ---

    // 儲存使用者資料到 localStorage
    function saveProfile(profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
    }

    // 讀取使用者資料
    function loadProfile() {
        const profileJSON = localStorage.getItem('userProfile');
        return profileJSON ? JSON.parse(profileJSON) : null;
    }

    // 根據使用者資料計算 TDEE
    function calculateTDEE(profile) {
        const { gender, age, weight, height, activityLevel } = profile;
        
        // 使用 Mifflin-St Jeor 公式計算基礎代謝率 (BMR)
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        
        const tdee = bmr * activityLevel;
        return Math.round(tdee);
    }

    // 顯示主應用程式畫面
    function showMainApp(profile) {
        profileSection.classList.add('hidden');
        mainAppSection.classList.remove('hidden');
        tdeeDisplayEl.textContent = `您的每日總消耗熱量 (TDEE) 約為: ${profile.tdee} kcal`;
    }


    // --- 事件監聽 ---

    // 處理個人資料表單的提交事件
    profileForm.addEventListener('submit', (event) => {
        event.preventDefault(); // 防止頁面重新整理

        const profile = {
            gender: document.querySelector('input[name="gender"]:checked').value,
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseInt(document.getElementById('height').value),
            activityLevel: parseFloat(document.getElementById('activity-level').value),
        };

        // 驗證輸入
        if (!profile.age || !profile.weight || !profile.height) {
            alert('請填寫所有欄位！');
            return;
        }

        profile.tdee = calculateTDEE(profile);
        saveProfile(profile);
        
        tdeeResultEl.textContent = `計算結果：您的 TDEE 約為 ${profile.tdee} kcal`;
        tdeeResultEl.classList.remove('hidden');

        // 延遲 2 秒後，自動切換到主畫面
        setTimeout(() => {
            showMainApp(profile);
        }, 2000);
    });


    // --- 初始載入邏輯 ---
    const userProfile = loadProfile();
    if (userProfile) {
        // 如果已經有儲存的資料，直接顯示主應用程式
        showMainApp(userProfile);
    } else {
        // 否則，顯示個人資料設定畫面
        profileSection.classList.remove('hidden');
    }
});