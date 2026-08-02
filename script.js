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
    primaryButtonImage: "img/buttons/btn-add-banana.webp",
    primaryButtonFallback: "再加一根香蕉 ＋1",
    primaryButtonAlt: "再加一根香蕉",
    voicePrefix: "banana",
    startCount: 0,
    interaction: "single-add"
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
    primaryButtonImage: "img/buttons/btn-remove-carrot.webp",
    primaryButtonFallback: "拿走一根蘿蔔 －1",
    primaryButtonAlt: "拿走一根蘿蔔",
    voicePrefix: "carrot",
    startCount: 10,
    interaction: "single-reduce"
  },

  apple: {
    modeName: "apple",
    eyebrow: "雙向操作",
    title: "蘋果加加減減",
    instruction: "可以按＋1增加蘋果，也可以按－1拿走蘋果。",
    unit: "顆蘋果",
    itemName: "蘋果",
    realImage: "img/apple/a01.png",
    outlineImage: "img/apple/a00.png",
    primaryButtonImage: "img/buttons/btn-add-apple.webp",
    primaryButtonFallback: "再加一顆蘋果 ＋1",
    primaryButtonAlt: "再加一顆蘋果",
    secondaryButtonImage: "img/buttons/btn-remove-apple.webp",
    secondaryButtonFallback: "再拿走一顆蘋果 －1",
    secondaryButtonAlt: "再拿走一顆蘋果",
    startCount: 5,
    interaction: "dual-apple",
    addActionVoice: "add-apple.mp3",
    reduceActionVoice: "reduce-apple.mp3",
    countPrefix: "apple"
  }
};

const homeScreen = document.querySelector("#homeScreen");
const lessonScreen = document.querySelector("#lessonScreen");
const bananaModeButton = document.querySelector("#bananaModeButton");
const carrotModeButton = document.querySelector("#carrotModeButton");
const appleModeButton = document.querySelector("#appleModeButton");
const homeButton = document.querySelector("#homeButton");
const soundButton = document.querySelector("#soundButton");
const resetButton = document.querySelector("#resetButton");

const lessonEyebrow = document.querySelector("#lessonEyebrow");
const lessonTitle = document.querySelector("#lessonTitle");
const instructionText = document.querySelector("#instructionText");
const itemGrid = document.querySelector("#itemGrid");
const currentNumber = document.querySelector("#currentNumber");
const unitText = document.querySelector("#unitText");
const statusText = document.querySelector("#statusText");
const progressBar = document.querySelector("#progressBar");

const primaryActionButton = document.querySelector("#primaryActionButton");
const primaryActionImage = document.querySelector("#primaryActionImage");
const primaryActionFallback = document.querySelector("#primaryActionFallback");
const secondaryActionButton = document.querySelector("#secondaryActionButton");
const secondaryActionImage = document.querySelector("#secondaryActionImage");
const secondaryActionFallback = document.querySelector("#secondaryActionFallback");

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
    console.warn("音效未播放：", audio.src, error);
  }
}

function stopCurrentVoice() {
  if (!currentVoice) return;
  currentVoice.pause();
  currentVoice.currentTime = 0;
}

async function playVoiceFile(filename, { waitForEnd = false } = {}) {
  if (!soundEnabled || !filename) return;

  stopCurrentVoice();

  currentVoice = new Audio(`${paths.voiceFolder}/${filename}`);
  currentVoice.preload = "auto";
  currentVoice.volume = 1;

  try {
    await currentVoice.play();

    if (waitForEnd) {
      await new Promise((resolve) => {
        const finish = () => resolve();

        currentVoice.addEventListener("ended", finish, { once: true });
        currentVoice.addEventListener("error", finish, { once: true });
      });
    }
  } catch (error) {
    console.warn("語音未播放：", currentVoice.src, error);
  }
}

