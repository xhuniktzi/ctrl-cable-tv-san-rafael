const select_client_form = document.querySelector('#select-client-form');
const client_form_village = document.querySelector('#select-client-form #village');
const client_form_client = document.querySelector('#select-client-form #client');
const search_results_container = document.querySelector('#search-results');
const current_client_form = document.querySelector('#current-client-form');
const current_client_village = document.querySelector('#current-client-form #ubication');
const delete_client_button = document.querySelector('#current-client-form #delete-client');
const edit_service_button = document.querySelector('#current-client-form #service');
const payments_button = document.querySelector('#current-client-form #payments-button');
const button_container = document.querySelector('#current-client-form #button-container');
// const messages = document.querySelector('#messages');

const confirm_edit_button = document.querySelector('#confirm-edit-button');
const modal_confirm_element = document.querySelector('#confirmation-modal');
// eslint-disable-next-line no-undef
let modal_confirm = new bootstrap.Modal(modal_confirm_element, {
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

const confirm_delete_button = document.querySelector('#confirm-delete-button');
const modal_delete_element = document.querySelector('#delete-modal');
// eslint-disable-next-line no-undef
let modal_delete = new bootstrap.Modal(modal_delete_element, {
  backdrop: 'static',
  keyboard: false
});


const confirm_enable_button = document.querySelector('#confirm-enable-button');
const modal_enable_element = document.querySelector('#enable-modal');
// eslint-disable-next-line no-undef
let modal_enable = new bootstrap.Modal(modal_enable_element, {
  backdrop: 'static',
  keyboard: false
});

const confirm_disable_button = document.querySelector('#confirm-disable-button');
const modal_disable_element = document.querySelector('#disable-modal');
// eslint-disable-next-line no-undef
let modal_disable = new bootstrap.Modal(modal_disable_element, {
  backdrop: 'static',
  keyboard: false
});

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
        client_form_village.appendChild(opt_element);

        const opt_element_2 = document.createElement('option');
        opt_element_2.value = element.id;
        opt_element_2.innerHTML = element.name;
        current_client_village.appendChild(opt_element_2);
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

function select_client(){
  current_client = this.value;
  search_results_container.innerHTML = null;
  search_results_container.classList.add('d-none');

  current_client_form.reset();
  current_client_form.classList.remove('d-none');

  button_container.innerHTML = null;

  const url = `/api/v1/clients/${current_client}`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      document.querySelector('#current-client-form #name').value = res_json.name;
      document.querySelector('#current-client-form #phone').value = res_json.phone;
      document.querySelector('#current-client-form #direction').value = res_json.direction;
      document.querySelector('#current-client-form #description').value = res_json.description;

      // eslint-disable-next-line no-undef
      const date_e = dayjs(res_json.payment_date);
      console.log(date_e);
      const date_str = date_e.subtract(1, 'month').format('YYYY-MM-DD');
      console.log(date_str);
      document.querySelector('#current-client-form #payment-date').value = date_str;
      
      const end_radio = document.querySelector('#current-client-form #end-option');
      const mid_radio = document.querySelector('#current-client-form #mid-option');

      if (res_json.payment_group == 'MID'){
        mid_radio.checked = true;
        end_radio.checked = false;
      } else if (res_json.payment_group == 'END'){
        mid_radio.checked = false;
        end_radio.checked = true;
      }

      document.querySelector('#current-client-form #internet-speed').value = res_json.internet_speed;
      document.querySelector('#current-client-form #ip-address').value = res_json.ip_address;
      document.querySelector('#current-client-form #router-number').value = res_json.router_number;
      document.querySelector('#current-client-form #line-number').value = res_json.line_number;
      document.querySelector('#current-client-form #ubication').value = res_json.ubication_id;
      edit_service_button.value = current_client;

      if (res_json.status){
        const disable_button = document.createElement('button');
        disable_button.type = 'button';
        disable_button.id = 'disable-client';
        disable_button.innerHTML = 'Deshabilitar Cliente';
        disable_button.classList.add('btn', 'btn-secondary');
        button_container.appendChild(disable_button);

        disable_button.addEventListener('click', (e) => {
          e.preventDefault();
          modal_disable.show();
        });

      } else {
        const enable_button = document.createElement('button');
        enable_button.type = 'button';
        enable_button.id = 'enable-client';
        enable_button.innerHTML = 'Habilitar Cliente';
        enable_button.classList.add('btn', 'btn-success');
        button_container.appendChild(enable_button);

        enable_button.addEventListener('click', (e) => {
          e.preventDefault();
          modal_enable.show();
        });
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

confirm_enable_button.addEventListener('click', (e) => {
  e.preventDefault();

  const url = `/api/v1/clients/${current_client}`;
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'status': true
    })
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then((res_json) => {
      const query_client = select_client.bind({value: res_json.id});
      query_client();
      console.log(res_json);

      modal_enable.hide();
      modal_complete.show();
    })
    .catch((err) => {
      console.error(err.message);
      modal_enable.hide();
      modal_fail.show();
    });
});

confirm_disable_button.addEventListener('click', (e) => {
  e.preventDefault();

  const url = `/api/v1/clients/${current_client}`;
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'status': false
    })
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then((res_json) => {
      modal_disable.hide();
      modal_complete.show();

      const query_client = select_client.bind({value: res_json.id});
      query_client();
      console.log(res_json);
    })
    .catch((err) => {
      console.error(err.message);
      modal_disable.hide();
      modal_fail.show();
    });
});

