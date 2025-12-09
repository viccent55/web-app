let startX = 0;
let startY = 0;

const touchStartHandler = (e: TouchEvent) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
};

const touchMoveHandler = (e: TouchEvent) => {
  if (
    Math.abs(e.touches[0].clientX - startX) >
    Math.abs(e.touches[0].clientY - startY)
  ) {
    e.preventDefault(); // prevent horizontal swipe
  }
};
const disableHorizontalSwipe = () => {
  document.addEventListener("touchstart", touchStartHandler, {
    passive: false,
  });
  document.addEventListener("touchmove", touchMoveHandler, {
    passive: false,
  });
};

const enableHorizontalSwipe = () => {
  document.removeEventListener("touchstart", touchStartHandler);
  document.removeEventListener("touchmove", touchMoveHandler);
};

const onStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    startY = e.touches[0].clientY;
  }
};
const onMove = (e: TouchEvent) => {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const currentY = e.touches[0].clientY;
  if (scrollY === 0 && currentY > startY) {
    e.preventDefault();
  }
};
const startMove = () => {
  window.addEventListener("touchstart", onStart);
  window.addEventListener("touchmove", onMove, { passive: false });
};
const endMove = () => {
  window.removeEventListener("touchstart", onStart);
  window.removeEventListener("touchmove", onMove);
};

export { disableHorizontalSwipe, enableHorizontalSwipe, startMove, endMove };
