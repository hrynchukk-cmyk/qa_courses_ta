// Tech Assurance — спільна логіка для всіх сторінок

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
