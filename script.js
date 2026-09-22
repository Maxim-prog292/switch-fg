const app = document.querySelector("#app");
const tradeBoard = document.querySelector("#tradeBoard");
const levelKicker = document.querySelector("#levelKicker");
const modeLabel = document.querySelector("#modeLabel");
const goalText = document.querySelector("#goalText");
const selectedText = document.querySelector("#selectedText");
const message = document.querySelector("#message");
const startPanel = document.querySelector("#startPanel");
const finishPanel = document.querySelector("#finishPanel");
const startSequenceButton = document.querySelector("#startSequenceButton");
const levelMenu = document.querySelector("#levelMenu");
const restartButton = document.querySelector("#restartButton");
const menuButton = document.querySelector("#menuButton");
const finishMenuButton = document.querySelector("#finishMenuButton");
const nextLevelButton = document.querySelector("#nextLevelButton");
const finishEyebrow = document.querySelector("#finishEyebrow");
const finishTitle = document.querySelector("#finishTitle");
const finishText = document.querySelector("#finishText");

const itemLabels = {
  fish: "рыба",
  hide: "шкура",
  axe: "топор",
  grain: "мешок зерна",
  clay: "глина",
  pot: "горшок",
  honey: "мёд",
  cloth: "ткань",
  horseshoe: "подкова",
  wax: "свеча",
  net: "сеть",
  coatItem: "кафтан",
  knife: "нож",
  coin: "монета",
};

const itemLabelsAccusative = {
  fish: "рыбу",
  hide: "шкуру",
  axe: "топор",
  grain: "мешок зерна",
  clay: "глину",
  pot: "горшок",
  honey: "мёд",
  cloth: "ткань",
  horseshoe: "подкову",
  wax: "свечу",
  net: "сеть",
  coatItem: "кафтан",
  knife: "нож",
  coin: "монету",
};

const CHARACTER_IMAGE_DIR = "assets/characters";
const CHARACTER_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const ITEM_IMAGE_DIR = "assets/items";
const ITEM_IMAGE_EXTENSION = "png";
const ASSET_VERSION = "20260913-1830";

const levels = [
  {
    title: "Уровень 1",
    subtitle: "Простой уровень",
    goal: "Получить топор",
    startItem: "fish",
    finalItem: "axe",
    intro:
      "У Ивана есть рыба. Ему нужен топор. Найдите короткую цепочку обмена.",
    finish:
      "Уф, получилось! Но пришлось менять дважды. Бартер работает, но даже короткая цепочка требует догадаться, кому что нужно.",
    people: [
      person("ivan", "Иван", "ivan", "fish", "axe"),
      person("smith", "Кузнец", "smith", "axe", "hide"),
      person("hunter", "Охотник", "hunter", "hide", "fish"),
    ],
  },
  {
    title: "Уровень 2",
    subtitle: "Уже посложнее",
    goal: "Получить горшок",
    startItem: "fish",
    finalItem: "pot",
    intro:
      "Теперь одного обмена через охотника мало. Ивану нужен горшок, а у него снова рыба.",
    finish:
      "Горшок у Ивана. Пришлось пройти три обмена: рыба, шкура, глина, горшок. Чем длиннее цепочка, тем труднее не сбиться.",
    people: [
      person("ivan", "Иван", "ivan", "fish", "pot"),
      person("potter", "Гончар", "potter", "pot", "clay"),
      person("miller", "Мельник", "miller", "clay", "hide"),
      person("hunter", "Охотник", "hunter", "hide", "fish"),
    ],
  },
  {
    title: "Уровень 3",
    subtitle: "Придется подумать",
    goal: "Получить подкову",
    startItem: "fish",
    finalItem: "horseshoe",
    intro:
      "Иван хочет подкову. Придётся пройти более длинный путь и не отдать вещь не тому человеку.",
    finish:
      "Подкова найдена. В этой цепочке уже четыре обмена, и каждый участник принимает только нужную ему вещь.",
    people: [
      person("ivan", "Иван", "ivan", "fish", "horseshoe"),
      person("farrier", "Кузнец", "farrier", "horseshoe", "cloth"),
      person("weaver", "Ткачиха", "weaver", "cloth", "honey"),
      person("beekeeper", "Пасечник", "beekeeper", "honey", "grain"),
      person("miller", "Мельник", "miller", "grain", "fish"),
    ],
  },
  {
    title: "Уровень 4",
    subtitle: "Придется сильно подумать",
    goal: "Получить монету",
    startItem: "fish",
    finalItem: "coin",
    intro:
      "Последняя задача: Ивану нужна монета. Цепочка длинная, и каждый неверный ход покажет, почему бартер неудобен.",
    finish:
      "Монета у Ивана. Вот почему деньги удобнее бартера: не нужно искать длинную цепочку людей, которым подходят чужие вещи.",
    people: [
      person("ivan", "Иван", "ivan", "fish", "coin"),
      person("merchant", "Купец", "merchant", "coin", "knife"),
      person("smith", "Кузнец", "smith", "knife", "coatItem"),
      person("tailor", "Портной", "tailor", "coatItem", "wax"),
      person("candler", "Свечник", "candler", "wax", "net"),
      person("fisher", "Рыбак", "fisher", "net", "fish"),
    ],
  },
];

