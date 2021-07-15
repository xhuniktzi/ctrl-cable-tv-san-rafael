const select_client_form = document.querySelector('#select-client-form');
const select_form_client = document.querySelector('#select-client-form #client');
const select_form_village = document.querySelector('#select-client-form #village');
const search_results_container = document.querySelector('#search-results');
const payment_history_container = document.querySelector('#payment-history');
const payment_list_container = document.querySelector('#payment-list');
const payment_form_container = document.querySelector('#payment-form');
const standard_payment_form = document.querySelector('#payment-form #standard-payment');
const parcial_payment_form = document.querySelector('#payment-form #parcial-payment');
const standard_payment_service = document.querySelector('#standard-payment #service');
const parcial_payment_service = document.querySelector('#parcial-payment #service');
const add_payment_button = document.querySelector('#add-payment');

const meta_admin = document.querySelector('meta#meta-admin');
const create_receipt_flag = document.querySelector('#check-create-receipt');

const client_info = document.querySelector('#client-info');
const payment_count_span = document.querySelector('#payment-count-span');

const confirm_standard_button = document.querySelector('#confirm-standard-button');
const modal_standard_element = document.querySelector('#standard-modal');
// eslint-disable-next-line no-undef
let modal_standard = new bootstrap.Modal(modal_standard_element, {
  backdrop: 'static',
  keyboard: false
});

const modal_complete_element = document.querySelector('#complete-modal');
// eslint-disable-next-line no-undef
let modal_complete = new bootstrap.Modal(modal_complete_element);


const modal_fail_element = document.querySelector('#fail-modal');
// eslint-disable-next-line no-undef
let modal_fail = new bootstrap.Modal(modal_fail_element, {
  backdrop: 'static',
  keyboard: false
});

let current_client = 0;
let list_payments = [];

if (!localStorage.getItem('create-receipt')){
  if (create_receipt_flag.checked){
    localStorage.setItem('create-receipt', 'True');
  } else {
    localStorage.setItem('create-receipt', 'False');
  }
} else {
  if (localStorage.getItem('create-receipt') == 'True'){
    create_receipt_flag.checked = true;
  } else {
    create_receipt_flag.checked = false;
  }
}

const query_string = window.location.search;
const url_params = new URLSearchParams(query_string);

if (url_params.has('client_id')){
  const client_id = url_params.get('client_id');
  const query_client = select_client.bind({value: client_id});
  query_client();
}

create_receipt_flag.addEventListener('change', () => {
  if (create_receipt_flag.checked){
    localStorage.setItem('create-receipt', 'True');
  } else {
    localStorage.setItem('create-receipt', 'False');
  }
});

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

function render_service_menu(client){
  parcial_payment_service.innerHTML = null;
  standard_payment_service.innerHTML = null;
  const url = `/api/v2/clients/${client}`;
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
      for (let service of res_json.services){
        const opt_service = document.createElement('option');
        opt_service.value = service.id;
        opt_service.innerHTML = service.name;
        parcial_payment_service.appendChild(opt_service);

        const opt_service_2 = document.createElement('option');
        opt_service_2.value = service.id;
        opt_service_2.innerHTML = service.name;
        standard_payment_service.appendChild(opt_service_2);
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
  payment_list_container.innerHTML = null;
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
        payment_element.classList.add('row', 'p-2', 'border', 'fw-bold');
        payment_history_container.appendChild(payment_element);

        const payment_element_date = document.createElement('div');
        payment_element_date.classList.add('col-lg-1', 'text-center');
        payment_element_date.innerHTML = `${element.date.day}/${element.date.month}/${element.date.year}`;
        payment_element.appendChild(payment_element_date);

        const payment_element_service_name = document.createElement('div');
        payment_element_service_name.classList.add('col-lg-3', 'text-center');
        payment_element_service_name.innerHTML = element.service.name;
        payment_element.appendChild(payment_element_service_name);

        const payment_element_dateinfo = document.createElement('div');
        payment_element_dateinfo.classList.add('col-lg-2', 'text-center');
        payment_element_dateinfo.innerHTML = `${element.month}/${element.year}`;
        payment_element.appendChild(payment_element_dateinfo);

        const payment_element_mount = document.createElement('div');
        payment_element_mount.classList.add('col-lg-2', 'text-center');
        payment_element_mount.innerHTML = `Q. ${element.mount}`;
        payment_element.appendChild(payment_element_mount);

        if (element.status){
          payment_element.classList.add('bg-success', 'bg-gradient');
        } else {
          payment_element.classList.add('bg-warning', 'bg-gradient');
        }

        const payment_element_service_price = document.createElement('div');
        payment_element_service_price.classList.add('col-lg-2', 'text-center');
        payment_element_service_price.innerHTML = `Q. ${element.service.price}`;
        payment_element.appendChild(payment_element_service_price);

        if (meta_admin.getAttribute('content') == 'yes'){
          const payment_element_delete = document.createElement('div');
          payment_element_delete.classList.add('col-lg-2', 'd-grid', 'gap-2');
          payment_element.appendChild(payment_element_delete);

          const delete_button = document.createElement('button');
          delete_button.type = 'button';
          delete_button.classList.add('btn', 'btn-sm', 'btn-danger');
          delete_button.innerHTML = 'Anular';
          delete_button.value = element.id;
          delete_button.addEventListener('click', delete_payment);
          payment_element_delete.appendChild(delete_button);
        }
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

select_client_form.addEventListener('submit', (e) => {
  e.preventDefault();
  list_payments.splice(0, list_payments.length);

  payment_history_container.innerHTML = null;
  payment_history_container.classList.add('d-none');
  search_results_container.innerHTML = null;
  search_results_container.classList.remove('d-none');
  payment_form_container.classList.add('d-none');
  client_info.innerHTML = null;
  client_info.classList.add('d-none');
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
        client_element.classList.add('row', 'p-2', 'border');
        search_results_container.appendChild(client_element);

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

standard_payment_form.addEventListener('submit', (e) => {
  e.preventDefault();
  payment_count_span.innerHTML = document.querySelector('#standard-payment #count').value;
  modal_standard.show();
});

confirm_standard_button.addEventListener('click', (e) => {
  e.preventDefault();

  const url = '/api/v2/payments';
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'client_id': current_client,
      'service_id': standard_payment_service.value,
      'count': document.querySelector('#standard-payment #count').value
    })
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
        return res.json();
      }
    })
    .then((res_json) => {
      modal_standard.hide();
      modal_complete.show();

      let service_value = standard_payment_service.value;
      document.querySelector('#standard-payment form').reset();
      console.log(res_json);
      
      e.preventDefault();
      let count = 0;
      // eslint-disable-next-line no-unused-vars
      for (let param of res_json){
        count = count + 1;
      }
      fetch_payments(current_client);
      if (localStorage.getItem('create-receipt') == 'True'){
        const url = `/print/standard-receipt/${current_client}/${service_value}/${count}`;
        window.open(url);
      }
      
      
    })
    .catch((err) => {
      console.error(err.message);
      modal_standard.hide();
      modal_fail.show();
    });
});

