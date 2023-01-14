function lightDarkToggle(toggle) { //Отрисовщик интерфейса страницы
  if (typeof localStorage["Toggle"] != "string") {
    localStorage["Toggle"] = "true";
  }

  let h1 = document.querySelector("#info").querySelectorAll("h1");
  let h2 = document.querySelector("#info").querySelectorAll("h2");
  let li = document.querySelectorAll("li");
  let hr = document.getElementById("main-hr");
  let toggleBtn = document.getElementById("lightDarkToggle");

  if (localStorage["Toggle"] == "true") {
    toggleBtn.textContent = "🌚";
    try { hr.style.backgroundColor = "#000"; hr.style.borderColor = "#000";} catch {};
    try { for (i = 0; i < h1.length; i++) { h1[i].style.color = "#000"}} catch {}; 
    try { for (i = 0; i < h2.length; i++) { h2[i].style.color = "#000"}} catch {};
    try { for (i = 0; i < li.length; i++) { li[i].style.color = "#000"}} catch {};
    document.body.style.backgroundColor = "#fff"; document.body.animate([{opacity: 0}, {opacity: 1}], { duration: 1200});
    if (toggle) {localStorage["Toggle"] = "false"; location.reload();}
  }
  else {
    toggleBtn.textContent = "☀";
    try { hr.style.backgroundColor = "#fff"; hr.style.borderColor = "#fff";} catch {};
    try { for (i = 0; i < h1.length; i++) { h1[i].style.color = "#fff"}} catch {}; 
    try { for (i = 0; i < h2.length; i++) { h2[i].style.color = "#fff"}} catch {};
    try { for (i = 0; i < li.length; i++) { li[i].style.color = "#fff"}} catch {};
    document.body.style.backgroundColor = "#000"; document.body.animate([{opacity: 0}, {opacity: 1}], { duration: 1200});
    if (toggle) {localStorage["Toggle"] = "true"; location.reload();}
  }
}



function checkFieldsDataSave(functionName, pinValue) { //Проверка полей на соответствие и сохранение введённых в них данных.
  inputs = Array.from(document.querySelectorAll("input"));
  if (functionName.name != "confirmPass") {
    for (i = 0; i < inputs.length; i++) {
      if (inputs[i].value.length > 20 || inputs[i].value.length < 1) {
      inputs[i].style.border = "3px solid #ff483b";
      }
      else {
        inputs[i].style.border = "3px solid #3bff86"
      }
    }
  }

  let data = [];
  for (i = 0; i < inputs.length; i++) {
    if (typeof inputs[i].value == "string") {
      data.push(`${inputs[i].value}`);
    }
    else {
      data.push(inputs[i].value);
    }
  }

  if (inputs.filter(input => input.value.length < 1) != 0) {  
    if (functionName.name != "confirmPass") {
      modalCancel(true);
      let message = "Неправильно введены данные!"
      let bcgcolor = "#fe9654";
      output(message, bcgcolor);
    }
  }
  else {
    if (pinValue) {
      pinCode(functionName, data);
    }
    else {
      functionName(data);
    }
  }
}


function pinCode(functionName, data) { //Модальное окно с вводом пин-кода (после checkFieldsDataSave).
  let dataNew = ''; //Приводим массив в порядок (добавляем кавычки, а то PinCodeVerify их съедает)
  for (i = 0; i < data.length; i++) {
    if (dataNew == '') {
      dataNew += `'${data[i]}'`;
    }
    else {
      dataNew += `, '${data[i]}'`;
    }
  }

  let pinModal = document.createElement("div");
  pinModal.classList.add("pin-modal");
  document.body.append(pinModal);
  pinModal.insertAdjacentHTML("afterbegin", `    
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Подтверждение действия</span>
      </div>
      <div id="modal-body" class="modal-body">
        <input id="pin-input" type="password" autocomplete="off" maxlength="6" placeholder="Введите ваш пин-код: " name="pin-code" required>
      </div>
      <div class="modal-footer">
        <button id="modal_cancel_id" type="button" onclick="pinCodeVerify(${functionName}, [${dataNew}])" class="btn-orange">Подтвердить</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>
    </div>
  </div>`);
}
function pinCodeVerify(functionName, data) { //Подтверждение пароля.
  let pinInput = document.getElementById("pin-input");
  if (sha256(String(pinInput.value)) == localStorage["Confirmation"]) {
    modalCancel(true);
    pinInput.style.border = "3px solid #3bff86"
    functionName(data);
  }
  else {
    pinInput.style.border = "3px solid #ff483b";
  }
}



