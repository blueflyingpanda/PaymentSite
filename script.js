//alert("TODO_0: сделать инициализацию пользователя с сервера. Если он госслужащий, то мы добавим кнопочку 'перейти в министерство'(она есть в хтмльке), которая отправит пользователя на страницу министерства (которую мы ща активно делаем. наверно). Если деловой важный человек предприниматель, то мы добавим кнопочку 'перейти в фирму' (она тоже есть в хтмл), которая отправит пользователя на страницу фирмы (которую мы тоже делаем, но не так активно).");

function lightDarkToggle (toggle) { //Отрисовщик интерфейса страницы
  if (typeof localStorage["Toggle"] != "string") {
    localStorage["Toggle"] = "true";
  }

  let h1 = document.querySelector("#info").querySelectorAll("h1");
  let h2 = document.querySelector("#info").querySelectorAll("h2");
  let li = document.querySelectorAll("li");
  let hr = document.getElementById("main-hr");
  let toggle_btn = document.getElementById("lightDarkToggle");

  if (localStorage["Toggle"] == "true") {
    toggle_btn.textContent = "🌚";
    try { hr.style.backgroundColor = "#000"; hr.style.borderColor = "#000";} catch {};
    try { for (i = 0; i < h1.length; i++) { h1[i].style.color = "#000"}} catch {}; 
    try { for (i = 0; i < h2.length; i++) { h2[i].style.color = "#000"}} catch {};
    try { for (i = 0; i < li.length; i++) { li[i].style.color = "#000"}} catch {};
    document.body.style.backgroundColor = "#fff"; document.body.animate([{opacity: 0}, {opacity: 1}], { duration: 1000});
    if (toggle) {localStorage["Toggle"] = "false"; location.reload();}
  }
  else {
    toggle_btn.textContent = "☀";
    try { hr.style.backgroundColor = "#fff"; hr.style.borderColor = "#fff";} catch {};
    try { for (i = 0; i < h1.length; i++) { h1[i].style.color = "#fff"}} catch {}; 
    try { for (i = 0; i < h2.length; i++) { h2[i].style.color = "#fff"}} catch {};
    try { for (i = 0; i < li.length; i++) { li[i].style.color = "#fff"}} catch {};
    document.body.style.backgroundColor = "#000"; document.body.animate([{opacity: 0}, {opacity: 1}], { duration: 1000});
    if (toggle) {localStorage["Toggle"] = "true"; location.reload();}
  }
}



function transferModal () { //Модалка переводов (игрок/учитель)
  let func_name = localStorage.getItem("isTeacher") == "true" ? "getTeacherSalary" : "getTransfer";
  let modal = document.createElement("div");
  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Перевод средств другому игроку</span>
      </div>
      <form id="transferForm" method="post">
        <div class="modal-body">
          <input autocomplete="off" maxlength="15" placeholder="Выберите игрока: " required>
          <input autocomplete="off" type="number" placeholder="Кол-во талиц: " required>
        </div>
        <div class="modal-footer">
          <button onclick="pinCode('${func_name}')" type="button" class="btn-orange">Подтвердить</button>
          <button onclick="modalCancel()" id="modal_cancel_id" type="button" class="btn-orange">Выйти</button>
        </div>
      </form>
    </div>
  </div>`);
}



function firmModal () { //Оплата услуг компании (игрок/учитель)
  func_name = "getPayFirm";
  let modal = document.createElement("div");
  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Оплата услуг фирмы</span>
      </div>
      <div id="modal-body" class="modal-body">
        <input autocomplete="off" maxlength="20" placeholder="Выберите фирму: " required>
        <input autocomplete="off" maxlength="20" placeholder="Выберите услугу: " required>
      </div>
      <div class="modal-footer">
        <button onclick="pinCode('${func_name}')" type="button" class="btn-orange">Подтвердить</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel()" class="btn-orange">Выйти</button>
      </div>  
    </div>
  </div>`);
}



function cashCardTransfer () { //Модалка переводов из электронных в наличные (министерство экономики)
  let modal = document.createElement("div");
  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Перевод электронных денег в наличные</span>
      </div>
      <div id="modal-body" class="modal-body">
        <input autocomplete="off" maxlength="15" placeholder="Выберите игрока: " required>
        <input autocomplete="off" type="number" placeholder="Кол-во талиц: " required>
      </div>
      <div class="modal-footer">
        <button onclick="pinCode()" type="button" class="btn-orange">Подтвердить</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel()" class="btn-orange">Выйти</button>
      </div> 
    </div>
  </div>`);
}


function editEmployees () {
  let modal = document.createElement("div");
  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Работа с сотрудниками</span>
      </div>
      <div id="modal-body" class="modal-body">
        <input autocomplete="off" maxlength="15" placeholder="Выберите игрока: " required>
        <input autocomplete="off" type="password" maxlength="15" placeholder="Подпись министра экономики: " required>
      </div>
      <div class="modal-footer">
        <button onclick="getAddEmployee()" type="button" class="btn-orange">Нанять</button>
        <button onclick="getRemoveEmployee()" type="button" class="btn-orange">Уволить</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel()" class="btn-orange">Выйти</button>
      </div> 
    </div>
  </div>`);
}


