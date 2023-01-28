function lightDarkToggle(toggle) { //Отрисовщик интерфейса страницы
  if (typeof localStorage["Toggle"] != "string") {
    localStorage["Toggle"] = "true";
  }

  let h1 = document.querySelector(".main").querySelectorAll("h1");
  let h2 = document.querySelector(".main").querySelectorAll("h2");
  let li = document.querySelectorAll("li");
  let hr = document.querySelectorAll("#main-hr");
  let toggleBtn = document.getElementById("lightDarkToggle");

  if (localStorage["Toggle"] == "true") {
    try { toggleBtn.textContent = "🌚" } catch {};
    try { hr.forEach((hr) => { hr.style.backgroundColor = "#000"; hr.style.borderColor = "#000";})} catch {};
    try { for (i = 0; i < h1.length; i++) { h1[i].style.color = "#000"}} catch {}; 
    try { for (i = 0; i < h2.length; i++) { h2[i].style.color = "#000"}} catch {};
    try { for (i = 0; i < li.length; i++) { li[i].style.color = "#000"}} catch {};
    document.body.style.backgroundColor = "#fff"; 
    if (toggle) {localStorage["Toggle"] = "false"; location.reload();}
  }
  else {
    try { toggleBtn.textContent = "☀"; } catch {};
    try { hr.forEach((hr) => { hr.style.backgroundColor = "#fff"; hr.style.borderColor = "#fff";})} catch {};
    try { for (i = 0; i < h1.length; i++) { h1[i].style.color = "#fff"}} catch {}; 
    try { for (i = 0; i < h2.length; i++) { h2[i].style.color = "#fff"}} catch {};
    try { for (i = 0; i < li.length; i++) { li[i].style.color = "#fff"}} catch {};
    document.body.style.backgroundColor = "#000"; 
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
        <button type="button" onclick="pinCodeVerify(${functionName}, [${dataNew}])" class="btn-orange">Подтвердить</button>
        <button type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
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
    functionName = `checkFieldsDataSave(${functionName}, false)`;
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
        <span>Придумайте пин-код, с помощью которого вы будете выполнять важные действия в своём аккаунте (поставьте пробел, если он не нужен)</span>
        <input id="pin-code" autocomplete="off" maxlength="10" placeholder="Введите пароль (или пробел): ">
        </div>
        <div class="modal-footer">
          <button onclick="${functionName}" type="button" class="btn-orange">Подтвердить</button>
        </div>
      </form>
    </div>
  </div>`);

  window.addEventListener("keydown", (e) => {
    if (e.keyCode == 27) {
      localStorage["Confirmation"] = "false";
    }
  }, {once: true})
}
function confirmPass() {
  input = document.getElementById("pin-code");
  if (input.value != " ") {
    localStorage["Confirmation"] = sha256(input.value);
  }
  else {
    localStorage["Confirmation"] = "false";
  }
  modalCancel(true);
  location.reload();
}



function transferModal() { //Модалка переводов (игрок/учитель)
  let header = localStorage["Role"] == "teacher" ? "Выдача зарплаты" : "Перевод денег другому игроку";
  let functionName = localStorage["Role"] == "teacher" ? "postTeacherSalary" : "postTransfer";
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
          <input id="transfer-input" autocomplete="off" type="number" maxlength="15" placeholder="Введите ИНН игрока: " required>
          <input autocomplete="off" type="number" placeholder="Кол-во талиц: " required>
        </div>
        <div class="modal-footer">
          <button onclick="modalCancel(true), ${functionName}" type="button" class="btn-orange">Подтвердить</button>
          <button onclick="modalCancel(true)" type="button" class="btn-orange">Выйти</button>
        </div>
      </form>
    </div>
  </div>`);
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
        <button onclick="modalCancel(true), ${functionName}" type="button" class="btn-orange">Подтвердить</button>
        <button type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>  
    </div>
  </div>`);
}



function moneyTransit() { //Модалка переводов из электронных в наличные (министерство экономики)
  let modal = document.createElement("div");
  let functionNameWithdraw = "postWithdraw";
  let functionNameDeposit = "postDeposit";
  functionNameWithdraw = CONFIRM != "false" ? `checkFieldsDataSave('${functionNameWithdraw}', true)` : `checkFieldsDataSave(${functionNameWithdraw}, false)`;
  functionNameDeposit = CONFIRM != "false" ? `checkFieldsDataSave('${functionNameDeposit}', true)` : `checkFieldsDataSave(${functionNameDeposit}, false)`;

  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Перевод денег</span>
      </div>
      <div id="modal-body" class="modal-body">
        <input autocomplete="off" maxlength="15" placeholder="Выберите игрока: " required>
        <input autocomplete="off" type="number" placeholder="Кол-во талиц: " required>
      </div>
      <div class="modal-footer">
        <button onclick="modalCancel(true), ${functionNameWithdraw}" type="button" class="btn-orange">Снять</button>
        <button onclick="modalCancel(true), ${functionNameDeposit}" type="button" class="btn-orange">Внести</button>
        <button type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div> 
    </div>
  </div>`);
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
        <button type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div> 
    </div>
  </div>`);
}


function finePlayer() { //Штрафник и отработка его долгов (юстиции и экономика)
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
        <input id="fine-input" autocomplete="off" type="number" maxlength="32" placeholder="Выберите игрока: " name="player-name" required>
      </div>
      <div id="modal-body" class="modal-body">
      </div>
      <div class="modal-footer">
        <button id="find-player" onclick="getFinePlayerFind()" type="button" class="btn-orange">Найти</button>
        <button id="drop-charges" onclick="${functionNameTax}" type="button" class="btn-orange" disabled>Отработать налоги и штрафы</button>
        <button type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>  
    </div>
  </div>`);
}



