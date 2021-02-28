const create_service_form = document.querySelector('#create-service-form');
const service_flag_checkbox = document.querySelector('#service-flag');

create_service_form.addEventListener('submit', (e) => {
  e.preventDefault();
  let url = '/api/v1/services';
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'name': document.querySelector('#create-service-form #name').value,
      'code': document.querySelector('#create-service-form #code').value,
      'status': service_flag_checkbox.checked
    })
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
        console.log(res);
        create_service_form.reset();
      }
    })
    .catch((err) => {
      console.error('ERROR');
      console.error(err);
    });
});