let selected = null;
let audioContext = null;
let inactivityTimer = 0;
let currentLevelIndex = 0;
let sequentialMode = true;
let inventory = { ivan: "fish" };

const INACTIVITY_TIMEOUT = 60 * 1000;

function person(id, name, role, has, needs, imageName = role) {
  return {
    id,
    name,
    role,
    has,
    needs,
    imageBase: `${CHARACTER_IMAGE_DIR}/${imageName}`,
  };
}

function itemNameAccusative(item) {
  return itemLabelsAccusative[item] || itemName(item);
}

function requestFullscreenMode() {
  // Полноэкранный режим задаёт музейная оболочка, а не первое касание посетителя.
}

function fitApp() {
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  app.style.transform = `scale(${scale})`;
  app.style.marginLeft = `${(window.innerWidth - 1920 * scale) / 2}px`;
  app.style.marginTop = `${(window.innerHeight - 1080 * scale) / 2}px`;
}

function blockBrowserEvents() {
  ["contextmenu", "selectstart", "dragstart"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => event.preventDefault());
  });

  document.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
    },
    { passive: false },
  );

  document.addEventListener("keydown", (event) => {
    const blockedKeys = ["F5", "F11", "F12"];
    const blockedCombo =
      (event.ctrlKey || event.metaKey) &&
      ["a", "c", "p", "r", "s", "u", "+", "-", "0"].includes(
        event.key.toLowerCase(),
      );

    if (blockedKeys.includes(event.key) || blockedCombo) {
      event.preventDefault();
    }
  });
}

function resetInactivityTimer() {
  window.clearTimeout(inactivityTimer);
  if (!startPanel.hidden || !finishPanel.hidden) return;
  inactivityTimer = window.setTimeout(resetExperience, INACTIVITY_TIMEOUT);
}

function playDing() {
  audioContext =
    audioContext || new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  [740, 990].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.07);
    oscillator.connect(gain);
    oscillator.start(now + index * 0.07);
    oscillator.stop(now + 0.38 + index * 0.07);
  });
}

function itemName(item) {
  return itemLabels[item] || item;
}

function renderLevelMenu() {
  levelMenu.innerHTML = levels
    .map(
      (level, index) => `
        <button class="level-button" data-level="${index}">
          ${level.title}
          <small>${level.subtitle}</small>
        </button>
      `,
    )
    .join("");
}

function renderBoard() {
  const level = levels[currentLevelIndex];
  tradeBoard.className = `trade-board count-${level.people.length}`;
  tradeBoard.innerHTML = level.people.map(renderPerson).join("");
  setupPortraitImages();
  setupItemImages();

  tradeBoard.querySelectorAll(".person").forEach((card) => {
    card.addEventListener("click", () => choosePerson(card.dataset.person));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choosePerson(card.dataset.person);
      }
    });
  });
}

function renderPerson(entry) {
  const has = inventory[entry.id] || entry.has;
  return `
    <article class="person ${entry.role}" data-person="${entry.id}" tabindex="0" aria-label="${entry.name}">
      <div class="portrait" aria-hidden="true">
        <img
          class="portrait-image"
          src="${portraitSrc(entry, 0)}"
          data-src-base="${entry.imageBase}"
          data-extension-index="0"
          alt=""
          draggable="false"
        />
        <span class="portrait-fallback">${entry.name}</span>
      </div>
      <h2>${entry.name}</h2>
      <div class="needs">
        <p><span class="mark have">✓</span> У меня есть</p>
        <strong id="${entry.id}Has">${itemName(has)}</strong>
        <div class="item-icon ${iconClass(has)}" id="${entry.id}Icon" data-item="${has}" aria-hidden="true">
          ${renderItemImage(has)}
        </div>
      </div>
      <div class="needs">
        <p><span class="mark need">!</span> Мне нужно</p>
        <strong>${itemName(entry.needs)}</strong>
      </div>
    </article>
  `;
}