let CONFIRM = localStorage["Confirmation"];
function confirm() { //Изменение пин-кода с подтверждением.
  let functionName = "confirmPass";
  if (CONFIRM != undefined && CONFIRM != "false") {
    functionName = `checkFieldsDataSave('${functionName}', true)`;
  }
  else {
    functionName = `checkFieldsDataSave(${functionName}, false)`
  }

  let modal = document.createElement("div");
  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Подтверждение действий</span>
      </div>
      <form id="transferForm" method="post">
        <div class="modal-body">
        <span>Придумайте пароль, с помощью которого вы будете выполнять важные действия в своём аккаунте (поставьте пробел, если он не нужен)</span>
        <input id="pin-code" autocomplete="off" maxlength="10" placeholder="Введите пароль (или пробел): ">
        </div>
        <div class="modal-footer">
          <button onclick="${functionName}" type="button" class="btn-orange">Подтвердить</button>
        </div>
      </form>
    </div>
  </div>`);
}
function confirmPass() {
  input = document.getElementById("pin-code");
  if (input.value != " ") {
    localStorage["Confirmation"] = sha256(input.value);
  }
  else {
    localStorage["Confirmation"] = false;
  }
  modalCancel(true);
  location.reload();
}



function transferModal() { //Модалка переводов (игрок/учитель)
  let header = localStorage["isTeacher"] == "true" ? "Выдача зарплаты" : "Перевод денег другому игроку";
  let functionName = localStorage["isTeacher"] == "true" ? "postTeacherSalary" : "postTransfer";
  functionName = CONFIRM != "false" ? `checkFieldsDataSave('${functionName}', true)` : `checkFieldsDataSave(${functionName}, false)`;
  let modal = document.createElement("div");

  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">${header}</span>
      </div>
      <form id="transferForm" method="post">
        <div class="modal-body">
          <input autocomplete="off" type="number" maxlength="15" placeholder="Выберите игрока: " required>
          <input id="input_2" autocomplete="off" type="number" placeholder="Кол-во талиц: " required>
        </div>
        <div class="modal-footer">
          <button id="modal_cancel_id" onclick="modalCancel(true), ${functionName}" type="button" class="btn-orange">Подтвердить</button>
          <button id="modal_cancel_id" onclick="modalCancel(true)" type="button" class="btn-orange">Выйти</button>
        </div>
      </form>
    </div>
  </div>`);

  let key = true;
  modal.addEventListener("keyup", (e) => {
    if (e.keyCode == 27 && key) {
      modalCancel(true);
      key = false;
    }
    if (e.keyCode == 13 && key) {
      Array.from(document.querySelectorAll("button")).forEach((e) => { e.textContent == "Подтвердить" ? e.click() : null});
      key = false;
    }
  })
}



function firmModal() { //Оплата услуг компании (игрок/учитель)
  let functionName = "postPayFirm";
  functionName = CONFIRM != "false" ? `checkFieldsDataSave('${functionName}', true)` : `checkFieldsDataSave(${functionName}, false)`;
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
        <input autocomplete="off" maxlength="20" placeholder="Кол-во талиц: " required>
      </div>
      <div class="modal-footer">
        <button id="modal_cancel_id" onclick="modalCancel(true), ${functionName}" type="button" class="btn-orange">Подтвердить</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>  
    </div>
  </div>`);

  let key = true;
  modal.addEventListener("keyup", (e) => {
    if (e.keyCode == 27 && key) {
      modalCancel(true);
      key = false;
    }
    if (e.keyCode == 13 && key) {
      Array.from(document.querySelectorAll("button")).forEach((e) => { e.textContent == "Подтвердить" ? e.click() : null});
      key = false;
    }
  })
}



function withdraw() { //Модалка переводов из электронных в наличные (министерство экономики)
  let modal = document.createElement("div");
  let functionName = "postWithdraw";
  functionName = CONFIRM != "false" ? `checkFieldsDataSave('${functionName}', true)` : `checkFieldsDataSave(${functionName}, false)`;


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
        <button id="withdraw" onclick="modalCancel(true), ${functionName}" type="button" class="btn-orange">Подтвердить</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div> 
    </div>
  </div>`);

  let key = true;
  modal.addEventListener("keyup", (e) => {
    if (e.keyCode == 27 && key) {
      modalCancel(true);
      key = false;
    }
    if (e.keyCode == 13 && key) {
      Array.from(document.querySelectorAll("button")).forEach((e) => { e.textContent == "Подтвердить" ? e.click() : null});
      key = false;
    }
  })
}



