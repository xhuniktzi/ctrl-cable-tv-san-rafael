const massiveLoadForm = document.querySelector('#massive-load-form');

massiveLoadForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ubication = massiveLoadForm.elements['village'].value;
  const service = massiveLoadForm.elements['service'].value;
  const url = `/internal/massive?ubication=${ubication}&service=${service}`;
  window.location.href =url;
});