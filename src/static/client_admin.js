let create_client_form = document.querySelector('#create-client-form');
let create_client_form_opt = document.querySelector('#create-client-form #ubication');

let url = '/api/v1/villages';
fetch(url, {
  method :'GET',
  cache : 'no-cache',
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
    create_client_form_opt.appendChild(opt_element);
  }
})
.catch((err)=>{
  console.error(err.message);
})


create_client_form.addEventListener('submit', (e) => {
  e.preventDefault();
})