let create_client_form = document.querySelector('#create-client-form');
let client_form_ubication = document.querySelector('#create-client-form #ubication');
let client_form_service = document.querySelector('#create-client-form #service');

async function render_village_menu(){
  let url = '/api/v1/villages';
  await fetch(url, {
    method :'GET',
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  .then((res) => {
    if (res.ok){
      console.log('OK');
    }
    return res.json();
  })
  .then((res_json) => {
    for(element of res_json){
      let opt_element = document.createElement('option');
      opt_element.value = element.id;
      opt_element.innerHTML = element.name;
      client_form_ubication.appendChild(opt_element);
    }
  })
  .catch((err)=>{
    console.error(err.message);
  })
}

async function render_service_menu(){
  let url = '/api/v1/services';
  await fetch(url, {
    method :'GET',
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  .then((res) => {
    if (res.ok){
      console.log('OK');
    }
    return res.json();
  })
  .then((res_json) => {
    for(element of res_json){
      let opt_element = document.createElement('option');
      opt_element.value = element.id;
      opt_element.innerHTML = element.name;
      client_form_service.appendChild(opt_element);
    }
  })
  .catch((err)=>{
    console.error(err.message);
  })
}

create_client_form.addEventListener('submit', (e) => {
  e.preventDefault();
})


render_service_menu();
render_village_menu();
