(() => {
  "use strict";

  const PHOTO_COUNT = 7;
  const PASSWORD = "1123";

  const photos = {
    1: {
      file: "assets/photos/photo-01.jpg",
      clue: "第一个数字是 1",
      caption: "第一次心动的样子",
    },
    2: {
      file: "assets/photos/photo-02.jpg",
      clue: "第二个数字是 1",
      caption: "一起看过的月亮",
    },
    3: {
      file: "assets/photos/photo-03.jpg",
      clue: "第三个数字是 2",
      caption: "靠得很近的那一天",
    },
    4: {
      file: "assets/photos/photo-04.jpg",
      clue: "第四个数字是 3",
      caption: "镜头里的我们",
    },
    5: {
      file: "assets/photos/photo-05.jpg",
      clue: "背面画着一颗小爱心，没有数字",
      caption: "只属于我们的小秘密",
    },
    6: {
      file: "assets/photos/photo-06.jpg",
      clue: "记得我们第一次见面吗？",
      caption: "故事开始的地方",
    },
    7: {
      file: "assets/photos/photo-07.jpg",
      clue: "谢谢你一直陪着我",
      caption: "还想有更多以后",
    },
  };

  const objects = [
    {
      id: "windowSill",
      name: "窗台角落",
      photo: null,
      detail: "只有一片被阳光晒得脆脆的干叶子",
    },
    {
      id: "painting",
      name: "风景画背面",
      photo: 4,
    },
    {
      id: "oldBook",
      name: "第三层的旧书",
      photo: 3,
    },
    {
      id: "wardrobe",
      name: "旧衣柜夹层",
      photo: 6,
    },
    {
      id: "lamp",
      name: "落地灯底座",
      photo: 7,
    },
    {
      id: "nightstand",
      name: "床头柜抽屉",
      photo: 1,
    },
    {
      id: "pillow",
      name: "枕头底下",
      photo: 5,
    },
    {
      id: "mattressGap",
      name: "床垫缝隙",
      photo: null,
      detail: "摸到一枚凉凉的小硬币",
    },
    {
      id: "bedUnder",
      name: "床底",
      photo: null,
      detail: "一只落了灰的袜子安静地躺在那里",
    },
    {
      id: "deskDrawer",
      name: "书桌抽屉",
      photo: null,
      detail: "有一支已经写不出字的小笔",
    },
    {
      id: "notebook",
      name: "书桌上的笔记本",
      photo: 2,
    },
    {
      id: "underChair",
      name: "软垫椅子下面",
      photo: null,
      detail: "捡到一根绕成小圈的粉色发绳",
    },
    {
      id: "plant",
      name: "绿萝花盆",
      photo: null,
      detail: "只有松软的泥土和几片绿叶子",
    },
    {
      id: "rugObject",
      name: "地毯下面",
      photo: null,
      detail: "几粒灰尘在阳光里轻轻飘了起来",
    },
  ];

  const objectMap = new Map(objects.map((item) => [item.id, item]));
  const tilts = [-2.4, 1.8, -1.2, 2.2, -1.8, 1.4, -0.8];

  const dom = {
    cover: document.getElementById("cover"),
    game: document.getElementById("game"),
    startButton: document.getElementById("startButton"),
    musicButton: document.getElementById("musicButton"),
    musicLabel: document.querySelector(".music-label"),
    progressText: document.getElementById("progressText"),
    room: document.getElementById("room"),
    roomMessage: document.getElementById("roomMessageText"),
    photoWall: document.getElementById("photoWall"),
    heartCount: document.getElementById("heartCount"),
    lockedContent: document.getElementById("lockedContent"),
    passwordContent: document.getElementById("passwordContent"),
    lockProgress: document.getElementById("lockProgress"),
    lockDots: document.getElementById("lockDots"),
    passwordForm: document.getElementById("passwordForm"),
    passwordInput: document.getElementById("passwordInput"),
    passwordMessage: document.getElementById("passwordMessage"),
    mysteryChest: document.getElementById("mysteryChest"),
    resetButton: document.getElementById("resetButton"),
    cluePop: document.getElementById("cluePop"),
    clueClose: document.getElementById("clueClose"),
    clueFlip: document.getElementById("clueFlip"),
    clueThumbImage: document.getElementById("clueThumbImage"),
    clueKicker: document.getElementById("clueKicker"),
    clueText: document.getElementById("clueText"),
    letterOverlay: document.getElementById("letterOverlay"),
    letterClose: document.getElementById("letterClose"),
    letterDone: document.getElementById("letterDone"),
    letterReset: document.getElementById("letterReset"),
    letterParticles: document.getElementById("letterParticles"),
    celebrationBanner: document.getElementById("celebrationBanner"),
  };

  const state = {
    started: false,
    found: [],
    searched: new Set(),
    wallSlots: [],
    letterOpen: false,
    previousFocus: null,
  };

  function midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  class TinyMusicBox {
    constructor() {
      this.context = null;
      this.master = null;
      this.timer = null;
      this.step = 0;
      this.nextTime = 0;
      this.stepDuration = 0.16;
      this.muted = false;
    }

    start() {
      try {
        if (!this.context) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) {
            return;
          }
          this.context = new AudioContextClass();
          this.master = this.context.createGain();
          this.master.gain.value = this.muted ? 0.0001 : 0.19;
          this.master.connect(this.context.destination);
        }

        if (this.context.state === "suspended") {
          this.context.resume().catch(() => {});
        }

        if (!this.timer) {
          this.step = 0;
          this.nextTime = this.context.currentTime + 0.06;
          this.timer = window.setInterval(() => this.scheduler(), 120);
          this.scheduler();
        }
      } catch {
        this.timer = null;
      }
    }

    scheduler() {
      if (!this.context) {
        return;
      }

      while (this.nextTime < this.context.currentTime + 0.55) {
        this.scheduleStep(this.step, this.nextTime);
        this.step = (this.step + 1) % 64;
        this.nextTime += this.stepDuration;
      }
    }

    scheduleStep(step, time) {
      const melody = [
        76, null, 79, 81, 79, null, 76, 74,
        72, null, 76, 79, 84, null, 81, 79,
        74, null, 76, 79, 81, null, 79, 76,
        72, null, 74, 72, 69, null, 72, 74,
      ];

      const melodyNote = melody[step % melody.length];
      if (melodyNote) {
        const soft = step % 8 === 0 ? 0.033 : 0.022;
        this.tone(midiToFrequency(melodyNote), time, 0.66, "triangle", soft, -0.22);
        this.tone(midiToFrequency(melodyNote + 12), time, 0.34, "sine", soft * 0.26, 0.28);
      }

      if (step % 8 === 0) {
        const chords = [
          [60, 64, 67, 71],
          [57, 60, 64, 67],
          [53, 57, 60, 64],
          [55, 59, 62, 64],
        ];
        const chord = chords[Math.floor(step / 8) % chords.length];
        chord.forEach((note, index) => {
          this.tone(
            midiToFrequency(note),
            time + index * 0.012,
            1.38,
            "sine",
            0.012,
            (index - 1.5) * 0.17,
          );
        });
      }

      if (step % 8 === 0 || step % 8 === 4) {
        const bassNote = step % 16 < 8 ? 48 : 45;
        this.tone(midiToFrequency(bassNote), time, 0.78, "sine", 0.02, 0);
      }

      if (step % 4 === 2) {
        this.shaker(time, 0.008);
      }
    }

    tone(frequency, start, duration, type, volume, pan = 0) {
      if (!this.context || !this.master) {
        return;
      }

      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const panner = this.context.createStereoPanner
        ? this.context.createStereoPanner()
        : null;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain);
      if (panner) {
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        gain.connect(panner);
        panner.connect(this.master);
      } else {
        gain.connect(this.master);
      }

      oscillator.start(start);
      oscillator.stop(start + duration + 0.05);
    }

    shaker(start, volume) {
      if (!this.context || !this.master) {
        return;
      }

      const length = Math.max(1, Math.floor(this.context.sampleRate * 0.045));
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) {
        channel[index] = (Math.random() * 2 - 1) * (1 - index / length);
      }

      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      filter.type = "highpass";
      filter.frequency.value = 5200;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      source.start(start);
    }

    toggle() {
      this.muted = !this.muted;
      if (this.context && this.master) {
        const target = this.muted ? 0.0001 : 0.19;
        this.master.gain.cancelScheduledValues(this.context.currentTime);
        this.master.gain.setTargetAtTime(target, this.context.currentTime, 0.04);
      }
      return this.muted;
    }

    sfx(type) {
      if (!this.context || this.muted) {
        return;
      }
      const now = this.context.currentTime + 0.015;

      if (type === "found") {
        [659.25, 783.99, 1046.5].forEach((frequency, index) => {
          this.tone(frequency, now + index * 0.075, 0.42, "sine", 0.055, index * 0.1);
        });
      }

      if (type === "empty") {
        this.tone(220, now, 0.16, "sine", 0.025, -0.1);
        this.tone(196, now + 0.07, 0.2, "sine", 0.018, 0.1);
      }

      if (type === "unlock") {
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
          this.tone(frequency, now + index * 0.1, 0.72, "triangle", 0.045, index * 0.12 - 0.16);
        });
      }

      if (type === "error") {
        this.tone(185, now, 0.22, "triangle", 0.035, -0.08);
        this.tone(164.81, now + 0.1, 0.3, "triangle", 0.03, 0.08);
      }

      if (type === "success") {
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((frequency, index) => {
          this.tone(frequency, now + index * 0.085, 1.2, "sine", 0.05, (index - 2) * 0.12);
        });
      }
    }
  }

  const music = new TinyMusicBox();

  function buildLockDots() {
    dom.lockDots.replaceChildren();
    for (let index = 0; index < PHOTO_COUNT; index += 1) {
      const dot = document.createElement("span");
      dot.className = "lock-dot";
      dom.lockDots.appendChild(dot);
    }
  }

  function createEmptySlot(index) {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "photo-slot uncollected";
    slot.disabled = true;
    slot.dataset.slot = String(index + 1).padStart(2, "0");
    slot.setAttribute("aria-label", `第 ${index + 1} 个照片位置，尚未收集`);
    return slot;
  }

  function buildPhotoWall() {
    dom.photoWall.replaceChildren();
    state.wallSlots = [];
    for (let index = 0; index < PHOTO_COUNT; index += 1) {
      const slot = createEmptySlot(index);
      state.wallSlots.push(slot);
      dom.photoWall.appendChild(slot);
    }
  }

  function fillPhotoSlot(index, photoId, justFound = false) {
    const slot = state.wallSlots[index];
    const photo = photos[photoId];
    if (!slot || !photo) {
      return;
    }

    slot.replaceChildren();
    slot.disabled = false;
    slot.className = `photo-slot collected${justFound ? " just-found" : ""}`;
    slot.dataset.photoId = String(photoId);
    slot.style.setProperty("--tilt", `${tilts[index]}deg`);
    slot.setAttribute("aria-label", `第 ${index + 1} 张照片，点击翻转查看背面`);

    const inner = document.createElement("span");
    inner.className = "photo-slot-inner";

    const front = document.createElement("span");
    front.className = "photo-face photo-front";

    const image = document.createElement("img");
    image.src = photo.file;
    image.alt = `三水和天将明的第 ${index + 1} 张回忆照片`;
    front.appendChild(image);

    const number = document.createElement("span");
    number.className = "photo-number";
    number.textContent = String(index + 1).padStart(2, "0");
    front.appendChild(number);

    const caption = document.createElement("span");
    caption.className = "photo-front-caption";
    const captionText = document.createElement("span");
    captionText.textContent = photo.caption;
    const captionHeart = document.createElement("span");
    captionHeart.textContent = "♡";
    caption.append(captionText, captionHeart);
    front.appendChild(caption);

    const back = document.createElement("span");
    back.className = "photo-face photo-back";
    const clue = document.createElement("p");
    clue.textContent = photo.clue;
    const hint = document.createElement("small");
    hint.textContent = "点击翻回照片";
    back.append(clue, hint);

    inner.append(front, back);
    slot.appendChild(inner);

    slot.addEventListener("click", () => {
      slot.classList.toggle("flipped");
      const flipped = slot.classList.contains("flipped");
      slot.setAttribute(
        "aria-label",
        flipped
          ? `第 ${index + 1} 张照片背面：${photo.clue}。点击翻回正面`
          : `第 ${index + 1} 张照片，点击翻转查看背面`,
      );
    });

    if (justFound) {
      window.setTimeout(() => slot.classList.remove("just-found"), 1000);
    }
  }

  function updateProgress() {
    const count = state.found.length;
    dom.progressText.textContent = `${count}/${PHOTO_COUNT}`;
    dom.heartCount.textContent = `♡ ${count}`;
    dom.lockProgress.textContent = `${count}/${PHOTO_COUNT}`;

    Array.from(dom.lockDots.children).forEach((dot, index) => {
      dot.classList.toggle("filled", index < count);
    });
  }

  function setRoomMessage(message) {
    dom.roomMessage.textContent = message;
    dom.roomMessage.parentElement.animate(
      [
        { opacity: 0.55, transform: "translate(-50%, 4px)" },
        { opacity: 1, transform: "translate(-50%, 0)" },
      ],
      { duration: 260, easing: "ease-out" },
    );
  }

  function findPhotoObject(photoId) {
    return objects.find((item) => item.photo === photoId);
  }

  function flyPhotoToWall(photoId, sourceElement, destinationSlot) {
    return new Promise((resolve) => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
        || !sourceElement
        || !destinationSlot
      ) {
        resolve();
        return;
      }

      const sourceRect = sourceElement.getBoundingClientRect();
      const destinationRect = destinationSlot.getBoundingClientRect();
      const width = Math.max(65, Math.min(110, sourceRect.width * 0.9));
      const height = width * 1.23;
      const left = sourceRect.left + sourceRect.width / 2 - width / 2;
      const top = sourceRect.top + sourceRect.height / 2 - height / 2;

      const ghost = document.createElement("div");
      ghost.className = "flying-photo";
      ghost.style.left = `${left}px`;
      ghost.style.top = `${top}px`;
      ghost.style.width = `${width}px`;
      ghost.style.height = `${height}px`;

      const image = document.createElement("img");
      image.src = photos[photoId].file;
      image.alt = "";
      ghost.appendChild(image);
      document.body.appendChild(ghost);

      const startCenterX = left + width / 2;
      const startCenterY = top + height / 2;
      const endCenterX = destinationRect.left + destinationRect.width / 2;
      const endCenterY = destinationRect.top + destinationRect.height / 2;
      const deltaX = endCenterX - startCenterX;
      const deltaY = endCenterY - startCenterY;
      const scale = Math.max(0.75, destinationRect.width / width);

      const animation = ghost.animate(
        [
          {
            opacity: 0,
            transform: "translate(0, 0) scale(0.58) rotate(-8deg)",
          },
          {
            opacity: 1,
            transform: `translate(${deltaX * 0.34}px, ${deltaY * 0.34 - 56}px) scale(1.18) rotate(5deg)`,
            offset: 0.43,
          },
          {
            opacity: 0.95,
            transform: `translate(${deltaX * 0.76}px, ${deltaY * 0.76 - 24}px) scale(1.06) rotate(-2deg)`,
            offset: 0.76,
          },
          {
            opacity: 0,
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(0deg)`,
          },
        ],
        {
          duration: 880,
          easing: "cubic-bezier(0.2, 0.72, 0.18, 1)",
          fill: "forwards",
        },
      );

      animation.onfinish = () => {
        ghost.remove();
        resolve();
      };
      animation.oncancel = () => {
        ghost.remove();
        resolve();
      };
    });
  }

  function showClue(photoId) {
    const photo = photos[photoId];
    const foundIndex = state.found.findIndex((item) => item.photoId === photoId);
    dom.clueThumbImage.src = photo.file;
    dom.clueThumbImage.alt = `刚找到的回忆照片：${photo.caption}`;
    dom.clueKicker.textContent = `FOUND A MEMORY · ${foundIndex + 1}/${PHOTO_COUNT}`;
    dom.clueText.textContent = photo.clue;
    dom.cluePop.classList.remove("flipped");
    dom.clueFlip.textContent = "翻到背面";
    dom.cluePop.hidden = false;
  }

  function unlockChest() {
    dom.lockedContent.hidden = true;
    dom.passwordContent.hidden = false;
    dom.room.classList.add("unlocked");
    dom.celebrationBanner.hidden = false;
    setRoomMessage("✨ 所有照片集齐了！密码箱出现在房间中央。");
    music.sfx("unlock");

    window.setTimeout(() => {
      dom.celebrationBanner.hidden = true;
    }, 4100);
  }

  async function handleObjectClick(event) {
    const button = event.currentTarget;
    const item = objectMap.get(button.id);
    if (!item || state.searched.has(item.id)) {
      return;
    }

    state.searched.add(item.id);
    button.disabled = true;

    if (item.photo) {
      button.classList.add("is-found");
      music.sfx("found");
      const wallIndex = state.found.length;
      const destinationSlot = state.wallSlots[wallIndex];
      state.found.push({ photoId: item.photo, objectId: item.id });

      await flyPhotoToWall(item.photo, button, destinationSlot);
      fillPhotoSlot(wallIndex, item.photo, true);
      updateProgress();
      button.classList.add("searched");
      showClue(item.photo);
      setRoomMessage(`在「${item.name}」找到了一张照片，已经放进照片墙。`);

      if (state.found.length === PHOTO_COUNT) {
        window.setTimeout(unlockChest, 520);
      }
      return;
    }

    button.classList.add("is-shaking");
    music.sfx("empty");
    setRoomMessage(`${item.detail}。这里什么也没有……再找找别处吧。`);
    window.setTimeout(() => {
      button.classList.remove("is-shaking");
      button.classList.add("searched");
    }, 480);
  }

  function resetObjectButtons() {
    document.querySelectorAll(".search-object").forEach((button) => {
      button.disabled = false;
      button.classList.remove("searched", "is-shaking", "is-found");
    });
  }

  function resetGame({ fromLetter = false } = {}) {
    state.found = [];
    state.searched.clear();
    dom.cluePop.hidden = true;
    dom.cluePop.classList.remove("flipped");
    dom.celebrationBanner.hidden = true;
    dom.room.classList.remove("unlocked");
    dom.mysteryChest.classList.remove("open", "is-wrong");
    dom.lockedContent.hidden = false;
    dom.passwordContent.hidden = true;
    dom.passwordForm.reset();
    dom.passwordMessage.textContent = "";
    dom.passwordMessage.classList.remove("success");
    dom.passwordInput.classList.remove("is-error");
    dom.passwordInput.disabled = false;
    dom.passwordForm.querySelector("button").disabled = false;
    dom.letterParticles.replaceChildren();

    if (!dom.letterOverlay.hidden) {
      closeLetter(false);
    }

    resetObjectButtons();
    buildPhotoWall();
    updateProgress();
    setRoomMessage("房间又恢复了最初的样子。我们再来一起找一遍吧。");
    music.sfx("empty");

    if (fromLetter) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      dom.resetButton.focus({ preventScroll: true });
    }
  }

  function startGame() {
    if (state.started) {
      return;
    }
    state.started = true;
    dom.cover.hidden = true;
    dom.game.hidden = false;
    music.start();
    document.title = "温馨小房间 · 三水 & 天将明";
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => {
      setRoomMessage("点击房间里的任意物件，开始寻找第一张照片吧。");
    }, 620);
  }

  function toggleMusic() {
    const muted = music.toggle();
    dom.musicButton.setAttribute("aria-pressed", String(!muted));
    dom.musicButton.setAttribute("aria-label", muted ? "开启背景音乐" : "关闭背景音乐");
    dom.musicLabel.textContent = muted ? "音乐关闭" : "音乐开启";
    if (!muted) {
      music.start();
    }
  }

  function setPasswordError(message) {
    dom.passwordMessage.textContent = message;
    dom.passwordMessage.classList.remove("success");
    dom.passwordInput.classList.remove("is-error");
    dom.mysteryChest.classList.remove("is-wrong");
    void dom.passwordInput.offsetWidth;
    dom.passwordInput.classList.add("is-error");
    dom.mysteryChest.classList.add("is-wrong");
    dom.passwordInput.setAttribute("aria-invalid", "true");
    music.sfx("error");
    window.setTimeout(() => {
      dom.passwordInput.classList.remove("is-error");
      dom.mysteryChest.classList.remove("is-wrong");
    }, 1000);
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    const value = dom.passwordInput.value.trim();

    if (value !== PASSWORD) {
      setPasswordError("密码不对哦，再看看照片背面的数字吧");
      dom.passwordInput.focus();
      dom.passwordInput.select();
      return;
    }

    dom.passwordInput.removeAttribute("aria-invalid");
    dom.passwordInput.classList.remove("is-error");
    dom.passwordMessage.textContent = "咔哒——箱子打开了。";
    dom.passwordMessage.classList.add("success");
    dom.passwordInput.disabled = true;
    dom.passwordForm.querySelector("button").disabled = true;
    dom.mysteryChest.classList.add("open");
    createGoldParticles(28);
    music.sfx("success");
    setRoomMessage("箱子盖缓缓打开，一封手写信安静地躺在里面。");

    window.setTimeout(() => {
      openLetter();
    }, 880);
  }

  function createGoldParticles(amount) {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < amount; index += 1) {
      const particle = document.createElement("span");
      particle.className = "gold-particle";
      particle.style.left = `${42 + Math.random() * 20}%`;
      particle.style.bottom = `${14 + Math.random() * 28}%`;
      particle.style.setProperty("--drift", `${(Math.random() - 0.5) * 260}px`);
      particle.style.animationDelay = `${Math.random() * 0.8}s`;
      particle.style.animationDuration = `${2 + Math.random() * 1.6}s`;
      particle.style.width = `${3 + Math.random() * 7}px`;
      particle.style.height = particle.style.width;
      fragment.appendChild(particle);
    }
    dom.letterParticles.appendChild(fragment);
  }

  function openLetter() {
    state.previousFocus = document.activeElement;
    state.letterOpen = true;
    dom.letterOverlay.hidden = false;
    document.body.classList.add("overlay-open");
    dom.letterParticles.replaceChildren();
    createGoldParticles(52);
    window.setTimeout(() => dom.letterClose.focus(), 80);
  }

  function closeLetter(restoreFocus = true) {
    dom.letterOverlay.hidden = true;
    dom.letterParticles.replaceChildren();
    document.body.classList.remove("overlay-open");
    state.letterOpen = false;
    if (restoreFocus && state.previousFocus instanceof HTMLElement) {
      state.previousFocus.focus({ preventScroll: true });
    }
  }

  function trapLetterFocus(event) {
    if (!state.letterOpen || event.key !== "Tab") {
      return;
    }
    const focusable = Array.from(
      dom.letterOverlay.querySelectorAll("button:not(:disabled), input:not(:disabled)"),
    ).filter((element) => element.offsetParent !== null);
    if (!focusable.length) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initialize() {
    buildLockDots();
    buildPhotoWall();
    updateProgress();

    document.querySelectorAll(".search-object").forEach((button) => {
      button.addEventListener("click", handleObjectClick);
    });

    dom.startButton.addEventListener("click", startGame);
    dom.musicButton.addEventListener("click", toggleMusic);
    dom.passwordForm.addEventListener("submit", handlePasswordSubmit);
    dom.passwordInput.addEventListener("input", () => {
      dom.passwordInput.value = dom.passwordInput.value.replace(/\D/g, "").slice(0, 4);
      dom.passwordMessage.textContent = "";
      dom.passwordInput.classList.remove("is-error");
      dom.passwordInput.removeAttribute("aria-invalid");
    });
    dom.mysteryChest.addEventListener("click", () => {
      dom.passwordInput.focus();
      dom.passwordInput.select();
    });
    dom.clueClose.addEventListener("click", () => {
      dom.cluePop.hidden = true;
    });
    dom.clueFlip.addEventListener("click", () => {
      const flipped = dom.cluePop.classList.toggle("flipped");
      dom.clueFlip.textContent = flipped ? "看回照片" : "翻到背面";
    });
    dom.resetButton.addEventListener("click", () => resetGame());
    dom.letterClose.addEventListener("click", () => closeLetter());
    dom.letterDone.addEventListener("click", () => closeLetter());
    dom.letterReset.addEventListener("click", () => resetGame({ fromLetter: true }));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (state.letterOpen) {
          closeLetter();
        } else if (!dom.cluePop.hidden) {
          dom.cluePop.hidden = true;
        }
      }
      trapLetterFocus(event);
    });
  }

  initialize();
})();
