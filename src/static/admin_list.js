const printListForm = document.querySelector('#print-list-form');

printListForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ubication = printListForm.elements['village'].value;
  const service = printListForm.elements['service'].value;
  const url = `/print/list?ubication=${ubication}&service=${service}`;
  window.open(url);
});