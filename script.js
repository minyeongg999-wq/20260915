// 진로 활동 / 동아리 카드를 클릭하면 상세 내용(PDF 또는 텍스트)을 모달로 보여줌
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('detail-modal');
  const titleEl = document.getElementById('detail-modal-title');
  const actionsEl = document.getElementById('detail-modal-actions');
  const bodyEl = document.getElementById('detail-modal-body');
  const closeBtn = document.getElementById('detail-modal-close');

  if (!modal || !titleEl || !actionsEl || !bodyEl || !closeBtn) return;

  const triggers = document.querySelectorAll('[data-pdf], [data-detail]');

  function clearModal() {
    bodyEl.innerHTML = '';
    actionsEl.innerHTML = '';
  }

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    clearModal();
    document.body.style.overflow = '';
  }

  function openPdf(pdfPath, title) {
    clearModal();
    titleEl.textContent = title;

    const iframe = document.createElement('iframe');
    iframe.className = 'detail-frame';
    iframe.src = pdfPath;
    iframe.title = title;
    bodyEl.appendChild(iframe);

    const downloadLink = document.createElement('a');
    downloadLink.href = pdfPath;
    downloadLink.setAttribute('download', '');
    downloadLink.className = 'detail-action-btn';
    downloadLink.textContent = '다운로드';
    actionsEl.appendChild(downloadLink);

    openModal();
  }

  function openTemplate(templateId, title) {
    const tpl = document.getElementById(`detail-${templateId}`);
    if (!tpl) return;

    clearModal();
    titleEl.textContent = title;
    bodyEl.appendChild(tpl.content.cloneNode(true));
    openModal();
  }

  triggers.forEach((el) => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');

    const titleNode = el.querySelector('.career-title, p');
    const titleText = titleNode ? titleNode.textContent.trim() : '상세보기';

    const handleOpen = () => {
      const pdfPath = el.getAttribute('data-pdf');
      const detailId = el.getAttribute('data-detail');
      if (pdfPath) {
        openPdf(pdfPath, titleText);
      } else if (detailId) {
        openTemplate(detailId, titleText);
      }
    };

    el.addEventListener('click', handleOpen);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
});

// 물방울들이 벽에 튕기며 움직이고, 서로 부딪치면 터지는 효과
const bubbles = [];

function createBubble(size) {
  const el = document.createElement('div');
  el.className = 'bubble';
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  document.body.appendChild(el);

  const bubble = {
    el,
    size,
    x: Math.random() * (window.innerWidth - size),
    y: Math.random() * (window.innerHeight - size),
    dx: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5),
    dy: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5),
    alive: true,
  };

  bubbles.push(bubble);
  return bubble;
}

function pop(bubble) {
  bubble.alive = false;
  bubble.el.classList.add('popping');
  setTimeout(() => {
    bubble.el.remove();
    const idx = bubbles.indexOf(bubble);
    if (idx !== -1) bubbles.splice(idx, 1);
  }, 400);
}

function moveBubbles() {
  for (const b of bubbles) {
    if (!b.alive) continue;

    b.x += b.dx;
    b.y += b.dy;

    if (b.x <= 0) {
      b.x = 0;
      b.dx = Math.abs(b.dx);
    } else if (b.x + b.size >= window.innerWidth) {
      b.x = window.innerWidth - b.size;
      b.dx = -Math.abs(b.dx);
    }

    if (b.y <= 0) {
      b.y = 0;
      b.dy = Math.abs(b.dy);
    } else if (b.y + b.size >= window.innerHeight) {
      b.y = window.innerHeight - b.size;
      b.dy = -Math.abs(b.dy);
    }

    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  }

  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i];
      const b = bubbles[j];
      if (!a.alive || !b.alive) continue;

      const ar = a.size / 2;
      const br = b.size / 2;
      const dist = Math.hypot(
        (a.x + ar) - (b.x + br),
        (a.y + ar) - (b.y + br)
      );

      if (dist < ar + br) {
        pop(a);
        pop(b);
      }
    }
  }

  requestAnimationFrame(moveBubbles);
}

[150, 110, 130].forEach(createBubble);
moveBubbles();

// 이스터에그: y 키를 누르면 물방울 10개 등장
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'y') {
    for (let i = 0; i < 10; i++) {
      createBubble(50 + Math.random() * 60);
    }
  }
});

// 이스터에그: 스페이스바를 누르면 화면의 모든 요소가 중력에 의해 떨어지고,
// 다시 누르면 원래 위치로 되돌아옴
let fallen = false;
const fallItems = [];