function finePlayer () { //Штрафник и отработка его долгов (юстиции)
  let modal = document.createElement("div");
  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Неуплата штрафа</span>
      </div>
      <div id="modal-body" class="modal-body">
        <input id="input_1" autocomplete="off" maxlength="32" placeholder="Выберите игрока: " name="player-name" required>
        <h2>Игрок: Пельмень Андреевич</h2>
        <span>Статус налогов на данный период:</span><span style="background-color: #fe9654; color: #000" class="modal-frame">неуплачены</span><br>
        <span>Количество штрафов:</span><span style="background-color: #fe9654; color: #000" class="modal-frame">3</span>
      </div>
      <div class="modal-footer">
        <button onclick="finePlayerFind()" type="button" class="btn-orange">Найти</button>
        <button onclick="finePlayerPay()" type="button" class="btn-orange">Отработать налоги</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel()" class="btn-orange">Выйти</button>
      </div>  
    </div>
  </div>`);
}



function taxLogs () { //Отрисовка таблицы штрафников (МВД)
  let transfer_div = document.getElementById("log-table");
  let transfer_btn = document.getElementById("transfers");
    transfer_div = document.createElement("div");
    transfer_div.classList.add("log-table");
    transfer_div.setAttribute("id", "log-table");
    document.body.append(transfer_div); //transfer_div.innerHTML += ${...};
    transfer_div.insertAdjacentHTML("afterbegin", ` 
    <h2>Здесь будут показаны все игроки, просрочившие уплату налогов за прошедшие периоды</h2>
    <hr>
    <h2>Образец:</h2>
    <h2>|Игрок|</h2>
    <h2>|Статус уплаты налога за этот период|</h2>
    <h2>|Количество штрафов|</h2>
    <hr>
    <p>|Пелмень Андреевич|</p>
    <p>|Уплачены|</p>
    <p>|2|</p>
    <hr>
    <p>|Бекмамбет Трахтенбергович|</p>
    <p>|Неуплачены|</p>
    <p>|1|</p>
    <hr>
    <p>|Баттлфилд Овервотч|</p>
    <p>|Неуплачены|</p>
    <p>|3|</p>`);
    transfer_div.animate([ {opacity: 0}, {opacity: 1}], { duration: 1000});
}



function pinCode (func_name) { //Модальное окно с вводом пароля (заново). 
  inputs = Array.from(document.querySelectorAll("input"));

  for (i = 0; i < inputs.length; i++) {
    if (inputs[i].value.length > 20 || inputs[i].value.length < 1) {
    inputs[i].style.border = "3px solid #ff483b";
    }
    else {
      inputs[i].style.border = "3px solid #3bff86"
    }
  }
  if (inputs.filter(input => input.value.length > 20) == 0 && inputs.filter(input => input.value.length < 1) == 0) {  
    let data = []
    for (i = 0; i < inputs.length; i++) {
      data.push(`'${inputs[i].value}'`);
    }
    let pin_modal = document.createElement("div");
    pin_modal.classList.add("pin-modal");
    document.body.append(pin_modal);
    pin_modal.insertAdjacentHTML("afterbegin", `    
    <div id="modal-overlay" class="modal-overlay">
      <div id="modal-window" class="modal-window">
        <div class="modal-header">
          <span class="modal-title">Подтверждение действия</span>
        </div>
        <div id="modal-body" class="modal-body">
          <input id="pin-input" type="password" autocomplete="off" maxlength="6" placeholder="Введите ваш пин-код: " name="pin-code" required>
        </div>
        <div class="modal-footer">
          <button type="button" onclick="pinCodeVerify(${func_name}, [${data}])" class="btn-orange">Подтвердить</button>
          <button id="modal_cancel_id" type="button" onclick="modalCancel()" class="btn-orange">Выйти</button>
        </div>
      </div>
    </div>`);
  }
}
function pinCodeVerify (func_name, data) { //Подтверждение пароля.
  let pinInput = document.getElementById("pin-input");
  if (pinInput.value == "228133" ) {
    func_name(data);
    modalCancel();
  }
  else {
    pinInput.style.border = "3px solid #ff483b";
  }
}



function modalCancel () { //Кнопка "Выйти" в модалках
  let modal_btn = document.querySelectorAll("#modal_cancel_id");
  for (let i = 0; i < modal_btn.length; i++) {modal_btn[i].setAttribute("disabled", "disabled");}
  let modal = document.querySelector(".modal");
  let pin_modal = document.querySelector(".pin-modal");
  let modal_animate = [
    {opacity: "1"},
    {opacity: "0"}
  ]

  if (modal != null && pin_modal != null) {
    modal.animate(modal_animate, {duration: 1000})
    pin_modal.animate(modal_animate, {duration: 1000})
    setTimeout(() => {  modal.remove(); pin_modal.remove() }, 970);
  }
  else {
    modal.animate(modal_animate, {duration: 1000})
    setTimeout(() => {  modal.remove();}, 970);
  }
}



//Жёстко заспидранил stuckoverflow за день.