function editEmployees() {
  let modal = document.createElement("div");
  let functionAddEmployee = "postAddEmployee";
  let functionRemoveEmployee = "postRemoveEmployee";
  functionAddEmployee = CONFIRM != "false" ? `checkFieldsDataSave('${functionAddEmployee}', true)` : `checkFieldsDataSave(${functionAddEmployee}, false)`;
  functionRemoveEmployee = CONFIRM != "false" ? `checkFieldsDataSave('${functionRemoveEmployee}', true)` : `checkFieldsDataSave(${functionRemoveEmployee}, false)`;

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
        <button onclick="modalCancel(true), ${functionAddEmployee}" type="button" class="btn-orange">Нанять сотрудника</button>
        <button onclick="modalCancel(true), ${functionRemoveEmployee}" type="button" class="btn-orange">Уволить сотрудника</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div> 
    </div>
  </div>`);

  let key = true;
  modal.addEventListener("keyup", (e) => {
    if (e.keyCode == 27 && key) {
      modalCancel(true);
      key = false;
    }
  })
}


function finePlayer() { //Штрафник и отработка его долгов (юстиции)
  let modal = document.createElement("div");
  let functionNameTax = "postFinePlayerPay";
  functionNameTax = CONFIRM != "false" ? `checkFieldsDataSave('${functionNameTax}', true)` : `checkFieldsDataSave(${functionNameTax}, false)`;

  

  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Неуплата штрафа</span>
        <input id="input_1" autocomplete="off" type="number" maxlength="32" placeholder="Выберите игрока: " name="player-name" required>
      </div>
      <div id="modal-body" class="modal-body">
      </div>
      <div class="modal-footer">
        <button id="find-player" onclick="getFinePlayerFind()" type="button" class="btn-orange">Найти</button>
        <button id="drop-charges" onclick="${functionNameTax}" type="button" class="btn-orange" disabled>Отработать налоги и штрафы</button>
        <button id="modal_cancel_id" type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>  
    </div>
  </div>`);

  let key = true;
  let timer;
  modal.addEventListener("keyup", (e) => {
    if (!timer && e.keyCode == 13 && key) {
      document.getElementById("find-player").click();
      timer = setTimeout(() => timer = clearTimeout(timer), 1000);
    }
    if (e.keyCode == 27 && key) {
      modalCancel(true);
      key = false;
    }
  })
}



function output(message=null, bcgcolor="#fe9654") { //Оповещения
  let modalInfo = document.createElement("div");

  modalInfo.classList.add("modal-info");
  document.body.append(modalInfo);
  modalInfo.insertAdjacentHTML("afterbegin", `    
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Оповещение</span>
      </div>
      <div id="modal-body" class="modal-body">
        <span class="modal-frame" style="background-color: ${bcgcolor}">${message}<span>
      </div>
      <div class="modal-footer">
        <button id="modal_cancel_id" type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>
    </div>
  </div>`);

  let key = true;
  window.addEventListener("keyup", (e) => {
    if (e.keyCode == 27 && key) {
      modalCancel(true);
      key = false;
    }
  })
}



function modalCancel(modalClose) { //Кнопка "Выйти" в модалках
  if (modalClose) {
    let modalBtn = document.querySelectorAll("#modal_cancel_id");
    for (let i = 0; i < modalBtn.length; i++) {modalBtn[i].setAttribute("disabled", "disabled");}
  }
  let modal = document.querySelector(".modal");
  let pinModal = document.querySelector(".pin-modal");
  let modalInfo = document.querySelector(".modal-info");
  let modalAnimate = [
    {opacity: "1"},
    {opacity: "0"}
  ]

  if (modal != null) {
    modal.animate(modalAnimate, {duration: 1000})
    setTimeout(() => { modal.remove(); }, 970);
  }
  if (pinModal != null) {
    pinModal.animate(modalAnimate, {duration: 1000})
    setTimeout(() => { pinModal.remove() }, 970);
  }
  if (modalInfo != null) {
    modalInfo.animate(modalAnimate, {duration: 1000})
    setTimeout(() => { modalInfo.remove() }, 970);
  }
}