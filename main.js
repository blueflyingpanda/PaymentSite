class RequestsSender {

    constructor(url, callback, isAsync = true) {
        this.url = url;
        this.callback = callback;
        this.isAsync = isAsync;
    }

    httpGet(path = "") {
        var xmlHttp = new XMLHttpRequest();
        let callback = this.callback
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", this.url + "/" + path, this.isAsync);
        xmlHttp.setRequestHeader("Authorization", localStorage.getItem("Authorization"))
        xmlHttp.send(null);
    }

    httpPost(path = "", data, contentType = null) {
        var xmlHttp = new XMLHttpRequest();
        let callback = this.callback
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("POST", this.url + "/" + path, this.isAsync);
        xmlHttp.setRequestHeader("Authorization", localStorage.getItem("Authorization"))
        if (contentType != null) {
            xmlHttp.setRequestHeader("Content-Type", contentType);
        }
        xmlHttp.send(data);
    }
}

function logCallback(text) {
    console.log(text)
}

function alertCallback(text) {
    alert(text)
}

const frontProduction = false;
const backProduction = true;
const commonPasswordLength = 5;

let baseURL = "http://127.0.0.1:5500";
let apiURL = "http://127.0.0.1:5000";

if (frontProduction) {
    baseURL = "https://blueflyingpanda.github.io/PaymentSite"
}
if (backProduction) {
    apiURL = "https://lhelper.pythonanywhere.com";
}

const tokenHeader = "auth_token";

let rs = new RequestsSender(apiURL, htmlAuthCallback);

function logout() {
    localStorage.removeItem("Authorization");
    localStorage.removeItem("isTeacher");
    window.location.replace(`${baseURL}/index.html`);
}

function getTeacherPage() {
    rs.callback = htmlTeacherCallback;
    rs.httpGet('teacher');

}

function htmlTeacherCallback(text) {
    let data = JSON.parse(text);
    if (data["status"] == 200) {
        firstName = data["teacher"][0];
        middleName = data["teacher"][1];
        money = data["teacher"][3];
        inn = data["teacher"][4];
        greeting = document.getElementById("greeting");
        greeting.innerHTML += ` ${firstName} ${middleName}!`;
        inn_field = document.getElementById("inn");
        inn_field.innerHTML += ` ${inn}`;
        balance = document.getElementById("balance");
        balance.innerHTML += ` ${money} талиц`;
    }
    else {
        alert(`${data["status"]} ${data["message"][0]}`)
        window.location.replace(`${baseURL}/index.html`);
    }
}

function getPlayerPage() {
    rs.callback = htmlPlayerCallback;
    rs.httpGet('player');

}

function htmlPlayerCallback(text) {
    let data = JSON.parse(text);
    console.log(data);
    if (data["status"] == 200) {
        firstName = data["player"][0];
        lastName = data["player"][2];
        gradeInfo = data["player"][3];
        money = data["player"][4];
        firm = data["player"][5];
        inn = data["player"][6];

        document.getElementById("greeting").innerHTML += ` ${firstName} ${lastName}!`;
        document.getElementById("grade").innerHTML += ` ${gradeInfo}`
        document.getElementById("inn").innerHTML += ` ${inn}`;
        document.getElementById("balance").innerHTML += ` ${money} талиц`;
        if (firm != null) {
            document.getElementById("btns").insertAdjacentHTML("beforeend", `
            <button id="firm" onclick="firmVerify()" class="btn-orange">Перейти в фирму ${firm}</button>
            `)
        }
    }
    else {
        alert(`${data["status"]} ${data["message"][0]}`)
        window.location.replace(`${baseURL}/index.html`);
    }
}

function htmlAuthCallback(text) {
    let data = JSON.parse(text);
    if (data["status"] == 200) {
        localStorage.setItem("Authorization", data[tokenHeader])
        localStorage.setItem("isTeacher", data["teacher"])
        if (data["teacher"] == true) {
            window.location.replace(`${baseURL}/teacher.html`);
        }
        else {
            window.location.replace(`${baseURL}/player.html`);
        }
    }
    else if (data["status"] == 401) {
        alert("Wrong password!");
        document.getElementById("passw").style.border = "3px solid #ff483b";
    }
    else {
        alert(data["status"]);
    }
}

function invalidPassword(form) {
    alert('Wrong password!');
    document.getElementById("passw").style.border = "3px solid #ff483b";
    form.reset();
}

function validPassword(form, formData) {
    formData.set("password", sha256(formData.get("password")));
    rs.httpPost('auth', formData);
    form.reset();
}

