let create_village_form = document.querySelector('#create-village-form');

create_village_form.addEventListener('submit', (e) => {
  e.preventDefault();
  let url = '/api/v1/villages';
  fetch(url, {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({
      'name' : document.querySelector('#create-village-form #name').value,
      'code' :  document.querySelector('#create-village-form #code').value
    })
  })
  .then((res)=>{
    if (res.ok){
      console.log('OK');
      console.log(res);
      create_village_form.reset();
    }
  })
  .catch((err)=>{
    console.error('ERROR');
    console.error(err);
  })
})