function allLogs() { //Штрафник и отработка его долгов (юстиции и экономика)
  let modal = document.createElement("div");
  let functionName = "getAllLogs";
  functionName = CONFIRM != "false" ? `checkFieldsDataSave('${functionName}', true)` : `checkFieldsDataSave(${functionName}, false)`;

  modal.classList.add("modal");
  document.body.append(modal);
  modal.insertAdjacentHTML("afterbegin", `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Системные логи</span>
        <input id="logs-input" autocomplete="off" type="number" maxlength="32" placeholder="Количество выводимых строк: " required>
      </div>
      <div id="modal-body" class="modal-body">
      </div>
      <div class="modal-footer">
        <button onclick="modalCancel(true), ${functionName}" type="button" class="btn-orange">Найти</button>
        <button type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>  
    </div>
  </div>`);
}



function memoMVD() {
  let modalInfo = document.createElement("div");

  modalInfo.classList.add("modal-info");
  document.body.append(modalInfo);
  modalInfo.insertAdjacentHTML("afterbegin", `    
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Памятка</span>
      </div>
      <div id="modal-body" class="modal-body">
        <span>Для того, чтобы опознавать уклонистов среди игроков, обращайте внимание на цвет экрана игрока. Это важно!<br>
              Экран игроков, уплативших налоги и неимеющих штрафы, имеет белый или чёрный цвет.</span><br>
        <span>Не уплатил налог:</span><br><span class="modal-frame" style="background-color: #4B0082; color: #fff"">цвет экрана</span><br>
        <span>Имеется штраф:</span><br><span class="modal-frame" style="background-color: #FF69B4; color: #fff"">цвет экрана</span><br>
        <span>Не уплатил налог и имеется штраф:</span><br><span class="modal-frame" style="background-color: #DC143C; color: #fff"">цвет экрана</span><br>
        <span>Советы по поимке уклонистов:<br>
              1. Просите игроков обновлять страницу. Особенно просите тех, у кого стандартная тема сайта (белая/чёрная)<br>
              2. Начало ссылки сайта должно соответсвовать костяку, указаному ниже:</span><br>
                  Костяк ссылки:<br>
                <span class="modal-frame" style="background-color: #8A2BE2; color: #fff">"blueflyingpanda.github.io"</span><br>
              3. Ищите уклонистов в заполненных людьми местах.<br>
              4. Бить всех и вся ;3
      </div>
      <div class="modal-footer">
        <button type="button" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
      </div>
    </div>
  </div>`);
}



