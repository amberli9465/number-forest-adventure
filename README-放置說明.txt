數字森林大冒險｜HTML 第三版
================================

本版把「香蕉遞增」與「蘿蔔遞減」結合在同一個響應式網頁中。

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
│     ├─ banana-0.mp3
│     ├─ banana-1.mp3
│     ├─ ... banana-10.mp3
│     ├─ carrot-0.mp3
│     ├─ carrot-1.mp3
│     ├─ ... carrot-10.mp3
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
   └─ buttons
      ├─ btn-add-banana.webp
      └─ btn-remove-carrot.webp

重要檔名
--------
請把「拿走一根蘿蔔 -1」按鈕存成：

img/buttons/btn-remove-carrot.webp

若按鈕圖片不存在，網頁會自動顯示文字版按鈕，不會整頁壞掉。

目前功能
--------
1. 首頁可選擇：
   - 香蕉增加：0 → 10
   - 蘿蔔減少：10 → 0
2. 香蕉頁：
   - 初始 10 格全部是虛線香蕉
   - 每按一次增加 1 根
   - 播放 banana-0.mp3 ～ banana-10.mp3
3. 蘿蔔頁：
   - 初始 10 格全部是實體蘿蔔
   - 每按一次，最右邊一根縮小離開，再換成虛線蘿蔔
   - 播放 carrot-10.mp3 ～ carrot-0.mp3
4. 蘿蔔顯示文字規律：
   - 10 根：現在有 10 根蘿蔔。
   - 9～1 根：現在剩 N 根蘿蔔。
   - 0 根：現在沒有蘿蔔，所以是 0 根蘿蔔。
5. 遞增與遞減各自有進度條。
6. 支援重新開始、回首頁與聲音開關。
7. 目前共用原本三個音效，不需先新增音效檔：
   - sfx-add-banana.mp3：按鈕點擊
   - sfx-banana-appear.mp3：物件出現／離開
   - sfx-correct.mp3：完成任務

開啟方式
--------
直接雙擊 index.html 即可測試。

若圖片或語音沒有出現，先確認：
1. 英文檔名完全相同。
2. 資料夾位置完全相同。
3. 副檔名與大小寫完全相同。
