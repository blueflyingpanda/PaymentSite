alert("TODO_0: сделать инициализацию пользователя с сервера. Если он госслужащий, то мы добавим кнопочку 'перейти в министерство'(она есть в хтмльке), которая отправит пользователя на страницу министерства (которую мы ща активно делаем. наверно). Если деловой важный человек предприниматель, то мы добавим кнопочку 'перейти в фирму' (она тоже есть в хтмл), которая отправит пользователя на страницу фирмы (которую мы тоже делаем, но не так активно).");

function nalogi() {
    //Добавление кода на страницу
    let modal = document.createElement("div");
    modal.classList.add("modal");
    document.body.append(modal);
    modal.insertAdjacentHTML("afterbegin", `
  <div class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Уплата налогов</span>
      </div>
      <div class="modal-body">
      </div>
      <div class="modal-footer">
        <button id="modal_cancel_id" onclick="modal_cancel()" class="btn-orange">Выйти</button>
      </div>
    </div>
  </div>`)

    alert("Уплачены/неуплачены (Если 1 => уплачены, иначе => неуплачены) TODO_1: сделать в зависимости от значения на сервере вывод статуса налогов. В случае неуплаты при нажатии на 'Уплатить' значение на сервере изменится.");
    let taxes = prompt("Вы уплатили налоги?");
    let modalTaxes = document.querySelector(".modal-body"),
        modalTaxesFooter = document.querySelector(".modal-footer");
    if (taxes == "1") {
        modalTaxes.insertAdjacentHTML("afterbegin", `<span class="modal-nalogi" style="background-color: #599d36">Налоги уплачены</span>`);
        modalTaxesFooter.insertAdjacentHTML("afterbegin", `<button type="button" class="btn-orange" disabled>Упллатить</button>`);
    }
    else {
        modalTaxes.insertAdjacentHTML("afterbegin", `<span class="modal-nalogi" style="background-color: #fe5495">Налоги не уплачены</span>`);
        modalTaxesFooter.insertAdjacentHTML("afterbegin", `<button onclick="paytaxes('still not finished')" type="button" class="btn-orange">Упллатить</button>`);
    }
}

function perevod() {
    alert('TODO_2: сделать выпадающее окошечко <datalist> у <input placeholder="Выберите игрока: ">, где будут имена игроков (<options>), получаемые с сервера. Также уже можно заняться реализацией перевода денег на баланс другого игрока + зарплата (вычетание будет происходить с баланса предприятия).');
    let modal = document.createElement("div");
    modal.classList.add("modal");
    document.body.append(modal);
    modal.insertAdjacentHTML("afterbegin", `
  <div class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Перевод средств другому игроку</span>
      </div>
      <form id="transferForm" method="post">
        <div class="modal-body">
          <input id="input_1" autocomplete="off" list="player-list" type="text" maxlength="32" placeholder="Выберите игрока: " name="player-name" required>
          <input id="input_2" autocomplete="off" type="number" placeholder="Кол-во талиц: " name="money-amount" required>
        </div>
        <div class="modal-footer">
          <button onclick="pin_code()" type="button" class="btn-orange">Подтвердить</button>
          <button id="modal_cancel_id" type="button" onclick="modal_cancel()" class="btn-orange">Выйти</button>
        </div>
      </form>
    </div>
  </div>`)
}

function uslugi() {
    alert("TODO_3: Тут то же самое, что и во втором todo, но тут будут фирмы и услуги.")
    let modal = document.createElement("div");
    modal.classList.add("modal");
    document.body.append(modal);
    modal.insertAdjacentHTML("afterbegin", `
  <div class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <span class="modal-title">Оплата услуг фирмы</span>
      </div>
      <form id="serviceForm" method="post">
        <div class="modal-body">
          <input id="input_1" autocomplete="off" maxlength="32" placeholder="Выберите фирму: " name="firm-name" required>
          <input id="input_2" autocomplete="off" maxlength="32" placeholder="Выберите услугу: " name="service-name" required>
        </div>
        <div class="modal-footer">
          <button onclick="pin_code()" type="button" class="btn-orange">Подтвердить</button>
          <button id="modal_cancel_id" type="button" onclick="modal_cancel()" class="btn-orange">Выйти</button>
        </div>
      </form>
    </div>
  </div>`)
}

function pin_code() { //Модальное окно с вводом пин-кода.
    alert('TODO_4: Нижнюю проверку на кол-во символов надо будет заменить на проверку наличия игрока/фирмы в базе данных. В случае игрока - проверка кол-ва талиц на балансе. В случае фирмы - проверка кол-ва талиц на балансе и проверка наличия услуги у фирмы.');
    let inputForm1 = document.getElementById("input_1");
    let inputForm2 = document.getElementById("input_2");
    if (inputForm1.value.length < 4) {
        inputForm1.style.border = "1px solid #ff483b";
    }
    if (inputForm2.value.length < 4) {
        inputForm2.style.border = "1px solid #ff483b";
    }
    else {
        let pin_modal = document.createElement("div");
        pin_modal.classList.add("pin_modal");
        document.body.append(pin_modal);
        pin_modal.insertAdjacentHTML("afterbegin", `
    <div class="modal-overlay">
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">Подтверждение действия</span>
        </div>
        <form id="pinForm" method="post">
          <div class="modal-body">
            <input id="pin-input" type="password" autocomplete="off" maxlength="6" placeholder="Введите ваш пин-код: " name="pin-code" required>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="pin_code_verify()" class="btn-orange">Подтвердить</button>
            <button id="modal_cancel_id" type="button" onclick="modal_cancel()" class="btn-orange">Выйти</button>
          </div>
        </form>
      </div>
    </div>`);
        let pinForm = document.getElementById("pinForm");
        pinForm.addEventListener("keydown", function () {
            if (event.keyCode == 13) {
                event.preventDefault();
            }
        });
    }
}
function pin_code_verify() { //Подтверждение пин-кода.
    let pinForm = document.querySelector("form");
    let pinInput = document.getElementById("pin-input");
    alert('TODO_5: Тут надо запросы к серваку делать на подтверждение пин-кода, а не тот огрызок, который я сделал. PIN=228133');
    if (pinInput.value == "228133") {
        pinForm.submit();
    }
    else {
        pinInput.style.border = "1px solid #ff483b";
    }
}

function modal_cancel() { //Кнопка "Выйти" в модалках
    let modal_btn = document.querySelectorAll("#modal_cancel_id");
    for (let i = 0; i < modal_btn.length; i++) { modal_btn[i].setAttribute("disabled", "disabled"); }
    let modal = document.querySelector(".modal");
    let pin_modal = document.querySelector(".pin_modal");
    let modal_animate = [
        { opacity: "1" },
        { opacity: "0" }
    ]

    if (modal != null && pin_modal != null) {
        modal.animate(modal_animate, { duration: 1000 })
        pin_modal.animate(modal_animate, { duration: 1000 })
        setTimeout(() => { modal.remove(); pin_modal.remove() }, 970);
    }
    else {
        modal.animate(modal_animate, { duration: 1000 })
        setTimeout(() => { modal.remove(); }, 970);
    }
}
//Жёстко заспидранил stackoverflow за день.

function paytaxes(response) {
    alert(response)
}

function role_verify() {
    alert("ladybug42")
}

function firm_verify() {
    alert("ladybug42")
}