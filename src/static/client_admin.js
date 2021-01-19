let create_client_form = document.querySelector('#create-client-form');
let client_form_ubication = document.querySelector('#create-client-form #ubication');
let client_form_service = document.querySelector('#create-client-form #service-id');

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
      client_form_ubication.appendChild(opt_element);
    }
  })
  .catch((err)=>{
    console.error(err.message);
  })
}

async function render_service_menu(){
  let url = '/api/v1/services';
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
      client_form_service.appendChild(opt_element);
    }
  })
  .catch((err)=>{
    console.error(err.message);
  })
}

render_service_menu();
render_village_menu();

create_client_form.addEventListener('submit', (e) => {
  e.preventDefault();
  let url = '/api/v1/clients';
  fetch(url , {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({
      'name' : document.querySelector('#create-client-form #name').value,
      'phone' : document.querySelector('#create-client-form #phone').value,
      'direction' : document.querySelector('#create-client-form #direction').value,
      'description' : document.querySelector('#create-client-form #description').value,
      'payment_date' : {
        'day' : new Date(document.querySelector('#create-client-form #payment-date').value).getDate()+1,
        'month' : new Date(document.querySelector('#create-client-form #payment-date').value).getMonth()+1,
        'year' : new Date(document.querySelector('#create-client-form #payment-date').value).getFullYear()
      },
      'payment_group' : parse_payment_radio_input(document.querySelector('#create-client-form #end-option'), document.querySelector('#create-client-form #mid-option')),
      'internet_speed' : document.querySelector('#create-client-form #internet-speed').value,
      'ip_address' : document.querySelector('#create-client-form #ip-address').value,
      'router_number' : document.querySelector('#create-client-form #router-number').value,
      'line_number' : document.querySelector('#create-client-form #line-number').value,
      'ubication_id' : document.querySelector('#create-client-form #ubication').value,
      'service' : {
        'id' : document.querySelector('#create-client-form #service-id').value,
        'price' : document.querySelector('#create-client-form #service-price').value
      }
    })
  })
  .then((res) => {
    if (res.ok){
      console.log('OK');
      console.log(res);
      create_client_form.reset();
    }
  })
  .catch((err)=>{
    console.error('ERROR');
    console.error(err);
  })
})


function parse_payment_radio_input(end_radio, mid_radio){
  if (end_radio.checked == true){
    return 'END';
  }
  if (mid_radio.checked == true){
    return 'MID';
  }
}