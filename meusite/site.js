const btnMenu = document.getElementById("btn-menu");
const menuLateral = document.getElementById("menu-lateral");
const sliderCheckbox = document.getElementById("slider-checkbox");
const nav = document.querySelector("nav");
const footer = document.querySelector("footer");
const botaoTopo = document.getElementById("topo");

btnMenu.addEventListener("click", () => {
  menuLateral.classList.toggle("escondido");
});

sliderCheckbox.addEventListener("change", () => {
  if (sliderCheckbox.checked) {
    document.body.style.backgroundColor = "red";
    nav.style.backgroundColor = "gray";
    menuLateral.style.backgroundColor = "gray";
    footer.style.backgroundColor = "gray";
  } else {
    document.body.style.backgroundColor = "white";
    nav.style.backgroundColor = "gray";
    menuLateral.style.backgroundColor = "gray";
    footer.style.backgroundColor = "black";
  }
});

botaoTopo.addEventListener("click", function () {
  this.style.backgroundColor = "orange";
  this.style.transform = "scale(1.1)";
  setTimeout(() => {
    this.style.backgroundColor = "blue";
    this.style.transform = "scale(1)";
  }, 300);
  window.scrollTo({ top: 0, behavior: "smooth" });
});
