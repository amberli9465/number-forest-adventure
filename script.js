const paths = {
  buttonClick: "audio/sfx/sfx-add-banana.mp3",
  itemChange: "audio/sfx/sfx-banana-appear.mp3",
  correct: "audio/sfx/sfx-correct.mp3",
  voiceFolder: "audio/voice"
};

const modes = {
  banana: {
    modeName: "banana",
    eyebrow: "遞增概念",
    title: "一根一根增加香蕉",
    instruction: "按下按鈕，再加一根香蕉。",
    unit: "根香蕉",
    itemName: "香蕉",
    realImage: "img/banana/b01.png",
    outlineImage: "img/banana/b00.png",
    buttonImage: "img/buttons/btn-add-banana.webp",
    buttonFallback: "再加一根香蕉 ＋1",
    buttonAlt: "再加一根香蕉",
    voicePrefix: "banana",
    startCount: 0,
    endCount: 10,
    step: 1
  },

  carrot: {
    modeName: "carrot",
    eyebrow: "遞減概念",
    title: "一根一根拿走蘿蔔",
    instruction: "按下按鈕，拿走一根蘿蔔。",
    unit: "根蘿蔔",
    itemName: "蘿蔔",
    realImage: "img/carrot/c01.png",
    outlineImage: "img/carrot/c00.png",
    buttonImage: "img/buttons/btn-remove-carrot.webp",
    buttonFallback: "拿走一根蘿蔔 －1",
    buttonAlt: "拿走一根蘿蔔",
    voicePrefix: "carrot",
    startCount: 10,
    endCount: 0,
    step: -1
  }
};

const homeScreen = document.querySelector("#homeScreen");
const lessonScreen = document.querySelector("#lessonScreen");
const bananaModeButton = document.querySelector("#bananaModeButton");
const carrotModeButton = document.querySelector("#carrotModeButton");
const homeButton = document.querySelector("#homeButton");
const soundButton = document.querySelector("#soundButton");
const actionButton = document.querySelector("#actionButton");
const actionButtonImage = document.querySelector("#actionButtonImage");
const actionButtonFallback = document.querySelector("#actionButtonFallback");
const resetButton = document.querySelector("#resetButton");

const lessonEyebrow = document.querySelector("#lessonEyebrow");
const lessonTitle = document.querySelector("#lessonTitle");
const instructionText = document.querySelector("#instructionText");
const itemGrid = document.querySelector("#itemGrid");
const currentNumber = document.querySelector("#currentNumber");
const unitText = document.querySelector("#unitText");
const statusText = document.querySelector("#statusText");
const progressBar = document.querySelector("#progressBar");

let activeMode = modes.banana;
let itemCount = activeMode.startCount;
let soundEnabled = true;
let isBusy = false;
let lastChangedIndex = -1;
let currentVoice = null;

const sfx = {
  click: new Audio(paths.buttonClick),
  change: new Audio(paths.itemChange),
  correct: new Audio(paths.correct)
};

Object.values(sfx).forEach((audio) => {
  audio.preload = "auto";
  audio.volume = 0.78;
});

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function safePlay(audio) {
  if (!soundEnabled || !audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    // 音檔不存在或瀏覽器阻擋時，不影響教材操作。
    console.warn("音效未播放：", audio.src, error);
  }
}

function stopCurrentVoice() {
  if (!currentVoice) return;

  currentVoice.pause();
  currentVoice.currentTime = 0;
}

async function playVoice(count) {
  if (!soundEnabled) return;

  stopCurrentVoice();

  currentVoice = new Audio(
    `${paths.voiceFolder}/${activeMode.voicePrefix}-${count}.mp3`
  );
  currentVoice.preload = "auto";
  currentVoice.volume = 1;

  await safePlay(currentVoice);
}

function sentenceFor(count) {
  if (activeMode.modeName === "banana") {
    if (count === 0) {
      return "現在有 0 根香蕉。";
    }

    if (count === 10) {
      return "現在有 10 根香蕉，全部都放滿了！";
    }

    return `現在有 ${count} 根香蕉。`;
  }

  if (count === 10) {
    return "現在有 10 根蘿蔔。";
  }

  if (count === 0) {
    return "現在沒有蘿蔔，所以是 0 根蘿蔔。";
  }

  return `現在剩 ${count} 根蘿蔔。`;
}

function isTaskComplete() {
  return itemCount === activeMode.endCount;
}

function taskProgressPercent() {
  if (activeMode.step > 0) {
    return itemCount * 10;
  }

  return (10 - itemCount) * 10;
}

