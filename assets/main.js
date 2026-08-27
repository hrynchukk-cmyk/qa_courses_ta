// Tech Assurance — спільна логіка для всіх сторінок

// аналітика: надсилаємо кастомну подію у Vercel Web Analytics (якщо доступна)
function track(name) {
  try { if (window.va) window.va("event", { name: name }); } catch (e) {}
}
// кліки по елементах із data-va (напр. «Запланувати дзвінок», «Як це працює»)
document.addEventListener("click", function (e) {
  var el = e.target.closest ? e.target.closest("[data-va]") : null;
  if (el) track(el.getAttribute("data-va"));
});

// мобільне меню
var toggle = document.getElementById("navToggle");
var nav = document.getElementById("nav");
if (toggle && nav) {
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// форма заявки -> mailto (тема й адреса задаються через data-атрибути форми)
var form = document.querySelector("form[data-mailto]");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    track("apply_submit");
    var email = form.getAttribute("data-mailto");
    var prefix = form.getAttribute("data-subject") || "Заявка";
    var get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
    var name = get("name"), contact = get("contact"), message = get("message");
    var subject = encodeURIComponent(prefix + " — " + name);
    var body = encodeURIComponent("Ім'я: " + name + "\nКонтакт: " + contact + (message ? "\n\n" + message : ""));
    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
  });
}

// поява секцій під час скролу
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
} else {
  document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
}

// карусель відгуків (скріншоти з Telegram)
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pad2 = function (x) { return (x < 10 ? "0" : "") + x; };
  document.querySelectorAll(".carousel").forEach(function (car) {
    var track = car.querySelector(".car-track");
    var slides = car.querySelectorAll(".car-slide");
    var counter = car.querySelector(".car-counter");
    var toggle = car.querySelector(".car-toggle");
    var n = slides.length;
    if (!track || n === 0) return;
    var i = 0, timer = null, playing = false;

    function render() {
      track.style.transform = "translateX(" + (-i * 100) + "%)";
      if (counter) counter.textContent = pad2(i + 1) + " / " + pad2(n);
    }
    function go(k) { i = (k % n + n) % n; render(); }
    function start() {
      if (n < 2 || reduce || timer) return;
      timer = setInterval(function () { go(i + 1); }, 5000);
      playing = true; if (toggle) toggle.textContent = "Пауза";
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      playing = false; if (toggle) toggle.textContent = "Відтворити";
    }

    var prev = car.querySelector(".car-prev"), next = car.querySelector(".car-next");
    if (prev) prev.addEventListener("click", function () { stop(); go(i - 1); });
    if (next) next.addEventListener("click", function () { stop(); go(i + 1); });
    if (toggle) toggle.addEventListener("click", function () { playing ? stop() : start(); });
    car.addEventListener("mouseenter", function () { if (timer) { clearInterval(timer); timer = null; } });
    car.addEventListener("mouseleave", function () { if (playing) start(); });

    // свайп на тач-екранах
    var x0 = null;
    car.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { stop(); go(i + (dx < 0 ? 1 : -1)); }
      x0 = null;
    }, { passive: true });

    // один відгук — ховаємо навігацію, показуємо просто картку
    if (n < 2) {
      [prev, next, counter, toggle].forEach(function (el) { if (el) el.style.display = "none"; });
      car.style.padding = "28px 24px";
    }

    render();
    if (n > 1) start();
  });
})();
