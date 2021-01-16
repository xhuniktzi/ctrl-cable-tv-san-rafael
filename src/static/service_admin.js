let create_service_form = document.querySelector('#create-service-form');

create_service_form.addEventListener('submit', (e) => {
  e.preventDefault();
  let url = '/api/v1/services';
  fetch(url, {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({
      'name' : document.querySelector('#create-service-form #name').value,
      'code' :  document.querySelector('#create-service-form #code').value
    })
  })
  .then((res)=>{
    if (res.ok){
      console.log('OK');
      console.log(res);
      create_service_form.reset();
    }
  })
  .catch((err)=>{
    console.log('ERROR');
    console.log(err);
  })
})