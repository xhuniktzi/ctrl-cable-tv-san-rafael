const printListForm = document.querySelector('#print-list-form');

printListForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ubication = printListForm.elements['village'].value;
  const url = `/print/list?ubication=${ubication}`;
  window.open(url);
});