function output(message=null, bcgcolor="#fe9654") { //Оповещения
  let modalInfo = document.createElement("div");

  modalInfo.classList.add("modal-info");
  document.body.append(modalInfo);
  modalInfo.insertAdjacentHTML("afterbegin", `    
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-window" class="modal-window" style="border-color: ${bcgcolor}">
      <div class="modal-header">
        <span class="modal-title">Оповещение</span>
      </div>
      <div id="modal-body" class="modal-body">
        <span class="modal-frame" style="background-color: ${bcgcolor}; color: #fff;">${message}<span>
      </div>
      <div class="modal-footer">
        <button type="button" onclick="modalCancel(true)" class="btn-orange" style="background-color: ${bcgcolor}">Выйти</button>
      </div>
    </div>
  </div>`);
}



function modalCancel(modalClose) { //Кнопка "Выйти" в модалках
  if (modalClose) {
    let modalBtn = document.querySelectorAll("button");
    for (let i = 0; i < modalBtn.length; i++) {
      modalBtn[i].setAttribute("disabled", "disabled");
      setTimeout(() => {
        modalBtn[i].removeAttribute("disabled");
      }, 1000);
    }
  }
  let modals = Array.from(document.querySelectorAll(".modal"));
  let modalWindows = Array.from(document.querySelectorAll(".modal-window"));
  let pinModals = Array.from(document.querySelectorAll(".pin-modal"));
  let modalsInfo = Array.from(document.querySelectorAll(".modal-info"));
  let modalAnimate = [
    {opacity: 1},
    {opacity: 0}
  ]
  let modalWindowAnimate = [
    {transform: "translateY(0px)"},
    {transform: "translateY(100vh)"}
  ]
  let modalAnimateOptions = {
    duration: 1000,
    easing: "cubic-bezier(1,0,.4,1)",
  }

  if (modals != 0) {
    modals.forEach((modal) => {modal.animate(modalAnimate, {duration: 1000 })});
    modalWindows.forEach((modal) => {modal.animate(modalWindowAnimate, modalAnimateOptions)});
    modals.forEach((modal) => {setTimeout(() => {modal.remove();}, 970)});
  }
  if (pinModals != 0) {
    pinModals.forEach((modal) => {modal.animate(modalAnimate, {duration: 1000})});
    modalWindows.forEach((modal) => {modal.animate(modalWindowAnimate, modalAnimateOptions)});
    pinModals.forEach((modal) => {setTimeout(() => {modal.remove();}, 970)});
  }
  if (modalsInfo != 0) {
    modalsInfo.forEach((modal) => {modal.animate(modalAnimate, {duration: 1000})});
    modalWindows.forEach((modal) => { modal.animate(modalWindowAnimate, modalAnimateOptions)});
    modalsInfo.forEach((modal) => {setTimeout(() => {modal.remove();}, 970)});
  }
}




window.addEventListener("keydown", keydownCheck, false);
let timer;
function blockKeydown(e) {
  if (e.keyCode) {
    e.preventDefault();
  }
}
function keydownCheck(e) { //e.keyCode == 126
  if (e.keyCode == 9 ||
      e.keyCode == 13 ||
      e.keyCode == 18) {
    e.preventDefault();
    document.activeElement.blur();
  }
  else if (!timer && e.keyCode == 27) {
    document.activeElement.blur();
    modalCancel(true);
    timer = setTimeout(() => timer = clearTimeout(timer), 1000);
  }
}

document.body.addEventListener("animationstart", (e) => {
  window.removeEventListener("keydown", keydownCheck, false);
  window.addEventListener("keydown", blockKeydown, false);
})
document.body.addEventListener("animationend", (e) => {
  window.addEventListener("keydown", keydownCheck, false);
  window.removeEventListener("keydown", blockKeydown, false);
})