function createItemSlots() {
  itemGrid.innerHTML = "";

  for (let index = 0; index < 10; index += 1) {
    const slot = document.createElement("div");
    const image = document.createElement("img");
    const isReal = index < itemCount;

    slot.className = "item-slot";
    image.src = isReal ? activeMode.realImage : activeMode.outlineImage;
    image.alt = isReal
      ? `實體${activeMode.itemName}`
      : `空位的虛線${activeMode.itemName}`;

    if (activeMode.step > 0 && index === lastChangedIndex) {
      slot.classList.add("is-new");
    }

    slot.appendChild(image);
    itemGrid.appendChild(slot);
  }
}

function updateLesson() {
  currentNumber.textContent = itemCount;
  statusText.textContent = sentenceFor(itemCount);
  progressBar.style.width = `${taskProgressPercent()}%`;

  actionButton.disabled = isTaskComplete();
  actionButton.setAttribute(
    "aria-label",
    isTaskComplete()
      ? `${activeMode.itemName}任務已完成`
      : activeMode.buttonAlt
  );

  createItemSlots();
  lastChangedIndex = -1;
}

function showButtonImage() {
  actionButtonImage.hidden = false;
  actionButtonFallback.hidden = true;
}

function showButtonFallback() {
  actionButtonImage.hidden = true;
  actionButtonFallback.hidden = false;
}

function applyModeToPage() {
  lessonScreen.dataset.mode = activeMode.modeName;
  lessonEyebrow.textContent = activeMode.eyebrow;
  lessonTitle.textContent = activeMode.title;
  instructionText.textContent = activeMode.instruction;
  unitText.textContent = activeMode.unit;

  actionButtonImage.alt = activeMode.buttonAlt;
  actionButtonFallback.textContent = activeMode.buttonFallback;
  showButtonImage();
  actionButtonImage.src = activeMode.buttonImage;

  itemGrid.setAttribute(
    "aria-label",
    `${activeMode.itemName}的十格數量圖`
  );
}

async function addOneItem() {
  itemCount += 1;
  lastChangedIndex = itemCount - 1;
  updateLesson();

  await safePlay(sfx.change);
  await wait(280);
  await playVoice(itemCount);
}

async function removeOneItem() {
  const removeIndex = itemCount - 1;
  const slots = itemGrid.querySelectorAll(".item-slot");

  if (slots[removeIndex]) {
    slots[removeIndex].classList.add("is-leaving");
  }

  await safePlay(sfx.change);
  await wait(380);

  itemCount -= 1;
  updateLesson();

  await wait(180);
  await playVoice(itemCount);
}

async function changeOneItem() {
  if (isBusy || isTaskComplete()) return;

  isBusy = true;
  actionButton.disabled = true;

  await safePlay(sfx.click);
  await wait(150);

  if (activeMode.step > 0) {
    await addOneItem();
  } else {
    await removeOneItem();
  }

  if (isTaskComplete()) {
    await wait(650);
    await safePlay(sfx.correct);
  }

  isBusy = false;
  actionButton.disabled = isTaskComplete();
}

function resetLesson({ speak = false } = {}) {
  stopCurrentVoice();

  itemCount = activeMode.startCount;
  lastChangedIndex = -1;
  isBusy = false;

  applyModeToPage();
  updateLesson();

  if (speak) {
    setTimeout(() => playVoice(itemCount), 250);
  }
}

function openLesson(modeKey) {
  activeMode = modes[modeKey];

  homeScreen.hidden = true;
  lessonScreen.hidden = false;

  resetLesson({ speak: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openHome() {
  lessonScreen.hidden = true;
  homeScreen.hidden = false;
  stopCurrentVoice();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleSound() {
  soundEnabled = !soundEnabled;

  soundButton.textContent = soundEnabled ? "🔊" : "🔇";
  soundButton.setAttribute("aria-pressed", String(!soundEnabled));
  soundButton.setAttribute(
    "aria-label",
    soundEnabled ? "關閉聲音" : "開啟聲音"
  );

  if (!soundEnabled) {
    stopCurrentVoice();
  } else if (!lessonScreen.hidden) {
    playVoice(itemCount);
  }
}

actionButtonImage.addEventListener("load", showButtonImage);
actionButtonImage.addEventListener("error", showButtonFallback);

bananaModeButton.addEventListener("click", () => openLesson("banana"));
carrotModeButton.addEventListener("click", () => openLesson("carrot"));
homeButton.addEventListener("click", openHome);
soundButton.addEventListener("click", toggleSound);
actionButton.addEventListener("click", changeOneItem);
resetButton.addEventListener("click", () => resetLesson({ speak: true }));

applyModeToPage();
updateLesson();