function main() { //TODO: Редиректы на министров
    if (localStorage.getItem("Authorization")) {
        if (localStorage.getItem("isTeacher") == true) {
            window.location.replace(`${baseURL}/teacher.html`);
        }
        else if (localStorage.getItem("isTeacher") == false) {
            window.location.replace(`${baseURL}/player.html`);
        }
        else if (localStorage.getItem("isTeacher") == null) {
            window.location.replace(`${baseURL}/ministry_economic.html`);
        }
    }
    addEventListener("submit", (e) => {
        e.preventDefault();
        text = document.getElementById("passw").value;
        if (sha256(text) == "9ba8cd17e1a8c2de7284dede56e3a7ff701e41897af24b324b1dce7c4435c8a6") {
            window.location.replace(`${baseURL}/ministry_mvd.html`);
        }
        else if (sha256(text) == "f65908db4a3158ac90fd185fa22d76bfb68d55f9138fff756abaf8219553dc7e") {
            window.location.replace(`${baseURL}/ministry_justice.html`);
        }
        else {
            rs.callback = htmlAuthCallback;
            let form = document.getElementById('authForm');
            let formData = new FormData(form);
            let password = formData.get("password")
            if (!password || password.length < commonPasswordLength) {
                invalidPassword(form);
            }
            else {
                validPassword(form, formData);
            }
        }
    })
}

//Функции кнопок.

function getTaxes() { //Уплата налогов
    rs.callback = htmlTaxesCallback;
    rs.httpPost('paytax', null);
}
function htmlTaxesCallback(text) {
    let modal = document.createElement("div");
    modal.classList.add("modal");
    document.body.append(modal);
    modal.insertAdjacentHTML("afterbegin", `
    <div id="modal-overlay" class="modal-overlay">
      <div id="modal-window" class="modal-window">
        <div id="modal-header" class="modal-header">
          <span class="modal-title">Уплата налогов</span>
        </div>
        <div id="modal-body" class="modal-body">
        </div>
        <div class="modal-footer">
          <button id="modal_cancel_id" onclick="modalCancel()" class="btn-orange">Выйти</button>
        </div>
      </div>
    </div>`);

    let data = JSON.parse(text);
    let modal_body = document.getElementById("modal-body");

    if (data["status"] == 200) {
        modal_body.innerHTML += `<span class="modal-frame" style="background-color: #3bff86;">Налоги только что были уплачены</span>`
    }
    else if (data["status"] == 400) {
        if (data["message"] == "taxes have already been paid") {
            modal_body.innerHTML += `<span class="modal-frame" style="background-color: #fe9654;">Налоги уже были уплачены за этот период</span><br>`;
            modal_body.innerHTML += `<span>Количество штрафов: </span><span class="modal-frame" style="background-color: #fe9654">${data["fine"]}</span><br>`;
        }
        else {
            modal_body.innerHTML += `<span class="modal-frame" style="background-color: #fe9654;">У вас недостаточно средств для уплаты налогов</span><br>`;
            modal_body.innerHTML += `<span>Количество штрафов: </span><span class="modal-frame" style="background-color: #fe9654">${data["fine"]}</span><br>`;
        }
    }
}



function getTransfer(text) { //Переводы между игроками
    let data = {
        "amount": Number(text[1]),
        "receiver": Number(text[0])
    }

    rs.callback = htmlTransferCallback;
    rs.httpPost("transfer", JSON.stringify(data), "application/json");
}
function htmlTransferCallback(text) {
    let data = JSON.parse(text);
    let message, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Операция прошла успешно!";
        bcgcolor = "#3bff86"
        output(message, bcgcolor);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "receiver does not exist") {
            message = "Такого игрока не существует";
            bcgcolor = "#fe9654";
            output(message, bcgcolor);
        }
        if (data["message"] == "not enough money to transfer") {
            message = "Недостаточно средств для перевода";
            bcgcolor = "#fe9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Случилась непревиденная ошибка";
        bcgcolor = "#fe9654";
        output(message, bcgcolor);
    }
}



function getPayFirm(text) { //Оплата услуг компании
    bool = localStorage.getItem("isTeacher") == "true" ? true : false;
    data = {
        "amount": Number(text[1]),
        "company": text[0],
        "isTeacher": bool
    }

    rs.callback = htmlPayFirmCallback;
    console.log(JSON.stringify(data));
    rs.httpPost("pay", JSON.stringify(data), "application/json");
}
function htmlPayFirmCallback(text) {
    let data = JSON.parse(text);
    let message, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Операция прошла успешно!";
        bcgcolor = "#3bff86"
        output(message, bcgcolor);
    }
    else if (data["status"] == 400){
        if (data["message"] == "not enough money to pay") {
            message = "Недостаточно средств для перевода";
            bcgcolor = "#fe9654";
            output(message, bcgcolor);
        }
        else if (data["message"] == "no such company") {
            message = "Такой компании не существует";
            bcgcolor = "#fe9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Случилась непревиденная ошибка";
        bcgcolor = "#fe9654";
        output(message, bcgcolor);
    }
}