function renderItemImage(item) {
  return `<img class="item-image" src="${itemImageSrc(item)}" alt="" draggable="false" />`;
}

function setupPortraitImages() {
  tradeBoard.querySelectorAll(".portrait-image").forEach((image) => {
    image.addEventListener("error", () => tryNextPortraitImage(image));
  });
}

function tryNextPortraitImage(image) {
  const nextIndex = Number(image.dataset.extensionIndex) + 1;
  if (nextIndex < CHARACTER_IMAGE_EXTENSIONS.length) {
    image.dataset.extensionIndex = String(nextIndex);
    image.src = `${image.dataset.srcBase}.${CHARACTER_IMAGE_EXTENSIONS[nextIndex]}?v=${ASSET_VERSION}`;
    return;
  }

  image.hidden = true;
  image.closest(".portrait")?.classList.add("portrait-missing");
}

function portraitSrc(entry, extensionIndex) {
  return `${entry.imageBase}.${CHARACTER_IMAGE_EXTENSIONS[extensionIndex]}?v=${ASSET_VERSION}`;
}

function setupItemImages(root = tradeBoard) {
  root.querySelectorAll(".item-image").forEach(setupItemImage);
}

function setupItemImage(image) {
  image.addEventListener("load", () => showItemImage(image));
  image.addEventListener("error", () => hideMissingItemImage(image));

  if (image.complete) {
    if (image.naturalWidth > 0) {
      showItemImage(image);
    } else {
      hideMissingItemImage(image);
    }
  }
}

function showItemImage(image) {
  image.hidden = false;
  image.closest(".item-icon")?.classList.add("item-image-loaded");
}

function hideMissingItemImage(image) {
  image.hidden = true;
  image.closest(".item-icon")?.classList.remove("item-image-loaded");
}

function setItemIcon(icon, item) {
  icon.className = `item-icon ${iconClass(item)}`;
  icon.dataset.item = item;
  icon.innerHTML = renderItemImage(item);
  setupItemImages(icon);
}

function itemImageSrc(item) {
  return `${ITEM_IMAGE_DIR}/${iconClass(item)}.${ITEM_IMAGE_EXTENSION}?v=${ASSET_VERSION}`;
}

function iconClass(item) {
  return item === "coatItem" ? "coat-item" : item;
}

function currentLevel() {
  return levels[currentLevelIndex];
}

function getPerson(personId) {
  return currentLevel().people.find((entry) => entry.id === personId);
}

function getCard(personId) {
  return tradeBoard.querySelector(`[data-person="${personId}"]`);
}

function setMessage(text, kind = "") {
  message.textContent = text;
  message.classList.remove("good", "bad");
  if (kind) message.classList.add(kind);
}

function clearSelection() {
  selected = null;
  tradeBoard
    .querySelectorAll(".person")
    .forEach((personCard) => personCard.classList.remove("selected"));
  selectedText.textContent = "Сначала нажмите на Ивана";
}

function selectPerson(personId) {
  selected = personId;
  tradeBoard.querySelectorAll(".person").forEach((personCard) => {
    personCard.classList.toggle(
      "selected",
      personCard.dataset.person === personId,
    );
  });
  selectedText.textContent =
    personId === "ivan" ? "Иван" : "Выберите сначала Ивана";
}

function pulse(personId, kind) {
  const card = getCard(personId);
  if (!card) return;
  card.classList.remove("success", "fail");
  void card.offsetWidth;
  card.classList.add(kind);
  window.setTimeout(() => card.classList.remove(kind), 560);
}

function showCross(personId) {
  const card = getCard(personId);
  if (!card) return;
  const cross = document.createElement("div");
  cross.className = "cross";
  card.append(cross);
  window.setTimeout(() => cross.remove(), 520);
}

function updatePersonItem(personId, item) {
  inventory[personId] = item;
  const label = document.querySelector(`#${personId}Has`);
  const icon = document.querySelector(`#${personId}Icon`);
  if (!label || !icon) return;
  label.textContent = itemName(item);
  setItemIcon(icon, item);
  icon.classList.add("changed");
  window.setTimeout(() => icon.classList.remove("changed"), 480);
}

