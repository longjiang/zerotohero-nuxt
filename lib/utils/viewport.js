
export const wide = () => {
  return typeof window !== "undefined" && window.innerWidth > 991;
}
// https://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment
export const documentOffsetTop = (element) => {
  return element.offsetTop +
    (element.offsetParent ? documentOffsetTop(element.offsetParent) : 0);
}
export const scrollToTargetAdjusted = (element, headerOffset, behavior = 'smooth') => {
  var elementPosition = element.getBoundingClientRect().top;
  var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior
  });
}
// https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
export const isInViewport = (element, offsetTop = 0, offsetBottom = 0) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= offsetTop &&
    rect.left >= 0 &&
    rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) - offsetBottom) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
export const elementHeight = (element, offset = 0) => {
  const rect = element.getBoundingClientRect();
  return rect.bottom - rect.top
}

/* http://hackingui.com/front-end/a-pure-css-solution-for-multiline-text-truncation/ */
export const ellipsizeTextBox = (el) => {
  var wordArray = el.innerHTML.split(' ')
  while (el.scrollHeight > el.offsetHeight) {
    wordArray.pop()
    el.innerHTML = wordArray.join(' ') + '...'
  }
}

export const portrait = () => {
  let landscape =
    typeof window !== "undefined" && window.innerWidth < window.innerHeight;
  return landscape;
}