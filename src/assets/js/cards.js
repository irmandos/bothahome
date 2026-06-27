document.addEventListener('DOMContentLoaded', () => {
  // Only apply tilt and mouse glow on devices that support hover (desktops/laptops)
  const isHoverable = window.matchMedia('(hover: hover)').matches;

  if (isHoverable) {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.

        // Update CSS custom variables for the border/glow effect
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Calculate 3D tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const offsetX = x - centerX;
        const offsetY = y - centerY;

        // Max tilt of 6 degrees for a subtle, premium look
        const maxTilt = 6;
        const rotateX = -(offsetY / centerY) * maxTilt;
        const rotateY = (offsetX / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        // Reset properties when mouse leaves
        card.style.transform = '';
        card.style.setProperty('--mouse-x', '0px');
        card.style.setProperty('--mouse-y', '0px');
      });
    });
  }
});