function applyItemStyle(item) {
  item.el.style.top = `${item.top}px`;
  item.el.style.left = `${item.left}px`;
  item.el.style.transform = `rotate(${item.rotation}deg)`;
}

function animateFall(item) {
  item.vy += 0.9;
  item.top += item.vy;
  item.left += item.vx;
  item.rotation += item.rotationSpeed;
  applyItemStyle(item);

  if (item.top < window.innerHeight + 200) {
    item.rafId = requestAnimationFrame(() => animateFall(item));
  }
}

function animateRise(item) {
  const dx = item.originalLeft - item.left;
  const dy = item.originalTop - item.top;
  const dr = -item.rotation;

  item.left += dx * 0.18;
  item.top += dy * 0.18;
  item.rotation += dr * 0.18;
  applyItemStyle(item);

  const settled = Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(dr) < 0.5;

  if (!settled) {
    item.rafId = requestAnimationFrame(() => animateRise(item));
    return;
  }

  // 원래 자리로 완전히 복귀시키고, 다시 문서 흐름(CSS)에 맡김
  item.el.style.removeProperty('position');
  item.el.style.removeProperty('margin');
  item.el.style.removeProperty('left');
  item.el.style.removeProperty('top');
  item.el.style.removeProperty('width');
  item.el.style.removeProperty('z-index');
  item.el.style.removeProperty('transform');
}

function triggerFall() {
  fallen = true;
  fallItems.length = 0;

  const elements = document.querySelectorAll(
    '.profile-photo, .name, .info-line, .section-title, .career-box, .activity-card'
  );

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();

    el.style.position = 'fixed';
    el.style.margin = '0';
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.zIndex = '5';

    const item = {
      el,
      originalTop: rect.top,
      originalLeft: rect.left,
      top: rect.top,
      left: rect.left,
      vy: 0,
      vx: (Math.random() - 0.5) * 4,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 10,
      rafId: null,
    };

    fallItems.push(item);
    animateFall(item);
  });
}

function triggerRise() {
  fallen = false;

  fallItems.forEach((item) => {
    if (item.rafId) cancelAnimationFrame(item.rafId);
    animateRise(item);
  });
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (fallen) {
      triggerRise();
    } else {
      triggerFall();
    }
  }
});

// 이스터에그: 엔터를 누르면 번개가 치고 물방울이 다 터지고 화면이 다 타버림
const lightningFlash = document.createElement('div');
lightningFlash.className = 'lightning-flash';
document.body.appendChild(lightningFlash);

const lightningBolt = document.createElement('div');
lightningBolt.className = 'lightning-bolt';
document.body.appendChild(lightningBolt);

let blackedOut = false;

function triggerLightning() {
  // 화면 플래시
  const flickers = [0, 60, 130, 200, 280, 360, 460];
  flickers.forEach((t, i) => {
    setTimeout(() => {
      lightningFlash.style.opacity = i % 2 === 0 ? '0.85' : '0';
    }, t);
  });
  setTimeout(() => {
    lightningFlash.style.opacity = '0';
  }, 550);

  // 번개 줄기
  lightningBolt.style.left = `${10 + Math.random() * 75}%`;
  lightningBolt.classList.remove('striking');
  void lightningBolt.offsetWidth;
  lightningBolt.classList.add('striking');

  // 화면 흔들림
  const wrapper = document.querySelector('.page-wrapper');
  wrapper.classList.remove('shaking');
  void wrapper.offsetWidth;
  wrapper.classList.add('shaking');

  const targets = document.querySelectorAll(
    '.profile-photo, .name, .info-line, .section-title, .career-box, .activity-card'
  );

  if (!blackedOut) {
    blackedOut = true;

    // 물방울 전부 터짐
    bubbles.forEach((b) => {
      if (b.alive) pop(b);
    });

    // 모든 요소가 새까맣게 변함
    targets.forEach((el) => {
      el.classList.remove('blackout-reverse');
      el.classList.remove('blackout');
      void el.offsetWidth;
      el.classList.add('blackout');
    });
  } else {
    blackedOut = false;

    // 다시 누르면 원래대로 되돌아옴
    targets.forEach((el) => {
      el.classList.remove('blackout');
      el.classList.remove('blackout-reverse');
      void el.offsetWidth;
      el.classList.add('blackout-reverse');
      setTimeout(() => el.classList.remove('blackout-reverse'), 800);
    });
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    triggerLightning();
  }
});