function choosePerson(personId) {
  requestFullscreenMode();
  resetInactivityTimer();

  if (personId === "ivan") {
    selectPerson("ivan");
    setMessage("Теперь выберите, с кем Иван попробует обменяться.");
    return;
  }

  if (selected !== "ivan") {
    selectPerson(personId);
    showCross(personId);
    pulse(personId, "fail");
    setMessage(
      "Сначала нажмите на Ивана, затем на того, с кем хотите обменяться.",
      "bad",
    );
    window.setTimeout(clearSelection, 520);
    return;
  }

  tryTrade(personId);
}

function tryTrade(targetId) {
  const trader = getPerson(targetId);
  const ivanItem = inventory.ivan;
  const traderItem = inventory[targetId] || trader.has;

  if (trader.needs !== ivanItem) {
    pulse(targetId, "fail");
    showCross(targetId);
    setMessage(
      `${trader.name} хочет ${itemNameAccusative(trader.needs)}, а не ${itemNameAccusative(ivanItem)}. Не хочет меняться.`,
      "bad",
    );
    clearSelection();
    return;
  }

  updatePersonItem("ivan", traderItem);
  updatePersonItem(targetId, ivanItem);
  pulse("ivan", "success");
  pulse(targetId, "success");
  playDing();
  setMessage(
    `${trader.name} согласен: отдаёт ${itemNameAccusative(traderItem)}, забирает ${itemNameAccusative(ivanItem)}.`,
    "good",
  );
  clearSelection();

  if (traderItem === currentLevel().finalItem) {
    window.setTimeout(showFinish, 900);
  }
}

function setupLevel(index) {
  currentLevelIndex = index;
  const level = currentLevel();
  inventory = Object.fromEntries(level.people.map((entry) => [entry.id, entry.has]));
  inventory.ivan = level.startItem;
  levelKicker.textContent = `${level.title}: ${level.subtitle}`;
  modeLabel.textContent = sequentialMode
    ? `${index + 1}/${levels.length}`
    : level.title;
  goalText.textContent = level.goal;
  finishPanel.hidden = true;
  renderBoard();
  clearSelection();
  setMessage(level.intro);
}

function startLevel(index, isSequential) {
  sequentialMode = isSequential;
  requestFullscreenMode();
  startPanel.hidden = true;
  finishPanel.hidden = true;
  setupLevel(index);
  resetInactivityTimer();
}

function showFinish() {
  const level = currentLevel();
  const hasNext = sequentialMode && currentLevelIndex < levels.length - 1;
  const isLastLevel = currentLevelIndex === levels.length - 1;
  finishEyebrow.textContent = isLastLevel ? "Финал" : "Уровень пройден";
  finishTitle.textContent = isLastLevel
    ? "Все цепочки пройдены!"
    : "Уф, получилось!";
  finishText.textContent = level.finish;
  nextLevelButton.hidden = !hasNext;
  nextLevelButton.textContent = "Следующий уровень";
  finishPanel.hidden = false;
}

function showLevelMenu() {
  finishPanel.hidden = true;
  startPanel.hidden = false;
  resetInactivityTimer();
}

function resetExperience() {
  startPanel.hidden = true;
  startLevel(0, true);
}

function restartCurrentLevel() {
  requestFullscreenMode();
  setupLevel(currentLevelIndex);
  resetInactivityTimer();
}

renderLevelMenu();

levelMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (!button) return;
  startLevel(Number(button.dataset.level), false);
});

startSequenceButton.addEventListener("click", () => startLevel(0, true));
restartButton.addEventListener("click", restartCurrentLevel);
menuButton.addEventListener("click", showLevelMenu);
finishMenuButton.addEventListener("click", showLevelMenu);
nextLevelButton.addEventListener("click", () =>
  startLevel(currentLevelIndex + 1, true),
);
window.addEventListener("resize", fitApp);
document.addEventListener("pointerdown", requestFullscreenMode, { once: true });
["pointerdown", "pointermove", "keydown"].forEach((eventName) => {
  document.addEventListener(eventName, resetInactivityTimer);
});

blockBrowserEvents();
fitApp();
setupLevel(0);
startPanel.hidden = true;
window.ExhibitUI?.mount({ timeout: INACTIVITY_TIMEOUT, reset: resetExperience });
resetInactivityTimer();
