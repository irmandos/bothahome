document.addEventListener("DOMContentLoaded", function () {
  const images = document.querySelectorAll("img.lazyload");

  const loadImage = (img) => {
    img.src = img.dataset.src;
    img.classList.remove("lazyload");
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });

  images.forEach((img) => observer.observe(img));
});