async function playCountVoice(count) {
  if (activeMode.modeName === "apple") {
    await playVoiceFile(`${activeMode.countPrefix}-${count}.mp3`);
  } else {
    await playVoiceFile(`${activeMode.voicePrefix}-${count}.mp3`);
  }
}

function sentenceFor(count) {
  if (activeMode.modeName === "banana") {
    if (count === 0) return "現在有 0 根香蕉。";
    if (count === 10) return "現在有 10 根香蕉，全部都放滿了！";
    return `現在有 ${count} 根香蕉。`;
  }

  if (activeMode.modeName === "carrot") {
    if (count === 10) return "現在有 10 根蘿蔔。";
    if (count === 0) return "現在沒有蘿蔔，所以是 0 根蘿蔔。";
    return `現在剩 ${count} 根蘿蔔。`;
  }

  if (count === 0) return "現在沒有蘋果，所以是 0 顆蘋果。";
  return `現在有 ${count} 顆蘋果。`;
}

function createItemSlots() {
  itemGrid.innerHTML = "";

  for (let index = 0; index < 10; index += 1) {
    const slot = document.createElement("div");
    const image = document.createElement("img");
    const isReal = index < itemCount;

    slot.className = "item-slot";
    image.src = isReal ? activeMode.realImage : activeMode.outlineImage;
    image.alt = isReal ? `實體${activeMode.itemName}` : `空位的虛線${activeMode.itemName}`;

    if (index === lastChangedIndex && activeMode.modeName !== "carrot") {
      slot.classList.add("is-new");
    }

    slot.appendChild(image);
    itemGrid.appendChild(slot);
  }
}

function taskProgressPercent() {
  if (activeMode.modeName === "banana") return itemCount * 10;
  if (activeMode.modeName === "carrot") return (10 - itemCount) * 10;
  return itemCount * 10;
}

function updateActionButtons() {
  if (activeMode.modeName === "apple") {
    primaryActionButton.disabled = isBusy || itemCount >= 10;
    secondaryActionButton.disabled = isBusy || itemCount <= 0;
  } else if (activeMode.modeName === "banana") {
    primaryActionButton.disabled = isBusy || itemCount >= 10;
    secondaryActionButton.disabled = true;
  } else {
    primaryActionButton.disabled = isBusy || itemCount <= 0;
    secondaryActionButton.disabled = true;
  }
}

function updateLesson() {
  currentNumber.textContent = itemCount;
  statusText.textContent = sentenceFor(itemCount);
  progressBar.style.width = `${taskProgressPercent()}%`;
  createItemSlots();
  lastChangedIndex = -1;
  updateActionButtons();
}

function showButtonImage(imageElement, fallbackElement) {
  imageElement.hidden = false;
  fallbackElement.hidden = true;
}

function showButtonFallback(imageElement, fallbackElement) {
  imageElement.hidden = true;
  fallbackElement.hidden = false;
}

