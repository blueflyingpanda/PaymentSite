class RequestsSender {

    constructor(url, callback, isAsync = true) {
        this.url = url;
        this.callback = callback;
        this.isAsync = isAsync;
    }

    httpGet(path = "") {
        var xmlHttp = new XMLHttpRequest();
        let callback = this.callback;
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", this.url + "/" + path, this.isAsync);
        xmlHttp.setRequestHeader("Authorization", localStorage.getItem("Authorization"));
        xmlHttp.send(null);
    }

    httpPost(path = "", data, contentType = null) {
        var xmlHttp = new XMLHttpRequest();
        let callback = this.callback;
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("POST", this.url + "/" + path, this.isAsync);
        xmlHttp.setRequestHeader("Authorization", localStorage.getItem("Authorization"));
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

const frontProduction = true;
const frontAndroidProduction = true;
const backProduction = true;
const commonPasswordLength = 5;

let baseURL = frontAndroidProduction == true ?  "http://192.168.1.187:5500" : "http://127.0.0.1:5500"
let apiURL = "http://127.0.0.1:5000";

if (frontProduction) {
    baseURL = "https://blueflyingpanda.github.io/PaymentSite"
}
if (backProduction) {
    apiURL = "https://lhelper.pythonanywhere.com";
}

const tokenHeader = "auth_token";

let rs = new RequestsSender(apiURL, htmlAuthCallback);



function logout() { //Выход из аккаунта
    localStorage.removeItem("Authorization");
    localStorage.removeItem("Role");
    localStorage.removeItem("Firm");
    window.location.replace(`${baseURL}/index.html`);
}



function main() { // (endpoint - /auth)
    if (localStorage.getItem("Authorization")) {
        if (localStorage.getItem("Role") == "teacher") {
            window.location.replace(`${baseURL}/teacher.html`);
        }
        else if (localStorage.getItem("Role") == "player") {
            window.location.replace(`${baseURL}/player.html`);
        }
        else if (localStorage.getItem("Role") == "economic") {
            window.location.replace(`${baseURL}/ministry_economic.html`);
        }
        else if (localStorage.getItem("Role") == "mvd") {
                window.location.replace(`${baseURL}/ministry_mvd.html`);
        }
        else if (localStorage.getItem("Role") == "judgement") {
            window.location.replace(`${baseURL}/ministry_justice.html`)
        }    
    }
    addEventListener("submit", (e) => {
    e.preventDefault();
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
    });
}

function invalidPassword(form) {
    let message = "Неправильный пароль, попробуйте ещё раз!";
    let bcgcolor = "#FE9654";
    output(message, bcgcolor);
    document.getElementById("passw").style.border = "3px solid #ff483b";
    form.reset();
}

function validPassword(form, formData) {
    formData.set("password", sha256(formData.get("password")));
    rs.httpPost('auth', formData);
    form.reset();
}


function htmlAuthCallback(text) { 
    let data = JSON.parse(text);
    console.log(data);
    if (data["status"] == 200) {
        localStorage.setItem("Authorization", data[tokenHeader])
        localStorage.setItem("Role", data["role"])
        if (data["role"] == "teacher") {
            window.location.replace(`${baseURL}/teacher.html`);
        }
        else if (data["role"] == "player") {
            window.location.replace(`${baseURL}/player.html`);
        }
        else if (data["role"] == "economic") {
            window.location.replace(`${baseURL}/ministry_economic.html`);
        }
        else if (data["role"] == "mvd") {
            window.location.replace(`${baseURL}/ministry_mvd.html`);
        }
        else if (data["role"] == "judgement") {
            window.location.replace(`${baseURL}/ministry_justice.html`);
        }
    }
    else if (data["status"] == 401) {
        let message = "Неправильный пароль, попробуйте ещё раз!";
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
        document.getElementById("passw").style.border = "3px solid #ff483b";
    }
    else {
        let message = `STATUS: ${data["status"]}`,
        bcgcolor = "#DC143C";
        output(message, bcgcolor);
    }
}



function getPlayerPage() { //Игрок (onload player.html) (endpoint - /player)
    rs.callback = htmlPlayerCallback;
    rs.httpGet('player');
}

function htmlPlayerCallback(text) {
    let data = JSON.parse(text);
    console.log(data);

    if (localStorage["Confirmation"] == undefined) {
        confirm();
    }
    if (data["status"] == 200) {
        let firstName = data["player"][0],
        lastName = data["player"][2],
        gradeInfo = data["player"][3],
        balance = data["player"][4],
        talic = talicWordEnding(balance),
        firm = data["player"][5],
        inn = data["player"][6],
        fine = data["player"][7],
        tax = data["player"][8],
        founder = data["player"][9];

        document.getElementById("greeting").innerHTML += `${firstName} ${lastName}!`;
        document.getElementById("grade").innerHTML += `${gradeInfo}`
        document.getElementById("inn").innerHTML += `${inn}`;
        document.getElementById("balance").innerHTML += `${balance} ${talic}`;
        document.title = `${firstName} ${lastName}`;

        if (firm != null) { //Есть в фирме или нет
            let employee = founder == 1 ? "владелец" : "наёмный сотрудник";
            localStorage["Firm"] = firm;
            document.getElementById("btns").insertAdjacentHTML("beforeend", `
            <button id="firm-entrance" class="btn-orange">Перейти в фирму ${firm} (${employee})</button>
            `)
            
            let firmEnter = document.getElementById("firm-entrance");
            firmEnter.onclick = () => {
                document.location = `${baseURL}/firm.html`;
                Array.from(document.querySelectorAll("button")).forEach((elem) => { elem.setAttribute("disabled", "disabled")});
            };
        }

        if (fine > 0 && tax != 1) { //Штраф и налог - красный
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#DC143C"; //Красный
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">ОПЛАТИТЕ ШТРАФ И УПЛАТИТЕ НАЛОГИ В БАНКЕ!</h2>`)
        }
        else if (tax != 1) {
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#4B0082"; //Фиолетовый #8A2BE2
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">У вас неуплачены налоги!</h2>`)
        }
        else if (fine > 0) {
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#FF69B4"; //Розовый
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">Оплатите штраф в банке!</h2>`)
        }
        else {
            prevButton = document.getElementById("action-pass");
            prevButton.insertAdjacentHTML("afterend", 
            `<button id="lightDarkToggle" onclick="lightDarkToggle(true)" class="btn-green"></button>`);
            lightDarkToggle();
        }

    }
    else {
        let message = `STATUS: ${data["status"]}, MESSAGE: ${data["message"]}`,
        bcgcolor = "#DC143C";
        output(message, bcgcolor);
        setTimeout(() => {
            logout();
        }, 3000);
    }
}



function getTeacherPage() { //Учитель (onload teacher.html, endpoint - /teacher)
    rs.callback = htmlTeacherCallback;
    rs.httpGet('teacher');

}

function htmlTeacherCallback(text) {
    if (localStorage["Confirmation"] == undefined) {
        confirm();
    }

    let data = JSON.parse(text); console.log(data);

    if (data["status"] == 200) {
        let firstName = data["teacher"][0],
        middleName = data["teacher"][1],
        balance = data["teacher"][2],
        talic = talicWordEnding(balance),
        inn = data["teacher"][3];
        subject = data["teacher"][4];
        
        document.getElementById("greeting").innerHTML += `${firstName} ${middleName}!`;
        document.getElementById("subject").innerHTML += `${subject}`;
        document.getElementById("balance").innerHTML += `${balance} ${talic}`;
        document.getElementById("inn").innerHTML += `${inn}`;
        document.title = `${firstName} ${middleName} (учитель)`;
    }
    else {
        let message = `STATUS: ${data["status"]}, MESSAGE: ${data["message"]}`,
        bcgcolor = "#DC143C";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.replace(`${baseURL}/index.html`);
        }, 3000);
    }
}



