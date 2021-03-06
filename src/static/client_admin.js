const create_client_form = document.querySelector('#create-client-form');
const client_form_ubication = document.querySelector('#create-client-form #ubication');
const client_form_service = document.querySelector('#create-client-form #service-id');
const confirm_create_button = document.querySelector('#confirm-create-button');

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

async function render_village_menu(){
  let url = '/api/v1/villages';
  await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
      }
      return res.json();
    })
    .then((res_json) => {
      for (let element of res_json){
        let opt_element = document.createElement('option');
        opt_element.value = element.id;
        opt_element.innerHTML = element.name;
        client_form_ubication.appendChild(opt_element);
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

async function render_service_menu(){
  let url = '/api/v1/services';
  await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.ok){
        console.log('OK');
      }
      return res.json();
    })
    .then((res_json) => {
      for (let element of res_json){
        let opt_element = document.createElement('option');
        opt_element.value = element.id;
        opt_element.innerHTML = element.name;
        client_form_service.appendChild(opt_element);
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

render_service_menu();
render_village_menu();

create_client_form.addEventListener('submit', (e) => {
  e.preventDefault();
  modal_confirm.show();
});

confirm_create_button.addEventListener('click', (e) => {
  e.preventDefault();

  // eslint-disable-next-line no-undef
  let date = dayjs(document.querySelector('#create-client-form #payment-date').value);
  console.log(date);
  console.log(`${date.date()}/${date.month()}/${date.year()}`);
  let url_clients = '/api/v1/clients';
  fetch(url_clients, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'name': document.querySelector('#create-client-form #name').value,
      'phone': document.querySelector('#create-client-form #phone').value,
      'direction': document.querySelector('#create-client-form #direction').value,
      'description': document.querySelector('#create-client-form #description').value,
      'payment_date': {
        'day': date.date(),
        'month': date.month(),
        'year': date.year()
      },
      'payment_group': parse_payment_radio_input(document.querySelector('#create-client-form #end-option'), document.querySelector('#create-client-form #mid-option')),
      'internet_speed': document.querySelector('#create-client-form #internet-speed').value,
      'ip_address': document.querySelector('#create-client-form #ip-address').value,
      'router_number': document.querySelector('#create-client-form #router-number').value,
      'line_number': document.querySelector('#create-client-form #line-number').value,
      'ubication_id': document.querySelector('#create-client-form #ubication').value
    })
  })
    .then((res) => {
      if (res.ok){
        console.log('Client is OK');
        console.log(res);
        return res.json();
      }
    })
    .then((res_json) => {
      let url_services = '/api/v1/client-services';
      fetch(url_services, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'client_id': res_json.id,
          'service_id': document.querySelector('#create-client-form #service-id').value,
          'price': document.querySelector('#create-client-form #service-price').value
        })
      })
        .then((res) => {
          if (res.ok){
            console.log('Service is OK');
            console.log(res);
            create_client_form.reset();
            modal_confirm.hide();
            modal_complete.show();
          }
        });
    })
    .catch((err) => {
      console.error('ERROR');
      console.error(err);
      modal_confirm.hide();
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