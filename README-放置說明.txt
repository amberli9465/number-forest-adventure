數字森林大冒險｜HTML 第四版
================================

本版在原本的香蕉遞增、蘿蔔遞減之外，再加入第三頁「蘋果加減」。

請把以下 4 個檔案放進「數學互動網頁」最外層，覆蓋原本版本：
- index.html
- style.css
- script.js
- README-放置說明.txt

建議資料夾結構
--------------
數學互動網頁
├─ index.html
├─ style.css
├─ script.js
├─ audio
│  ├─ sfx
│  │  ├─ sfx-add-banana.mp3
│  │  ├─ sfx-banana-appear.mp3
│  │  └─ sfx-correct.mp3
│  └─ voice
│     ├─ banana-0.mp3 ～ banana-10.mp3
│     ├─ carrot-0.mp3 ～ carrot-10.mp3
│     ├─ add-apple.mp3
│     ├─ reduce-apple.mp3
│     └─ apple-0.mp3 ～ apple-10.mp3
└─ img
   ├─ background
   │  ├─ forest-bottom.webp
   │  ├─ home-desktop.webp
   │  └─ home-mobile.webp
   ├─ banana
   │  ├─ b00.png
   │  └─ b01.png
   ├─ carrot
   │  ├─ c00.png
   │  └─ c01.png
   ├─ apple
   │  ├─ a00.png
   │  └─ a01.png
   └─ buttons
      ├─ btn-add-banana.webp
      ├─ btn-remove-carrot.webp
      ├─ btn-add-apple.webp
      └─ btn-remove-apple.webp

目前功能
--------
1. 首頁共有三種任務：
   - 香蕉增加：0 → 10
   - 蘿蔔減少：10 → 0
   - 蘋果加減：從 5 開始，自由加減
2. 香蕉頁：
   - 初始 10 格全部是虛線香蕉
   - 每按一次增加 1 根
   - 播放 banana-0.mp3 ～ banana-10.mp3
3. 蘿蔔頁：
   - 初始 10 格全部是實體蘿蔔
   - 每按一次拿走 1 根
   - 播放 carrot-10.mp3 ～ carrot-0.mp3
4. 蘋果頁：
   - 初始 5 顆實體蘋果、5 個虛線蘋果位置
   - 按「再加一顆蘋果」：
     1) 播放 add-apple.mp3
     2) 增加 1 顆蘋果
     3) 播放 apple-N.mp3
   - 按「再拿走一顆蘋果」：
     1) 播放 reduce-apple.mp3
     2) 拿走最右邊 1 顆蘋果
     3) 播放 apple-N.mp3
   - 蘋果數量範圍為 0～10
5. 所有頁面皆支援：
   - 重新開始
   - 回首頁
   - 聲音開關
   - 響應式版面（電腦／手機）

開啟方式
--------
直接雙擊 index.html 即可測試。


第四版修正版 v4.1
-----------------
修正蘋果頁的動作語音會被後續數量語音截斷的問題。

現在按下蘋果按鈕時：
1. 完整播放 add-apple.mp3 或 reduce-apple.mp3
2. 執行蘋果增加／減少動畫
3. 再播放 apple-0.mp3 ～ apple-10.mp3