add_payment_button.addEventListener('click', (e) => {
  e.preventDefault();
  let element = {
    'service_id': document.querySelector('#parcial-payment #service').value,
    'mount': document.querySelector('#parcial-payment #mount').value,
    'month': document.querySelector('#parcial-payment #month').value,
    'year': document.querySelector('#parcial-payment #year').value
  };
  list_payments.push(element);

  const payment_element = document.createElement('div');
  payment_element.classList.add('row', 'p-2', 'border');
  payment_list_container.appendChild(payment_element);

  const payment_element_service_name = document.createElement('div');
  payment_element_service_name.classList.add('col-lg-2', 'text-center');
  const select_service = document.querySelector('#parcial-payment #service');
  const select_service_text = select_service.options[select_service.selectedIndex].innerText;
  payment_element_service_name.innerHTML = select_service_text;
  payment_element.appendChild(payment_element_service_name);

  const payment_element_mount = document.createElement('div');
  payment_element_mount.classList.add('col-lg-2', 'text-center');
  payment_element_mount.innerHTML = element.mount;
  payment_element.appendChild(payment_element_mount);

  const payment_element_month = document.createElement('div');
  payment_element_month.classList.add('col-lg-2', 'text-center');
  const select_month = document.querySelector('#parcial-payment #month');
  const select_month_text = select_month.options[select_month.selectedIndex].innerText;
  payment_element_month.innerHTML = select_month_text;
  payment_element.appendChild(payment_element_month);

  const payment_element_year = document.createElement('div');
  payment_element_year.classList.add('col-lg-2', 'text-center');
  payment_element_year.innerHTML = element.year;
  payment_element.appendChild(payment_element_year);

  document.querySelector('#parcial-payment form').reset();
});

parcial_payment_form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = `/api/v2/payments/${current_client}`;
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(list_payments)
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
        list_payments.splice(0, list_payments.length);
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      let params = '?';
      for (let param of res_json){
        console.log(param);
        params = params + 'pay=' + param.id + '&';
      }
      if (localStorage.getItem('create-receipt') == 'True'){
        const url = `/print/parcial-receipt/${current_client}${params}`;
        window.open(url);
      }
      fetch_payments(current_client);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

function select_client(){
  list_payments.splice(0, list_payments.length);
  search_results_container.innerHTML = null;
  search_results_container.classList.add('d-none');
  payment_form_container.classList.remove('d-none');
  client_info.innerHTML = null;
  client_info.classList.remove('d-none');
  current_client = this.value;
  fetch_payments(current_client);
  render_service_menu(current_client);

  const url = `/api/v2/clients/${current_client}`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.ok){
        return res.json();
      }
    })
    .then((res_json) => {
      const client_name_label = document.createElement('span');
      client_name_label.classList.add('m-3', 'fs-4', 'fw-bold');
      client_name_label.innerHTML = 'Nombre: ';
      client_info.appendChild(client_name_label);

      const client_name = document.createElement('span');
      client_name.classList.add('m-3', 'fs-4');
      client_name.innerHTML = res_json.name;
      client_info.appendChild(client_name);

      const client_village_label = document.createElement('span');
      client_village_label.classList.add('m-3', 'fs-4', 'fw-bold');
      client_village_label.innerHTML = 'Aldea: ';
      client_info.appendChild(client_village_label);

      const client_village = document.createElement('span');
      client_village.classList.add('m-3', 'fs-4');
      client_village.innerHTML = res_json.ubication.name;
      client_info.appendChild(client_village);
    });
}

function delete_payment(){
  const url = `/api/v2/payments/${this.value}`;
  fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }})
    .then((res) => {
      if (res.ok){
        console.log('OK');
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      fetch_payments(current_client);
    })
    .catch((err) => {
      console.error(err.message);
    });
}

render_village_menu();