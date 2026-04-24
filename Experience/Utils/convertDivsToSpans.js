export default function (element) {
  if (!element) return null;
  element.style.overflow = "hidden";
  element.innerHTML = element.innerText
    .split("")
    .map((char) => {
      if (char === " ") {
        return `<span>&nbsp;</span>`;
      }
      return `<span class="animate">${char}</span>`;
    })
    .join("");

  return element;
}
