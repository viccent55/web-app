const feedsContainer = ref<HTMLElement | null>(null);
const columnWidth = ref(230);
const gap = ref(28);
const updateColumnWidth = () => {
  if (feedsContainer.value) {
    // Use getBoundingClientRect().width for a more precise fractional value
    // and Math.floor to prevent floating point rounding errors from breaking the layout.
    const containerWidth = feedsContainer.value?.getBoundingClientRect().width;
    if (window.innerWidth <= 768) {
      gap.value = 12;
      columnWidth.value = Math.floor((containerWidth - gap.value) / 2);
    } else {
      gap.value = 28;
      columnWidth.value = 230;
    }
  }
};


export { updateColumnWidth, feedsContainer, columnWidth, gap };