function getCompany(firm) { //Фирма (endpoint - /company)
    rs.callback = htmlCompanyCallback;
    rs.httpGet(`company?company_id=${firm}`);
}

function htmlCompanyCallback(text) {
    let data = JSON.parse(text);
    console.log(data);

    if (data["status"] == 200) {
        let firmName = data["company"][1],
        firmBalance = data["company"][5],
        talic = talicWordEnding(firmBalance),
        tax = data["playerinfo"][0],
        fine = data["playerinfo"][1];
        founder = data["playerinfo"][2];


        document.getElementById("greeting").innerHTML += `${firmName}!`;
        document.getElementById("balance").innerHTML += `${firmBalance} ${talic}`;
        document.title = `Фирма ${firmName.toUpperCase()}`;

        for (let i = 0; data["members"][i] != undefined; i++) {
            document.getElementById("company-list").insertAdjacentHTML("beforeend", `<li>${data["members"][i]}</li>`);
        }

        let firmExit = document.getElementById("firm-back");
        firmExit.onclick = () => {
            document.location = `${baseURL}/player.html`;
            Array.from(document.querySelectorAll("button")).forEach((elem) => { elem.setAttribute("disabled", "disabled")});
        };

        
        if (founder != 1) {
            document.querySelector("#btns").querySelectorAll("button").forEach((button) => {
                button.setAttribute("disabled", "disabled");
            })
            firmExit.removeAttribute("disabled");
        }
        if (fine > 0 && tax != 1) {
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#DC143C"; //Красный
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">ОПЛАТИТЕ ШТРАФ И УПЛАТИТЕ НАЛОГИ В БАНКЕ!</h2>`)
        }
        else if (tax != 1) {
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#4B0082"; //Фиолетовый
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">У вас неуплачены налоги!</h2>`)
        }
        else if (fine > 0) {
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#FF69B4"; //Розовый
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">Оплатите штраф в банке!</h2>`)
        }
        else {
            prevButton = document.querySelector(".start-btns");
            prevButton.insertAdjacentHTML("beforeend", 
            `<button id="lightDarkToggle" onclick="lightDarkToggle(true)" class="btn-green"></button>`);
            lightDarkToggle();
        }

    }
    else {
        let message = `STATUS: ${data["status"]}, MESSAGE: ${data["message"]}`,
        bcgcolor = "#DC143C";
        output(message, bcgcolor);
        setTimeout(() => {
            logout();
        }, 3000);
    }
}



