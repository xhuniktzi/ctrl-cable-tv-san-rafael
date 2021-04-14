const select_client_form = document.querySelector('#select-client-form');
const client_form_village = document.querySelector('#select-client-form #village');
const client_form_client = document.querySelector('#select-client-form #client');
const search_results_container = document.querySelector('#search-results');

const current_client_form = document.querySelector('#current-client-form');

const current_client_village = document.querySelector('#current-client-form #ubication');

const delete_client_button = document.querySelector('#current-client-form #delete-client');

const messages = document.querySelector('#messages');

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
    })
    .catch((err) => {
      console.error(err.message);
    });
}

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
      const alert = document.createElement('div');
      alert.classList.add('alert', 'alert-success');
      alert.setAttribute('role', 'alert');
      alert.innerHTML = `Cliente ${res_json.name} actualizado correctamente.`;
      messages.appendChild(alert);
      messages.classList.remove('d-none');
      setTimeout(() => {
        messages.innerHTML = null;
        messages.classList.add('d-none');
      }, 2000);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

delete_client_button.addEventListener('click', (e) => {
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
      current_client_form.reset();
      current_client_form.classList.add('d-none');
      current_client = 0;

      const alert = document.createElement('div');
      alert.classList.add('alert', 'alert-danger');
      alert.setAttribute('role', 'alert');
      alert.innerHTML = `Cliente ${res_json.name} eliminado correctamente.`;
      messages.appendChild(alert);
      messages.classList.remove('d-none');
      setTimeout(() => {
        messages.innerHTML = null;
        messages.classList.add('d-none');
      }, 2000);
    })
    .catch((err) => {
      console.error(err.message);
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