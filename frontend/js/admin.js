
function login(){
  fetch('https://YOUR_BACKEND_URL/admin/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({password:document.getElementById('password').value})
  }).then(r=>r.json()).then(d=>{
    if(d.success) document.getElementById('panel').style.display='block';
  })
}

function add(){
  fetch('https://YOUR_BACKEND_URL/admin/add-product',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      name:document.getElementById('name').value,
      price:document.getElementById('price').value
    })
  })
}
