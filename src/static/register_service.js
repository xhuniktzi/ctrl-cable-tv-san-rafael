const connect_service_form = document.querySelector('#connect-service-form');
const service_form_client = document.querySelector('#connect-service-form #client');
const service_form_village = document.querySelector('#connect-service-form #village');
const search_results_container = document.querySelector('#search-results');
const service_list_container = document.querySelector('#service-list');
const register_service_form = document.querySelector('#register-service-form');
const register_service_list = document.querySelector('#register-service-form #service');

let current_client_id = null;

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

async function render_service_menu(){
  const url = '/api/v1/services';
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
        register_service_list.appendChild(opt_element);
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

connect_service_form.addEventListener('submit', (e) => {
  e.preventDefault();
  search_results_container.innerHTML = null;
  search_results_container.classList.remove('d-none');
  service_list_container.innerHTML = null;
  service_list_container.classList.add('d-none');
  register_service_form.classList.add('d-none');
  let url = '/api/v2/search/clients?';
  url = url.concat('name=' + service_form_client.value + '&');
  url = url.concat('ubication_id=' + service_form_village.value + '&');
  fetch(url, {
    method: 'GET'
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

        const client_element_id = document.createElement('div');
        client_element_id.classList.add('col-lg-1', 'text-center');
        client_element_id.innerHTML = element.id;
        client_element.appendChild(client_element_id);

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
  search_results_container.classList.add('d-none');
  service_list_container.innerHTML = null;
  service_list_container.classList.remove('d-none');

  const url = '/api/v2/clients/' + this.value;
  current_client_id = this.value;
  fetch(url, {
    method: 'GET'
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
      }
      return res.json();
    })
    .then((res_json) => {
      register_service_form.classList.remove('d-none');
      for (let service of res_json.services){
        const service_element = document.createElement('div');
        service_element.classList.add('row', 'm-2', 'p-2', 'border');
        service_list_container.appendChild(service_element);

        const service_id = document.createElement('div');
        service_id.classList.add('col-lg-1', 'text-center');
        service_id.innerHTML = service.id;
        service_element.appendChild(service_id);

        const service_name = document.createElement('div');
        service_name.classList.add('col-lg-4', 'text-center');
        service_name.innerHTML = service.name;
        service_element.appendChild(service_name);

        const service_price = document.createElement('div');
        service_price.classList.add('col-lg-3', 'text-center');
        service_price.innerHTML = `Q. ${service.price}`;
        service_element.appendChild(service_price);
      }
      console.log(res_json);
    });
}

register_service_form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = '/api/v1/client-services';
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'client_id': current_client_id,
      'service_id': register_service_list.value,
      'price': document.querySelector('#register-service-form #service-price').value
    })
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
        console.log(res);
        register_service_form.reset();
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
});

render_service_menu();
render_village_menu();