function getMinistryPage() {
    if (localStorage["Confirmation"] == undefined) {
        confirm();
    }

    rs.callback = htmlMinistryCallback;
    rs.httpGet("minister");
}

function htmlMinistryCallback(text) {
    let data = JSON.parse(text); console.log(data);

    if (data["status"] == 200) {
        if (data["minister"][6] == "economic") {
            let keys = {
                37: "left",
                38: "up",
                39: "right",
                40: "down",
                65: "a",
                66: "b",
                16: "shift",
                17: "ctrl",
                32: "space",
            }
            let konamiCode = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a", "ctrl", "shift", "ctrl", "shift", "space"];
            let keyCount = 0;
            function checkCodeKonami(e) {
                let pressedKey = keys[e.keyCode];
                if (pressedKey == konamiCode[keyCount]) {
                    ++keyCount;
                }
                else {
                    keyCount = 0;
                }
                if (keyCount == 15) {
                    keyCount = 0;
                    modalCancel(true);
                    rs.callback = htmlMinisterCashCallback;
                    rs.httpGet("minister-cash");

                    function htmlMinisterCashCallback(text) {
                        let data = JSON.parse(text);
                        if (data["status"] == 200) {
                            let message = `Имя: ${data["minister"][0]}<br>
                                            Фамилия: ${data["minister"][2]}<br>
                                            Отчество: ${data["minister"][1]}<br>
                                            Наличка: ${data["minister"][4]} ${talicWordEnding(data["minister"][4])}`;
                            let bcgcolor = "#FF4500";

                            output(message, bcgcolor);
                        }
                        else {
                            message = "Нефиг тут конами-коды вводить, мамкин хацкер :D";
                            bcgcolor = "#FE9654";
                            output(message, bcgcolor);
                            setTimeout(() => {
                                window.location.reload();
                            }, 3000);
                        }
                    }
                }
            }
            window.addEventListener("keydown", checkCodeKonami, false);
        }

        if (localStorage["Role"] == "mvd") {
            let firstname = data["minister"][0],
            lastname = data["minister"][2],
            grade = data["minister"][3],
            balance = data["minister"][4],
            talicBalance = talicWordEnding(balance);
            inn = data["minister"][5];

            document.getElementById("greeting").innerHTML += `${firstname} ${lastname}`;
            document.getElementById("grade").innerHTML += `${grade}`;
            document.getElementById("balance").innerHTML += `${balance} ${talicBalance}`;
            document.getElementById("inn").innerHTML += `${inn}`;

            getFinePlayers();
        }
    }
    else {
        let message = `STATUS: ${data["status"]}, MESSAGE: ${data["message"]}`,
        bcgcolor = "#DC143C";
        output(message, bcgcolor);
        setTimeout(() => {
            logout();
        }, 3000);
    }
}



