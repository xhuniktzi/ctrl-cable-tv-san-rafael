const payments_load_list = document.querySelector('#payments-load-list');
const payments_load_form = document.querySelector('#payments-load-form');
const modal_confirm_element = document.querySelector('#confirmation-modal');
const confirm_send_button = document.querySelector('#confirm-send-button');

payments_load_form.addEventListener('submit', (e) => {
  e.preventDefault();

  // eslint-disable-next-line no-undef
  let modal = new bootstrap.Modal(modal_confirm_element, {
    backdrop: 'static',
    keyboard: false
  });
  modal.show();

  
});

confirm_send_button.addEventListener('click', (e) => {
  e.preventDefault();
  let list_payments = [];
  for (let child of payments_load_list.children){
    list_payments.push({
      'client_id': child.children[0].value,
      'service_id': child.children[1].value,
      'count': child.children[8].children[0].value
    });
  }
  console.log(list_payments);
  const url = '/api/v3/massive/payments';
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(list_payments)
  })
    .then((res) => {
      if (res.ok){
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      location.reload();
    });
    
});