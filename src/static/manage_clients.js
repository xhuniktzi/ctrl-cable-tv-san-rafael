let select_client_form = document.querySelector('#select-client-form');
let client_form_village = document.querySelector('#select-client-form #village');
let client_form_client = document.querySelector('#select-client-form #client');

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
      client_form_village.appendChild(opt_element);
    }
  })
  .catch((err)=>{
    console.error(err.message);
  })
}

render_village_menu();

select_client_form.addEventListener('submit', (e) => {{
  e.preventDefault();
  let url = '/api/v2/search/clients?';
  url = url.concat('name='+client_form_client.value+'&');
  url = url.concat('ubication_id='+client_form_village.value+'&');
  fetch(url, {
    method :'GET',
  })
  .then((res) => {
    if (res.ok){
      console.log('OK');
    }
    return res.json();
  })
  .then((res_json) => {
    console.log(res_json);
  })
  .catch((err)=>{
    console.error(err.message);
  })
}})