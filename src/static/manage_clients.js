let select_client_form = document.querySelector('#select-client-form');
let client_form_village = document.querySelector('#select-client-form #village');
let client_form_client = document.querySelector('#select-client-form #client');
let search_results_container = document.querySelector('#search-results');

async function render_village_menu(){
  const url = '/api/v1/villages';
  await fetch(url, {
    method :'GET',
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  .then((res) => {
    if (res.ok){
      console.log('OK');
      return res.json();
    }
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
    for (element of res_json){
      let client_element = document.createElement('div');
      client_element.classList.add('row');

      let client_element_id = document.createElement('div');
      client_element_id.id = 'client-id';
      client_element_id.classList.add('d-none');
      client_element_id.innerHTML = element.id;
      client_element.appendChild(client_element_id);

      let client_element_name = document.createElement('div');
      client_element_name.id = 'client-name';
      client_element_name.classList.add(['col-lg-5','fw-bolder']);
      client_element_name.innerHTML = element.name;
      client_element.appendChild(client_element_name);

      let client_element_ubication = document.createElement('div');
      client_element_ubication.id = 'client-ubication';
      client_element_ubication.classList.add(['col-lg-3','fw-bolder']);

      search_results_container.appendChild(client_element);
    }
    console.log(res_json);
  })
  .catch((err)=>{
    console.error(err.message);
  })
}})