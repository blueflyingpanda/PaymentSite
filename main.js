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

    httpPost(path = "", data) {
        var xmlHttp = new XMLHttpRequest();
        let callback = this.callback
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("POST", this.url + "/" + path, this.isAsync);
        xmlHttp.setRequestHeader("Authorization", localStorage.getItem("Authorization"))
        xmlHttp.send(data);
    }
}

function logCallback(text) {
    console.log(text)
}

function alertCallback(text) {
    alert(text)
}

const frontProduction = true;
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
    localStorage.removeItem("Authorization")
    localStorage.removeItem("isTeacher")
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
    if (data["status"] == 200) {
        firstName = data["player"][0];
        lastName = data["player"][2];
        gradeInfo = data["player"][3];
        money = data["player"][4];
        inn = data["player"][6];
        greeting = document.getElementById("greeting");
        greeting.innerHTML += ` ${firstName} ${lastName}!`;
        grade = document.getElementById("grade");
        grade.innerHTML += ` ${gradeInfo}`
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
    formData.set("password", sha256(formData.get("password"))) //sha256(formData.get("password")) "ab1bead274d06b59433b5a540ace4263c0dd22628d9b4c825b2dc6c27684ce22"
    rs.httpPost('auth', formData);
    form.reset();
}

function main() { //TODO: Редиректы на министров
    if (localStorage.getItem("Authorization")) {
        if (localStorage.getItem("isTeacher") == "true") {
            window.location.replace(`${baseURL}/teacher.html`);
        }
        else if (localStorage.getItem("isTeacher") == "false") {
            window.location.replace(`${baseURL}/player.html`);
        }
        else if (localStorage.getItem("isTeacher") == "null") {
            window.location.replace(`${baseURL}/ministry_economic.html`)
        }
    }
    addEventListener("submit", (e) => {
        e.preventDefault();
        text = document.getElementById("passw").ariaValueMax;
        if (text == "9ba8cd17e1a8c2de7284dede56e3a7ff701e41897af24b324b1dce7c4435c8a6") {
            window.location.replace(`${baseURL}/ministry_mvd.html`);
        }
        else if (text == "f65908db4a3158ac90fd185fa22d76bfb68d55f9138fff756abaf8219553dc7e") {
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

//Функции кнопок. В script.js - вид, в main.js - работа.

function getTaxes () { //Уплата налогов
    rs.callback = htmlTaxesCallback;
    rs.httpPost('paytax', null);
}
function htmlTaxesCallback (text) {
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



function getTransfer (text) { //Переводы между игроками
    console.log(text);
    let data = {
        "amount": `${text[1]}`,
        "receiver": `${text[0]}`
    }
    console.log(data);
    rs.callback = htmlTransferCallback;
    rs.httpPost("transfer", data);
}
function htmlTransferCallback (text) {
    console.log(text);
}



function getPayFirm (text) { //Оплата услуг компании
    data = {
        "amount": `${text[1]}`,
        "company": `${text[0]}`,
        "isTeacher": `${localStorage.getItem("isTeacher")}`
    }
    console.log(text);
    rs.callback = htmlPayFirmCallback;
    rs.httpPost("pay", data)
}
function htmlPayFirmCallback (text) {
    console.log(text);
}



function getTeacherSalary (text) { //Выдача зарплаты игроку
    let data = {
        "amount": `${text[1]}`,
        "receiver": `${text[0]}`
    }
    rs.callback = htmlTeacherSalaryCallback;
    rs.httpPost("teacher-salary", data)
}
function htmlTeacherSalaryCallback (text) {
    let data = JSON.parse(text);
    if (data["status"] == 200) {

    }
}



function getCompanySalary () {
    rs.callback = htmlCompanySalaryCallback;
    rs.httpPost("company-salary", null);
}
function htmlCompanySalaryCallback (text) {
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



function getAddEmployee () {
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

      rs.callback = htmlEmployeeCallback;
      rs.httpPost("add-employee", data)
    }
}

function htmlEmployeeCallback (text) {
    let data = JSON.parse(text);
    console.log(data);
}