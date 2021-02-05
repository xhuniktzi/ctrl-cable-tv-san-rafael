const select_client_form = document.querySelector('#select-client-form');
const client_form_village = document.querySelector('#select-client-form #village');
const client_form_client = document.querySelector('#select-client-form #client');
const search_results_container = document.querySelector('#search-results');

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
      const opt_element = document.createElement('option');
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
  search_results_container.innerHTML = null;
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
      const client_element = document.createElement('div');
      client_element.classList.add('row','m-2','p-2','border');
      search_results_container.appendChild(client_element);

      const client_element_name = document.createElement('div');
      client_element_name.classList.add('col-lg-5', 'text-center');
      client_element_name.innerHTML = element.name;
      client_element.appendChild(client_element_name);

      const client_element_ubication = document.createElement('div');
      client_element_ubication.classList.add('col-lg-3', 'text-center');
      client_element_ubication.innerHTML = element.ubication.name;
      client_element.appendChild(client_element_ubication);

      const client_element_edit = document.createElement('div');
      client_element_edit.classList.add('col-lg-2', 'd-grid', 'gap-2');
      client_element.appendChild(client_element_edit);

      const edit_button =  document.createElement('button');
      edit_button.type = 'button';
      edit_button.classList.add('btn', 'btn-sm', 'btn-primary');
      edit_button.innerHTML = 'Editar';
      edit_button.value = element.id;
      edit_button.addEventListener('click', update_client);
      client_element_edit.appendChild(edit_button);

      const client_element_delete = document.createElement('div');
      client_element_delete.classList.add('col-lg-2', 'd-grid', 'gap-2');
      client_element.appendChild(client_element_delete);

      const delete_button =  document.createElement('button');
      delete_button.type = 'button';
      delete_button.classList.add('btn', 'btn-sm', 'btn-danger');
      delete_button.innerHTML = 'Eliminar';
      delete_button.value = element.id;
      delete_button.addEventListener('click', delete_client);
      client_element_delete.appendChild(delete_button);
    }
    console.log(res_json);
  })
  .catch((err)=>{
    console.error(err.message);
  })
}})

function update_client(){
  console.log(this.value);
}

function delete_client(){
  let url = '/api/v1/clients/';
  url = url.concat(this.value);
  fetch(url, {
    method : 'DELETE',
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  .then((res)=>{
    if(res.ok){
      console.log(url);
      console.log('delete: ' + this.value);
      return res.json();
    }
  })
  .then((res_json) => {
    console.log(res_json);
  })
  .catch((err)=>{
    console.error(err.message);
  })
}
render_village_menu();