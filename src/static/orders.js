const generate_orders_form = document.querySelector('#generate-orders-form');
const orders_form_village = document.querySelector('#generate-orders-form #village');

generate_orders_form.addEventListener('submit', (e) => {
  e.preventDefault();
  const ubication_id = document.querySelector('#generate-orders-form #village').value;
  const payment_status = document.querySelector('#generate-orders-form #payment-status').value;
  const url = `/print/orders?ubication_id=${ubication_id}&payment_status=${payment_status}&`;
  window.open(url);
});

function render_village_menu(){
  const url = '/api/v1/villages';
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.ok){
        console.log(res);
        return res.json();
      }
    })
    .then((res_json) => {
      console.log(res_json);
      for (let element of res_json){
        const opt_village_element = document.createElement('option');
        opt_village_element.value = element.id;
        opt_village_element.innerHTML = element.name;
        orders_form_village.appendChild(opt_village_element);
      }
    });
}

render_village_menu();