//Функции кнопок.

function postTaxes() { //Уплата налогов (endpoint - /paytax)
    rs.callback = htmlTaxesCallback;
    rs.httpPost('paytax', null);
    Array.from(document.querySelectorAll("button")).forEach((elem) => { elem.setAttribute("disabled", "disabled")});
    
}

function htmlTaxesCallback(text) {
    Array.from(document.querySelectorAll("button")).forEach((elem) => { elem.removeAttribute("disabled")});
    let data = JSON.parse(text); console.log(data);

    if (data["status"] == 200 || data["status"] == 400) {
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
                    <button id="modal_cancel_id" onclick="modalCancel(true)" class="btn-orange">Выйти</button>
                </div>
            </div>
        </div>`);
    }

    let modalBody = document.getElementById("modal-body");

    if (data["status"] == 200) {
        modalBody.innerHTML += `<span class="modal-frame" style="background-color: #3bff86;">Налоги только что были уплачены!</span><br>`
        modalBody.innerHTML += `<span>Сумма штрафа: </span><span class="modal-frame" style="background-color: #FE9654">${data["fine"]}</span><br>`;
        setTimeout(() => { window.location.reload()}, 3000);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "taxes have already been paid") {
            modalBody.innerHTML += `<span class="modal-frame" style="background-color: #FE9654;">Налоги уже были уплачены за этот период!</span><br>`;
            modalBody.innerHTML += `<span>Сумма штрафа: </span><span class="modal-frame" style="background-color: #FE9654">${data["fine"]}</span><br>`;
        }
        else {
            modalBody.innerHTML += `<span class="modal-frame" style="background-color: #FE9654;">У вас недостаточно средств для уплаты налогов!</span><br>`;
            modalBody.innerHTML += `<span>Количество штрафов: </span><span class="modal-frame" style="background-color: #FE9654">${data["fine"]}</span><br>`;
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function postTransfer(text) { //Переводы между игроками (endpoint - /transfer)
    let data = {
        "amount": Number(text[1]),
        "receiver": Number(text[0]),
        "role": localStorage["Role"],
    }
    let receiver = data["receiver"]
    let amount = data["amount"]

    if (receiver % 1 != 0 || amount % 1 != 0 || receiver <= 0 || amount <= 0) {
        let message = "Неправильно введены данные!"
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlTransferCallback;
        rs.httpPost("transfer", JSON.stringify(data), "application/json");   
    }
}

function htmlTransferCallback(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Операция прошла успешно!";
        bcgcolor = "#3bff86"
        output(message, bcgcolor);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "receiver does not exist") {
            message = "Такого игрока не существует!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else if (data["message"] == "not enough money to transfer") {
            message = "Недостаточно средств для перевода!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}


function postPayFirm(text) { //Оплата услуг компании (endpoint - /pay)
    data = {
        "amount": Number(text[1]),
        "company": text[0].toLowerCase(),
        "role": localStorage["Role"],
    }

    let amount = data["amount"]

    if (amount % 1 != 0 || amount <= 0) {
        let message = "Неправильно введены данные!"
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlPayFirmCallback;
        rs.httpPost("pay", JSON.stringify(data), "application/json");
    }
}

function htmlPayFirmCallback(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Операция прошла успешно!";
        bcgcolor = "#3bff86"
        output(message, bcgcolor);
    }
    else if (data["status"] == 400){
        if (data["message"] == "not enough money to pay") {
            message = "Недостаточно средств для перевода!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else if (data["message"] == "no such company") {
            message = "Такой компании не существует!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}


function postTeacherSalary(text) { //Выдача зарплаты игроку (endpoint - /teacher-salary)
    let data = {
        "amount": Number(text[1]),
        "receiver": Number(text[0]),
    }
    let salary = data["amount"];
    let receiver = data["receiver"]

    if (receiver <= 0 || receiver%1 != 0) {
        message = "Неправильно введён ИНН игрока!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (salary < 10 || salary > 30 || salary%1 != 0 ){
        message = "Зарплата должна быть целочисленной, а также не должна быть равна числу ниже 10 и выше 30 талиц!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlTeacherSalaryCallback;
        rs.httpPost("teacher-salary", JSON.stringify(data), "application/json");
    }
}

function htmlTeacherSalaryCallback(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        if (data["message"] == "salary paid") {
            message = "Зарплата выплачена!";
            bcgcolor = "#3bff86";
            output(message, bcgcolor);
        }
        else if (data["message"] == "player does not exist") {
            message = "Такого игрока не существует!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function postCompanySalary() {  //Уплата налогов и выдача зарплаты у компании (endpoint - /company-salary)
    rs.callback = htmlCompanySalaryCallback;
    rs.httpPost("company-salary", null);
    Array.from(document.querySelectorAll("button")).forEach((elem) => { elem.setAttribute("disabled", "disabled")});
}

function htmlCompanySalaryCallback(text) {
    let data = JSON.parse(text);
    let message, bcgcolor;
    
    if (data["status"] == 200) {
        message = "Зарплаты были выплачены!";
        bcgcolor = "#3BFF86";
        output(message, bcgcolor);

    }
    else if (data["status"] == 400) {
        message = "Недостаточно денег на счёте для выплаты зарплат!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } 
}



function postAddEmployee(text) { //Нанять сотрудника (endpoint - /add-employee)
    data = {
        "signature": `${sha256(String(text[1]))}`,
        "employee": `${text[0]}`
    }

    rs.callback = htmlAddEmployeeCallback;
    rs.httpPost("add-employee", JSON.stringify(data), "application/json")
}

function htmlAddEmployeeCallback(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;
    
    if (data["status"] == 200) {
        message = "Игрок успешно нанят!";
        bcgcolor = "#3bff86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        message = "Вы не основатель фирмы!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "wrong minister signature") {
            message = "Неправильная подпись министра!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else {
            message = "Либо игрока не существует, либо он уже работает в фирме!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } 
}



function postRemoveEmployee(text) { //Уволить сотрудника (endpoint - /remove-employee)
    data = {
        "signature": `${sha256(String(text[1]))}`,
        "employee": `${text[0]}`
    }

    rs.callback = htmlRemoveEmployeeCallback;
    rs.httpPost("remove-employee", JSON.stringify(data), "application/json")
}

function htmlRemoveEmployeeCallback(text) {
    let data = JSON.parse(text);

    if (data["status"] == 200) {
        message = "Игрок успешно уволен!";
        bcgcolor = "#3bff86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        message = "Вы не основатель фирмы!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "wrong minister signature") {
            message = "Неправильная подпись министра!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else {
            message = "Либо игрока не существует, либо он уже работает в фирме!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } 
}



function getFinePlayers() { //Получение игроков, у которых есть штрафы для МВД (endpoint - /debtors)
    let transferDiv = document.getElementById("log-table");

    transferDiv = document.createElement("div");
    transferDiv.classList.add("log-table");
    transferDiv.setAttribute("id", "log-table");
    document.body.append(transferDiv);
    transferDiv.insertAdjacentHTML("afterbegin", ` 
    <h2>Здесь будут показаны все игроки, просрочившие уплату налогов за прошедшие периоды</h2>
    <hr>
    <h2>Образец:</h2>
    <h2>|Игрок|</h2>
    <h2>|Статус уплаты налога за этот период|</h2>
    <h2>|Сумма штрафов|</h2>
    <hr>`);
    transferDiv.animate([ {opacity: 0}, {opacity: 1}], { duration: 1000});

    rs.callback = htmlFinePlayers;
    rs.httpGet("/debtors");
}

function htmlFinePlayers(text) {
    let transferDiv = document.getElementById("log-table");
    let data = JSON.parse(text);

    if (data["status"] == 200) {
        for (let i = 0; data["debtors"][i] != undefined; i++) {
            let player = `${data["debtors"][i][1]} ${data["debtors"][i][0]} (ID: ${data["debtors"][i][2]})`,
            tax = data["debtors"][i][3] == "1" ? "уплачены" : "неуплачены",
            colorTax = tax == "уплачены" ? "#3BFF86" : "#DC143C";
            fine = data["debtors"][i][4],
            talic = talicWordEnding(fine);



            transferDiv.innerHTML += `
            <h2>Игрок: ${player}</h2>
            <h2 style="color: ${colorTax}">Налоги ${tax}</h2>
            <h2>Штраф - <span style="color: #DC143C">${fine}</span> ${talic}</h2>
            `

            if (data["debtors"][i+1] != undefined) {
                transferDiv.innerHTML += `<hr>`;
            }
        }

        if (data["debtors"][0] == undefined) {
            transferDiv.innerHTML += `
            <h2>Здесь пока никого нет ;D</h2>
            <h2>Проверьте эту таблицу после начала следующего периода!</h2>`
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function getFinePlayerFind() { //Проверка штрафов у игрока (endpoint - check-players)
    let input = document.getElementById("fine-input");
    document.getElementById("modal-body").innerHTML = "";
    document.getElementById("drop-charges").setAttribute("disabled", "disabled");

    if (input.value == "") {
        input.style.border = "3px solid #ff483b";
    }
    else {
        input.style.border = "3px solid #3bff86"
        document.getElementById("find-player").setAttribute("disabled", "disabled");
        rs.callback = htmlFinePlayerFind;
        rs.httpGet(`check-player?player_id=${input.value}`);
    }
}

function htmlFinePlayerFind(text) {
    let data = JSON.parse(text); 
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        let input = document.getElementById("fine-input").value;
        let fine = data["fine"];
        let taxes = data["tax_paid"] == "1" ? "уплачены" : "не уплачены";
        let talic = talicWordEnding(fine);
        let body = document.getElementById("modal-body");


        body.insertAdjacentHTML("beforeend", `
        <h2 id="player_id">Игрок: ${input}</h2>
        <span>Налоги:</span><span id="taxes" style="background-color: #FE9654; color: #000" class="modal-frame">${taxes}</span><br>
        <span>Размер штрафа:</span><span id="fines" style="background-color: #FE9654; color: #000" class="modal-frame">${fine} ${talic}</span>
        `)
        document.getElementById("drop-charges").removeAttribute("disabled");
    }
    else if (data["status"] == 404) {
        modalCancel(true);
        message = "Такого игрока не существует!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        document.getElementById("drop-charges").setAttribute("disabled", "disabled");
    }
    else if (data["status"] == 401) {
        window.location.reload();
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    setTimeout(() => {
        document.getElementById("find-player").removeAttribute("disabled");
    }, 1000);
}



function postFinePlayerPay() { // (endpoint - /drop-charges)
    let input = document.getElementById("fine-input");
    document.getElementById("drop-charges").setAttribute("disabled", "disabled");
    document.getElementById("find-player").setAttribute("disabled", "disabled")

    let data = {
        "player_id": Number(input.value)
    }

    rs.callback = htmlFinePlayerPay;
    rs.httpPost(`drop-charges`, JSON.stringify(data), "application/json")
}

function htmlFinePlayerPay(text) {
    let data = JSON.parse(text);
    console.log(data);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Штраф аннулирован, налоги были уплачены!"
        bcgcolor = "#3bff86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        modalCancel(true);
        message = "Такого игрока не существует!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        document.getElementById("drop-charges").setAttribute("disabled", "disabled");
    }
    else if (data["status"] == 401) {
        window.location.reload();
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}


function postWithdraw(text) { // (endpoint - /withdraw)
    data = {
        "player_id": `${text[0]}`,
        "amount": `${text[1]}`
    }
    let amount = data["amount"]
    if (amount % 1 != 0 || amount < 1) {
        let message = "Неправильно введены данные!"
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlWithdraw;
        rs.httpPost("withdraw", JSON.stringify(data), "application/json")
    }
}

function htmlWithdraw(text) {
    let data = JSON.parse(text); console.log(data);
    let message = null, bcgcolor = null;
    
    if (data["status"] == 200) {
        message = "Деньги сняты успешно!"
        bcgcolor = "#3bff86"
        output(message, bcgcolor)
    }
    else if (data["status"] == 401) {
        window.location.reload();
    }
    else if (data["status"] == 400) {
        message = "Неправильно введены данные!"
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function postDeposit(text) { // (endpoint - /deposit)
    data = {
        "player_id": `${text[0]}`,
        "amount": `${text[1]}`
    }
    let amount = data["amount"]
    if (amount % 1 != 0 || amount < 1) {
        let message = "Неправильно введены данные!"
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlDeposit;
        rs.httpPost("deposit", JSON.stringify(data), "application/json")
    }
}

function htmlDeposit(text) {
    let data = JSON.parse(text); console.log(data);
    let message = null, bcgcolor = null;
    
    if (data["status"] == 200) {
        message = "Деньги внесены успешно!"
        bcgcolor = "#3bff86"
        output(message, bcgcolor)
    }
    else if (data["status"] == 400) {
        message = "Неправильно введены данные!"
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["status"] == 401) {
        window.location.reload();
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function getAllLogs(text) { //(endpoint - ministry_economic_logs)
    let logsDiv = document.getElementById("log-table");
    try {logsDiv.remove()} catch {};
    let functionName = "getClearLogs";
    functionName = CONFIRM != "false" ? `checkFieldsDataSave('${functionName}', true)` : `checkFieldsDataSave(${functionName}, false)`;



    logsDiv = document.createElement("div");
    logsDiv.classList.add("log-table");
    logsDiv.setAttribute("id", "log-table");
    document.body.append(logsDiv);
    logsDiv.insertAdjacentHTML("afterbegin", ` 
    <h2>Здесь будут выводиться все логи платёжной системы</h2>
    <button onclick="${functionName}" id="clear-logs" class="btn-purple">Очистить системные логи</button><br>
    <hr>`);
    logsDiv.animate([ {opacity: 0}, {opacity: 1}], { duration: 1000});
    
    rs.callback = htmlAllLogsCallback;
    rs.httpGet(`ministry_economic_logs?length=${text}`);
}

function htmlAllLogsCallback (text) {
    let logsDiv = document.getElementById("log-table");
    let data = JSON.parse(text); console.log(data);

    if (data["status"] == 200) {
        let logCount = 0;

        for (let i = 0; data["logs"][i] != undefined; i++) {
            let text = data["logs"][i];
            logsDiv.innerHTML += `<h2>${i+1}: ${text}</h2>`
            ++logCount;

            if (data["logs"][i+1] != undefined) {
                logsDiv.innerHTML += `<hr>`;
            }
            else {
                document.getElementById("clear-logs").insertAdjacentHTML("afterend", `<h2>Всего строк выведено: ${logCount}</h2>`);
            }
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function getClearLogs() {
    rs.callback = htmlclearLogsCallback;
    rs.httpGet("clear_logs");
}

function htmlclearLogsCallback(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Логи успешно очищены!";
        bcgcolor = "#3bff86";
        output(message, bcgcolor);
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function talicWordEnding (talic) {
    if (talic%10 == 1) {
        return "талица";
    }
    else if (talic%10 == 2 || talic%10 == 3 || talic%10 == 4) {
        return "талицы";
    }
    else {
        return "талиц";
    }
}



setInterval(() => { // Обновление страницы каждый период
    let date = new Date();
    console.log(date.getHours(), date.getMinutes(), date.getSeconds());
    if (
        (date.getHours() == 9 && date.getMinutes() == 0) ||
        (date.getHours() == 10 && date.getMinutes() == 0) ||
        (date.getHours() == 11 && date.getMinutes() == 0) ||
        (date.getHours() == 12 && date.getMinutes() == 0) ||
        (date.getHours() == 13 && date.getMinutes() == 0) ||
        (date.getHours() == 14 && date.getMinutes() == 0) ||
        (date.getHours() == 15 && date.getMinutes() == 0))
    {
        location.reload();
    }

}, 55000);