function applyModeToPage() {
  lessonScreen.dataset.mode = activeMode.modeName;
  lessonEyebrow.textContent = activeMode.eyebrow;
  lessonTitle.textContent = activeMode.title;
  instructionText.textContent = activeMode.instruction;
  unitText.textContent = activeMode.unit;
  itemGrid.setAttribute("aria-label", `${activeMode.itemName}的十格數量圖`);

  primaryActionImage.alt = activeMode.primaryButtonAlt;
  primaryActionFallback.textContent = activeMode.primaryButtonFallback;
  primaryActionImage.src = activeMode.primaryButtonImage;
  showButtonImage(primaryActionImage, primaryActionFallback);

  if (activeMode.modeName === "apple") {
    secondaryActionButton.hidden = false;
    secondaryActionImage.alt = activeMode.secondaryButtonAlt;
    secondaryActionFallback.textContent = activeMode.secondaryButtonFallback;
    secondaryActionImage.src = activeMode.secondaryButtonImage;
    showButtonImage(secondaryActionImage, secondaryActionFallback);
  } else {
    secondaryActionButton.hidden = true;
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

function resetLesson({ speak = false } = {}) {
  stopCurrentVoice();
  itemCount = activeMode.startCount;
  lastChangedIndex = -1;
  isBusy = false;
  applyModeToPage();
  updateLesson();
  if (speak) {
    setTimeout(() => playCountVoice(itemCount), 250);
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundButton.textContent = soundEnabled ? "🔊" : "🔇";
  soundButton.setAttribute("aria-pressed", String(!soundEnabled));
  soundButton.setAttribute("aria-label", soundEnabled ? "關閉聲音" : "開啟聲音");

  if (!soundEnabled) {
    stopCurrentVoice();
  } else if (!lessonScreen.hidden) {
    playCountVoice(itemCount);
  }
}

async function performBananaAdd() {
  await safePlay(sfx.click);
  await wait(150);
  itemCount += 1;
  lastChangedIndex = itemCount - 1;
  updateLesson();
  await safePlay(sfx.change);
  await wait(280);
  await playCountVoice(itemCount);

  if (itemCount === 10) {
    await wait(650);
    await safePlay(sfx.correct);
  }
}

async function performCarrotReduce() {
  await safePlay(sfx.click);
  await wait(150);

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
  await playCountVoice(itemCount);

  if (itemCount === 0) {
    await wait(650);
    await safePlay(sfx.correct);
  }
}

async function performAppleAdd() {
  // 先完整播完「再加一顆蘋果」，避免被下一段數量語音截斷。
  await playVoiceFile(activeMode.addActionVoice, { waitForEnd: true });

  itemCount += 1;
  lastChangedIndex = itemCount - 1;
  updateLesson();

  await safePlay(sfx.change);
  await wait(220);
  await playCountVoice(itemCount);
}

async function performAppleReduce() {
  // 先完整播完「再拿走一顆蘋果」，避免被數量語音截斷。
  await playVoiceFile(activeMode.reduceActionVoice, { waitForEnd: true });

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
  await playCountVoice(itemCount);
}

async function handlePrimaryAction() {
  if (isBusy) return;

  if (activeMode.modeName === "banana" && itemCount >= 10) return;
  if (activeMode.modeName === "carrot" && itemCount <= 0) return;
  if (activeMode.modeName === "apple" && itemCount >= 10) return;

  isBusy = true;
  updateActionButtons();

  if (activeMode.modeName === "banana") {
    await performBananaAdd();
  } else if (activeMode.modeName === "carrot") {
    await performCarrotReduce();
  } else {
    await performAppleAdd();
  }

  isBusy = false;
  updateActionButtons();
}

async function handleSecondaryAction() {
  if (isBusy || activeMode.modeName !== "apple" || itemCount <= 0) return;
  isBusy = true;
  updateActionButtons();
  await performAppleReduce();
  isBusy = false;
  updateActionButtons();
}

primaryActionImage.addEventListener("load", () => showButtonImage(primaryActionImage, primaryActionFallback));
primaryActionImage.addEventListener("error", () => showButtonFallback(primaryActionImage, primaryActionFallback));
secondaryActionImage.addEventListener("load", () => showButtonImage(secondaryActionImage, secondaryActionFallback));
secondaryActionImage.addEventListener("error", () => showButtonFallback(secondaryActionImage, secondaryActionFallback));

bananaModeButton.addEventListener("click", () => openLesson("banana"));
carrotModeButton.addEventListener("click", () => openLesson("carrot"));
appleModeButton.addEventListener("click", () => openLesson("apple"));
homeButton.addEventListener("click", openHome);
soundButton.addEventListener("click", toggleSound);
primaryActionButton.addEventListener("click", handlePrimaryAction);
secondaryActionButton.addEventListener("click", handleSecondaryAction);
resetButton.addEventListener("click", () => resetLesson({ speak: true }));

applyModeToPage();
updateLesson();
