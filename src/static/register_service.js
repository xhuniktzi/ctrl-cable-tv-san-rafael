const connect_service_form = document.querySelector('#connect-service-form');
const service_form_client = document.querySelector('#connect-service-form #client');
const service_form_village = document.querySelector('#connect-service-form #village');

const search_results_container = document.querySelector('#search-results');
const service_list_container = document.querySelector('#service-list');

async function render_village_menu(){
  const url = '/api/v1/villages';
  await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
        return res.json();
      }
    })
    .then((res_json) => {
      for (let element of res_json){
        const opt_element = document.createElement('option');
        opt_element.value = element.id;
        opt_element.innerHTML = element.name;
        service_form_village.appendChild(opt_element);
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

connect_service_form.addEventListener('submit', (e) => {
  e.preventDefault();
  search_results_container.innerHTML = null;
  let url = '/api/v2/search/clients?';
  url = url.concat('name=' + service_form_client.value + '&');
  url = url.concat('ubication_id=' + service_form_village.value + '&');
  fetch(url, {
    method: 'GET',
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
      }
      return res.json();
    })
    .then((res_json) => {
      for (let element of res_json){
        const client_element = document.createElement('div');
        client_element.classList.add('row', 'm-2', 'p-2', 'border');
        search_results_container.appendChild(client_element);

        const client_element_code = document.createElement('div');
        client_element_code.classList.add('col-lg-1', 'text-center');
        client_element_code.innerHTML = element.id;
        client_element.appendChild(client_element_code);

        const client_element_name = document.createElement('div');
        client_element_name.classList.add('col-lg-4', 'text-center');
        client_element_name.innerHTML = element.name;
        client_element.appendChild(client_element_name);

        const client_element_ubication = document.createElement('div');
        client_element_ubication.classList.add('col-lg-4', 'text-center');
        client_element_ubication.innerHTML = element.ubication.name;
        client_element.appendChild(client_element_ubication);

        const client_element_select = document.createElement('div');
        client_element_select.classList.add('col-lg-2', 'd-grid', 'gap-2');
        client_element.appendChild(client_element_select);

        const select_button = document.createElement('button');
        select_button.type = 'button';
        select_button.classList.add('btn', 'btn-sm', 'btn-primary');
        select_button.innerHTML = 'Seleccionar';
        select_button.value = element.id;
        select_button.addEventListener('click', select_client);
        client_element_select.appendChild(select_button);
      }
      console.log(res_json);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

function select_client(){
  search_results_container.innerHTML = null;
  const service_element = document.createElement('div');
  service_list_container.appendChild(service_element);
  
  
}

render_village_menu();