edit_service_button.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(`/admin/register-service/?client_id=${current_client}`);
});

payments_button.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(`/system/payment/?client_id=${current_client}`);
});

select_client_form.addEventListener('submit', (e) => {{
  e.preventDefault();
  current_client = 0;
  search_results_container.innerHTML = null;
  search_results_container.classList.remove('d-none');
  current_client_form.reset();
  current_client_form.classList.add('d-none');

  const url = `/api/v2/search/clients?name=${client_form_client.value}&ubication_id=${client_form_village.value}&`;
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

        const client_element_name = document.createElement('div');
        client_element_name.classList.add('col-lg-4', 'text-center');
        client_element_name.innerHTML = element.name;
        client_element.appendChild(client_element_name);

        const client_element_ubication = document.createElement('div');
        client_element_ubication.classList.add('col-lg-3', 'text-center');
        client_element_ubication.innerHTML = element.ubication.name;
        client_element.appendChild(client_element_ubication);

        const client_element_select = document.createElement('div');
        client_element_select.classList.add('col-lg-2', 'd-grid', 'gap-2');
        client_element.appendChild(client_element_select);

        const select_button = document.createElement('button');
        select_button.type = 'button';
        select_button.classList.add('btn', 'btn-sm', 'btn-success');
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
}});



current_client_form.addEventListener('submit', (e) => {
  e.preventDefault();
  modal_confirm.show();
});

confirm_edit_button.addEventListener('click', (e) => {
  e.preventDefault();

  const url = `/api/v1/clients/${current_client}`;
  // eslint-disable-next-line no-undef
  const date = dayjs(document.querySelector('#current-client-form #payment-date').value);

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'name': document.querySelector('#current-client-form #name').value,
      'phone': document.querySelector('#current-client-form #phone').value,
      'direction': document.querySelector('#current-client-form #direction').value,
      'description': document.querySelector('#current-client-form #description').value,
      'payment_date': {
        'day': date.date(),
        'month': date.month(),
        'year': date.year()
      },
      'payment_group': parse_payment_radio_input(document.querySelector('#current-client-form #end-option'), document.querySelector('#current-client-form #mid-option')),
      'internet_speed': document.querySelector('#current-client-form #internet-speed').value,
      'ip_address': document.querySelector('#current-client-form #ip-address').value,
      'router_number': document.querySelector('#current-client-form #router-number').value,
      'line_number': document.querySelector('#current-client-form #line-number').value,
      'ubication_id': document.querySelector('#current-client-form #ubication').value
    })
  })
    .then((res) => {
      if (res.ok) {
        console.log('OK');
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      modal_confirm.hide();
      modal_complete.show();
    })
    .catch((err) => {
      console.error(err.message);
      modal_confirm.hide();
      modal_fail.show();
    });
  
});



delete_client_button.addEventListener('click', (e) => {
  e.preventDefault();

  modal_delete.show();
});

confirm_delete_button.addEventListener('click', (e) => {
  e.preventDefault();

  const url = `/api/v1/clients/${current_client}`;
  fetch(url, {
    method: 'DELETE',
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
      current_client_form.reset();
      current_client_form.classList.add('d-none');
      current_client = 0;

      modal_delete.hide();
      modal_complete.show();
    })
    .catch((err) => {
      console.error(err.message);
      modal_delete.hide();
      modal_fail.show();
    });
});

function parse_payment_radio_input(end_radio, mid_radio){
  if (end_radio.checked == true){
    return 'END';
  }
  if (mid_radio.checked == true){
    return 'MID';
  }
}

render_village_menu();