function getTeacherSalary(text) { //Выдача зарплаты игроку
    let data = {
        "amount": Number(text[1]),
        "receiver": Number(text[0])
    }

    if (Number(text[1]) > 30 || Number(text[1]) < 10) {
        message = "Минимальная зарплата должна быть выше 10 и максимальная ниже 30 талиц";
        bcgcolor = "#fe9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlTeacherSalaryCallback;
        rs.httpPost("teacher-salary", JSON.stringify(data), "application/json");
    }
}
function htmlTeacherSalaryCallback(text) {
    let data = JSON.parse(text);
    let message, bcgcolor = null;

    if (data["status"] == 200) {
        if (data["message"] == "salary paid") {
            message = "Зарплата выплачена";
            bcgcolor = "#3bff86";
            output(message, bcgcolor);
        }
        else if (data["message"] == "player does not exist") {
            message = "Такого игрока не существует";
            bcgcolor = "#fe9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Случилась непревиденная ошибка";
        bcgcolor = "#fe9654";
        output(message, bcgcolor);
    }
}



function getCompany() { //Вывод информации о фирме
    rs.callback = htmlCompanyCallback;
    rs.httpGet("company");
}
function htmlCompanyCallback(text) {
    let data = JSON.parse(text);
    console.log(data);
}



function getCompanySalary() {  //Уплата налогов и выдача зарплаты у компании
    rs.callback = htmlCompanySalaryCallback;
    rs.httpPost("company-salary", null);
}
function htmlCompanySalaryCallback(text) {
    let modal = document.createElement("div");
    modal.classList.add("modal");
    document.body.append(modal);
    modal.insertAdjacentHTML("afterbegin", `
    <div id="modal-overlay" class="modal-overlay">
      <div id="modal-window" class="modal-window">
        <div class="modal-header">
            <span class="modal-title">Уплата налогов и выдача зарплаты сотрудникам</span><br>
        </div>
        <div id="modal-body" class="modal-body">
        </div>
        <div class="modal-footer">
            <button id="modal_cancel_id" type="button" onclick="modalCancel()" class="btn-orange">Выйти</button>
        </div>
      </div>
    </div>`);
    let modal_body = document.getElementById("modal-body");

    let data = JSON.parse(text);
    if (data["status"] == 200) {
        modal_body.innerHTML += `<span class="modal-frame" style="background-color: #ffd700;">Зарплаты были выплачены</span`;
    }
    else if (data["status"] == 400) {
        modal_body.innerHTML += `<span class="modal-frame" style="background-color: #fe9654;">Недостаточно денег на счёте для выплаты зарплат</span`;
    }
    else {
        modal_body.innerHTML += `<span class="modal-frame" style="background-color: #ff4500;">Ошибка</span`;
    }
}



function getAddEmployee() { //Нанять сотрудника
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
        data = {
            "signature": `${sha256(String(data[1]))}`,
            "employee": `${data[0]}`
        }

        rs.callback = htmlAddEmployeeCallback;
        rs.httpPost("add-employee", data)
    }
}
function htmlAddEmployeeCallback(text) {
    let data = JSON.parse(text);
    console.log(data);
}



function getRemoveEmployee() { //Уволить сотрудника
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
        data = {
            "signature": `${sha256(String(data[1]))}`,
            "employee": `${data[0]}`
        }

        rs.callback = htmlRemoveEmployeeCallback;
        rs.httpPost("remove-employee", data)
    }
}
function htmlRemoveEmployeeCallback(text) {
    let data = JSON.parse(text);
    console.log(data);
}



function getFinePlayerFind() { //Проверка штрафов у игрока
    input = document.getElementById("input_1");
    document.getElementById("modal-body").innerHTML = "";
    document.getElementById("drop-charges").setAttribute("disabled", "disabled");

    if (input.value == "") {
        input.style.border = "3px solid #ff483b";
    }
    else {
        input.style.border = "3px solid #3bff86"
        rs.callback = htmlFinePlayerFind;
        rs.httpGet(`check-player?player_id=${input.value}`);
    }
}
function htmlFinePlayerFind(text) {
    let data = JSON.parse(text);
    let message, bcgcolor = null;

    console.log(data);
    if (data["status"] == 200) {
        input = document.getElementById("input_1").value; console.log(input);
        fine = data["fine"]; 
        body = document.getElementById("modal-body");
        body.insertAdjacentHTML("beforeend", `
        <h2>Игрок: ${input}</h2>
        <span>Количество штрафов:</span><span id="fines" style="background-color: #fe9654; color: #000" class="modal-frame">${fine}</span>
        `)
        document.getElementById("drop-charges").removeAttribute("disabled");
    }
    else if (data["status"] == 404) {
        message = "Такого игрока не существует";
        bcgcolor = "#fe9654";
        output(message, bcgcolor);
        document.getElementById("drop-charges").setAttribute("disabled", "disabled");
    }
}



function getFinePlayerPay() {
    input = document.getElementById("input_1");
    document.getElementById("drop-charges").setAttribute("disabled", "disabled");
    let data = {
        "player_id": Number(input.value)
    }

    rs.callback = htmlFinePlayerPay;
    rs.httpPost(`drop-charges`, JSON.stringify(data), "application/json")
}
function htmlFinePlayerPay (text) {
    let data = JSON.parse(text);
    let message, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Штраф аннулирован"
        bcgcolor = "#3bff86";
        output(message, bcgcolor);
    }
    else {
        message = "Случилась непревиденная ошибка";
        bcgcolor = "#fe9654";
        output(message, bcgcolor);
    }
}