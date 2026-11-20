// Keep all the browser's required-field validation, then open a separate page.
const form = document.getElementById('survey-form');

form?.addEventListener('submit', (event) => {
  event.preventDefault(); // Don't send personal information through a URL.
  window.location.href = 'letter.html';
});
