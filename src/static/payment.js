const select_client_form = document.querySelector('#select-client-form');
const select_form_client = document.querySelector('#select-client-form #client');
const select_form_village = document.querySelector('#select-client-form #village');
const search_results_container = document.querySelector('#search-results');
const payment_history_container = document.querySelector('#payment-history');
// const payment_list_container = document.querySelector('#payment-list');
const payment_form_container = document.querySelector('#payment-form');
const group_payment_form = document.querySelector('#payment-form #group-payment');
const individual_payment_form = document.querySelector('#payment-form #individual-payment');
const group_payment_service = document.querySelector('#group-payment #service');
const individual_payment_service = document.querySelector('#individual-payment #service');

let current_client = 0;

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
        select_form_village.appendChild(opt_element);
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
      if (res.ok) {
        console.log('OK');
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      for (let service of res_json){
        const opt_service = document.createElement('option');
        opt_service.value = service.id;
        opt_service.innerHTML = service.name;
        individual_payment_service.appendChild(opt_service);

        const opt_service_2 = document.createElement('option');
        opt_service_2.value = service.id;
        opt_service_2.innerHTML = service.name;
        group_payment_service.appendChild(opt_service_2);
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

function fetch_payments(client){
  const url = `/api/v2/payments/${client}`;
  payment_history_container.innerHTML = null;
  payment_history_container.classList.remove('d-none');
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.ok) {
        console.log('OK');
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      for (let element of res_json){
        const payment_element = document.createElement('div');
        payment_element.classList.add('row', 'm-2', 'p-2', 'border');
        payment_history_container.appendChild(payment_element);

        const payment_element_service_code = document.createElement('div');
        payment_element_service_code.classList.add('col-lg-2', 'text-center');
        payment_element_service_code.innerHTML = element.service.name;
        payment_element.appendChild(payment_element_service_code);

        const payment_element_month = document.createElement('div');
        payment_element_month.classList.add('col-lg-2', 'text-center');
        payment_element_month.innerHTML = element.month;
        payment_element.appendChild(payment_element_month);

        const payment_element_year = document.createElement('div');
        payment_element_year.classList.add('col-lg-2', 'text-center');
        payment_element_year.innerHTML = element.year;
        payment_element.appendChild(payment_element_year);

        const payment_element_mount = document.createElement('div');
        payment_element_mount.classList.add('col-lg-2', 'text-center');
        payment_element_mount.innerHTML = element.mount;
        payment_element.appendChild(payment_element_mount);

        const payment_element_status = document.createElement('div');
        payment_element_status.classList.add('col-lg-2', 'text-center');
        payment_element_status.innerHTML = element.status;
        payment_element.appendChild(payment_element_status);

        const payment_element_service_price = document.createElement('div');
        payment_element_service_price.classList.add('col-lg-2', 'text-center');
        payment_element_service_price.innerHTML = element.service.price;
        payment_element.appendChild(payment_element_service_price);
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

select_client_form.addEventListener('submit', (e) => {
  e.preventDefault();
  payment_history_container.innerHTML = null;
  payment_history_container.classList.add('d-none');
  search_results_container.innerHTML = null;
  search_results_container.classList.remove('d-none');
  payment_form_container.classList.add('d-none');
  let url = '/api/v2/search/clients?';
  url = url.concat('name=' + select_form_client.value + '&');
  url = url.concat('ubication_id=' + select_form_village.value + '&');
  fetch(url, {
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

group_payment_form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = '/api/v2/payments';
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'client_id': current_client,
      'service_id': group_payment_service.value,
      'count': document.querySelector('#group-payment #count').value
    })
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
        return res.json();
      }
    })
    .then((res_json) => {
      document.querySelector('#group-payment form').reset();
      console.log(res_json);
      let params = '?';
      for (let param of res_json){
        console.log(param);
        params = params + 'pay=' + param.id + '&';
      }
      const url = `/print/receipt/${current_client}/`;
      window.open(url + params);
      fetch_payments(current_client);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

individual_payment_form.addEventListener('submit', (e) => {
  e.preventDefault();
});

function select_client(){
  search_results_container.innerHTML = null;
  search_results_container.classList.add('d-none');
  payment_form_container.classList.remove('d-none');
  current_client = this.value;
  fetch_payments(current_client);
}

render_village_menu();
render_service_menu();