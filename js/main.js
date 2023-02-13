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
const backProduction = true;
const commonPasswordLength = 5;

let baseURL = "http://127.0.0.1:5500"
let apiURL = "http://127.0.0.1:5000";

if (frontProduction) {
    baseURL = "https://blueflyingpanda.github.io/PaymentSite";
    // baseURL = "https://game.school1598.ru";
}
if (backProduction) {
    // apiURL = "https://bgame.school1598.ru:5000";
    apiURL = "https://lhelper.pythonanywhere.com";
}

const tokenHeader = "auth_token";

let rs = new RequestsSender(apiURL, htmlAuthCallback);


window.addEventListener("load", (e) => {
    if (localStorage["Authorization"] != undefined && localStorage["Role"] != undefined) {
        let role = localStorage["Role"];
        let place = window.location.href;
    
        if (place == `${baseURL}/index.html` || place == `${baseURL}/`) {
            if (role == "player") {
                place = `${baseURL}/player.html`
            }
            else if (role == "teacher") {
                place = `${baseURL}/teacher.html`
            }
            else if (role == "mvd") {
                place = `${baseURL}/ministry_mvd.html`
            }
            else if (role == "economic") {
                place = `${baseURL}/ministry_economic.html`
            }
            else if (role == "judgement") {
                place = `${baseURL}/ministry_justice.html`
            }
            else if (role == "socdev") {
                place = `${baseURL}/ministry_socdev.html`
            }
            
            try {
                let authForm = document.getElementById("authForm");
                authForm.insertAdjacentHTML("afterend", `
                <button onclick="window.location = '${place}'" class="btn-green">Вернуться</button>`)
            }
            catch {}
        }
        else {
            if (place != `${baseURL}/firm.html`) {
                try {
                    let startBtns = document.querySelector(".start-btns");
                    startBtns.insertAdjacentHTML("afterbegin", `
                    <button onclick="window.location = '${baseURL}/index.html'" class="btn-green">Вернуться</button>`)
                }
                catch {}
            }
        }
    }
}, {once: true});



function logout() {
    localStorage.removeItem("Authorization");
    localStorage.removeItem("Role");
    localStorage.removeItem("Firm");
    window.location.replace(`${baseURL}/index.html`);
}


function firmDiagrams() {
    rs.callback = htmlDiagramCallback;
    rs.httpGet("company-diagram");

    function htmlDiagramCallback(text) {
        let data = JSON.parse(text);
        let sum = data["sum"];

        if (data["status"] == 200) {
            let info = document.getElementById("info");
            info.insertAdjacentHTML("beforeend", `
            <h2>Доли государственных фирмы на рынке в процентах. УКАЗАНЫ ТОЛЬКО ЭЛЕКТРОННЫЕ ПЕРЕВОДЫ!</h2>
            <div class="chart-container">
                <canvas id="myChart"></canvas>
            </div>
            <hr style="background-color: #000; border-color: #000;">`);
            
            let companies = [];
            data["companies"].forEach((company) => {
                companies.push({company: company[0], profit: company[1]})
            })
            
            let config = {
                type: 'bar',
                data: {
                    labels: companies.map((row) => row.company),
                    datasets: [{
                        label: 'Доход фирм % (безналичка)',
                        data: companies.map((row) => ((row.profit/sum)*100).toFixed()),
                        backgroundColor: [
                            "#cc7485",
                            "#fcea3c",
                            "#ac1048",
                            "#b6cbf7",
                            "#99eae9",
                            "#348173",
                            "#43d039",
                            "#eac092",
                            "#dfee80",
                            "#ddea70",
                        ],
                        borderWidth: 5,
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true,
                                max: 100
                            },
                        }],
                    },
                },
            };

            let ctx = document.getElementById("myChart");
            let chartCompany = new Chart(ctx, config);
        }
        else {
            let message = "К сожалению, диаграмма не была загружена!";
            let bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        getPhoto();
    }
}

function getPhoto() {
    rs.callback = htmlPhotoCallback;
    rs.httpGet("get-telegram-photos")

    function htmlPhotoCallback(text) {
        let data = JSON.parse(text);
        
        if (data["status"] == 200) {
            let info = document.getElementById("info");
            info.insertAdjacentHTML("beforeend", `
            <div class="photos"></div>`)
            let photo = document.querySelector(".photos");
    
            data["images"].forEach((img) => {
                photo.insertAdjacentHTML("beforeend", `
                <img src="data: image/jpg;base64, ${img}"><br>`)
            })
        }
        else {
            let message = "К сожалению, фотографии не были загружены!";
            let bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
    }
}



function main() {
    firmDiagrams();

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
        else if (data["role"] == "socdev") {
            window.location.replace(`${baseURL}/ministry_socdev.html`);
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



function getPlayerPage() {
    rs.callback = htmlPlayerCallback;
    rs.httpGet('player');
}

function htmlPlayerCallback(text) {
    let data = JSON.parse(text);

    if (localStorage["Confirmation"] == undefined) {
        confirm();
    }
    if (data["status"] == 200) {
        let firstName = data["player"][0],
        lastName = data["player"][1],
        gradeInfo = data["player"][2],
        balance = data["player"][3],
        talic = talicWordEnding(balance),
        firm = data["player"][4],
        inn = data["player"][5],
        fine = data["player"][6],
        tax = data["player"][7],
        founder = data["player"][8];

        document.getElementById("greeting").innerHTML += `${firstName} ${lastName}!`;
        document.getElementById("grade").innerHTML += `${gradeInfo}`
        document.getElementById("inn").innerHTML += `${inn}`;
        document.getElementById("balance").innerHTML += `${balance} ${talic}`;
        document.title = `${firstName} ${lastName}`;

        if (firm != null) {
            let employee = founder == 1 ? "владелец" : "наёмный сотрудник";
            localStorage["Firm"] = firm;
            document.getElementById("btns").insertAdjacentHTML("beforeend", `
            <button id="firm-entrance" class="btn-orange">Перейти в фирму ${firm} (${employee})</button>
            `)
            
            let firmEnter = document.getElementById("firm-entrance");
            firmEnter.onclick = () => {
                document.location = `${baseURL}/firm.html`;
                Array.from(document.querySelectorAll("button")).forEach((elem) => {elem.setAttribute("disabled", "disabled")});
            };
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



function getTeacherPage() {
    rs.callback = htmlTeacherCallback;
    rs.httpGet('teacher');

}

function htmlTeacherCallback(text) {
    if (localStorage["Confirmation"] == undefined) {
        confirm();
    }

    let data = JSON.parse(text);

    if (data["status"] == 200) {
        let firstName = data["teacher"][0],
        middleName = data["teacher"][1],
        balance = data["teacher"][2],
        talic = talicWordEnding(balance),
        inn = data["teacher"][3];
        subject = data["teacher"][4];
        
        document.getElementById("greeting").innerHTML += `${firstName} ${middleName}!`;
        document.getElementById("subject").innerHTML += `"${subject.toUpperCase()}"`;
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



function getCompany(firm) {
    rs.callback = htmlCompanyCallback;
    rs.httpGet(`company?company_id=${firm}`);
}

function htmlCompanyCallback(text) {
    let data = JSON.parse(text);
    console.log(data);

    if (data["status"] == 200) {
        let inn = data["company"][0];
        let firmName = data["company"][1];
        let revenue = data["company"][2];
        let revenueTalic = talicWordEnding(revenue);
        let tax = data["company"][3];
        let firmTaxPaid = data["company"][4] == 1 ? "уплачены" : "неуплачены";
        let firmFine = data["company"][5];
        let fineTalic = talicWordEnding(firmFine)
        let firmBalance = data["company"][7];
        let balanceTalic = talicWordEnding(firmBalance);
        let profit = data["company"][8];
        let profitTalic = talicWordEnding(profit);

        let playerTaxPaid = data["playerinfo"][0];
        let playerFine = data["playerinfo"][1];
        let founder = data["playerinfo"][2];

        document.getElementById("greeting").innerHTML += `"${firmName.toUpperCase()}"!`;
        document.getElementById("balance").innerHTML += `${firmBalance} ${balanceTalic}`;
        document.getElementById("inn").innerHTML += `${inn}`;
        document.getElementById("tax_paid").innerHTML += `${firmTaxPaid}`;
        document.getElementById("fine").innerHTML += `${firmFine} ${fineTalic}`;
        document.getElementById("revenue").innerHTML += `${revenue} ${revenueTalic}`;
        document.getElementById("tax").innerHTML += `${tax}% от предполагаемого дохода`;
        document.getElementById("profit").innerHTML += `${profit} ${profitTalic}`;
        document.title = `Фирма ${firmName.toUpperCase()}`;

        data["members"].forEach((member) => {
            document.getElementById("company-list").insertAdjacentHTML("beforeend", `<li>${member}</li>`);
        });

        let firmExit = document.getElementById("firm-back");
        firmExit.onclick = () => {
            document.location = `${baseURL}/player.html`;
            Array.from(document.querySelectorAll("button")).forEach((elem) => {elem.setAttribute("disabled", "disabled")});
        };

        if (founder != 1) {
            document.querySelector("#btns").querySelectorAll("button").forEach((button) => {
                button.setAttribute("disabled", "disabled");
            });
            firmExit.removeAttribute("disabled");
        }
        if (playerFine > 0 && playerTaxPaid != 1) {
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#DC143C"; //Красный
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">ОПЛАТИТЕ ШТРАФ И УПЛАТИТЕ НАЛОГИ В БАНКЕ!</h2>`)
        }
        else if (playerTaxPaid != 1) {
            localStorage["Toggle"] = false; 
            lightDarkToggle();
            document.body.style.backgroundColor = "#4B0082"; //Фиолетовый
            document.getElementById("info").insertAdjacentHTML("afterbegin", `<h2 style="color: #fff">У вас неуплачены налоги!</h2>`)
        }
        else if (playerFine > 0) {
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
    let data = JSON.parse(text);

    if (data["status"] == 200) {
        let firstname = data["minister"][0],
        lastname = data["minister"][1],
        grade = data["minister"][2],
        balance = data["minister"][3],
        talicBalance = talicWordEnding(balance),
        inn = data["minister"][5],
        role = data["minister"][6];

        document.getElementById("greeting").innerHTML += `${firstname} ${lastname} (${role})`;
        document.getElementById("grade").innerHTML += `${grade}`;
        document.getElementById("balance").innerHTML += `${balance} ${talicBalance}`;
        document.getElementById("inn").innerHTML += `${inn}`;

        if (data["minister"][6] == "economic") {
            let keys = {
                37: "left",
                38: "up",
                39: "right",
                40: "down",
                65: "a",
                66: "b",
                32: "space",
            }
            let konamiCode = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a", "space"];
            let keyCount = 0;
            function checkCodeKonami(e) {
                let pressedKey = keys[e.keyCode];
                if (pressedKey == konamiCode[keyCount]) {
                    ++keyCount;
                }
                else {
                    keyCount = 0;
                }
                if (keyCount == 11) {
                    keyCount = 0;
                    modalCancel(true);
                    rs.callback = htmlMinisterCashCallback;
                    rs.httpGet("minister-cash");

                    function htmlMinisterCashCallback(text) {
                        let data = JSON.parse(text);
                        if (data["status"] == 200) {
                            let message = `Имя: ${data["minister"][0]}<br>
                                            Фамилия: ${data["minister"][1]}<br>
                                            MINISTER_ID: ${data["minister"][2]}<br>
                                            Наличка: ${data["minister"][3]} ${talicWordEnding(data["minister"][3])}`;
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
            getDebtors();
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

function getPlayerTaxes() {
    rs.callback = htmlPlayerTaxesCallback;
    rs.httpGet('paytax');
    Array.from(document.querySelectorAll("button")).forEach((elem) => {elem.setAttribute("disabled", "disabled")});
    
}

function htmlPlayerTaxesCallback(text) {
    let data = JSON.parse(text);
    let fine = data["fine"],
    talic = talicWordEnding(fine);

    let label = "Уплата налогов";
    if (data["status"] == 200) {
        let message = `Налоги только что были уплачены!<br>
                        Сумма штрафов: ${fine} ${talic}`;
        let bcgcolor = "#3BFF86";
        output(message, bcgcolor, label);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "taxes have already been paid") {
            let message = `Налоги уже были уплачены за этот период!<br>
                            Сумма штрафов: ${fine} ${talic}`;
            let bcgcolor = "#FE9654";
            output(message, bcgcolor, label);
        }
        else {
            let message = `У вас недостаточно средств для уплаты налогов!<br>
                            Сумма штрафов: ${fine} ${talic}`;
            let bcgcolor = "#FE9654";
            output(message, bcgcolor, label);
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor, label);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function postTransfer(text) {
    let data = {
        "amount": Number(text[1]),
        "receiver": Number(text[0]),
    }
    let receiver = data["receiver"]
    let amount = data["amount"]

    if (receiver % 1 != 0 || amount % 1 != 0 || receiver <= 0 || amount <= 0) {
        let message = "Неправильно введены данные!";
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
        bcgcolor = "#3BFF86"
        output(message, bcgcolor);
    }
    else if (data["message"] == "receiver does not exist") {
        message = "Такого игрока не существует!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["message"] == "not enough money to transfer") {
        message = "Недостаточно средств для перевода!";
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



function postFirmService(text) {
    let data = {
        "service": Number(text[1]),
        "company": Number(text[0]),
        "paystatus": false,
    }

    let amount = data["service"]

    if (amount % 1 != 0 || amount < 1) {
        let message = "Неправильно введены данные!";
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlFirmServiceCallback;
        rs.httpPost("pay", JSON.stringify(data), "application/json");
    }
}

function htmlFirmServiceCallback(text) {
    let data = JSON.parse(text); console.log(data);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        let serviceName = data["name"],
        serviceCost = data["cost"],
        serviceCostTalic = talicWordEnding(serviceCost),
        serviceId = data["service"][0],
        companyId = data["service"][1];

        let modal = document.createElement("div");
        let functionName = `postPayFirmTrue(${serviceId}, ${companyId})`;
  
        modal.classList.add("modal");
        document.body.append(modal);
        modal.insertAdjacentHTML("afterbegin", `
        <div id="modal-overlay" class="modal-overlay">
          <div id="modal-window" class="modal-window">
            <div class="modal-header">
              <span class="modal-title">Правильно ли указана услуга?</span>
            </div>
            <div id="modal-body" class="modal-body">
                <p style="background-color: #FE9654; color: #FFF" class="modal-frame">Имя услуги:</p>
                <h3>"${serviceName}"</h3>
                <h3 style="background-color: #FE9654; color: #FFF" class="modal-frame">Стоимость услуги: ${serviceCost} ${serviceCostTalic}</h3>
            </div>
            <div class="modal-footer">
              <button onclick="modalCancel(true), ${functionName}" type="button" class="btn-orange">Да</button>
              <button type="button" onclick="modalCancel(true)" class="btn-orange">Нет</button>
            </div>  
          </div>
        </div>`);
    }
    else if (data["status"] == 404) {
        message = "Такая фирма или услуга не была найдена!";
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


function postPayFirmTrue(serviceId, companyId) {
    let data = {
        "service": serviceId,
        "company": companyId,
        "paystatus": true,
    }

    rs.callback = htmlPayFirmTrueCallback;
    rs.httpPost("pay", JSON.stringify(data), "application/json");
}

function htmlPayFirmTrueCallback(text) {
    let data = JSON.parse(text); console.log(data);

    if (data["status"] == 200) {
        message = "Операция прошла успешно!";
        bcgcolor = "#3BFF86"
        output(message, bcgcolor);
    }
    else if (data["message"] == "not enough money to pay") {
        message = "Недостаточно денег для перевода!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["message"] == "no such company") {
        message = "Такой фирмы или услуги не существует!";
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



function postTeacherSalary(text) {
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
            bcgcolor = "#3BFF86";
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



function postCompanySalary() {
    rs.callback = htmlCompanySalaryCallback;
    rs.httpPost("company-salary", null);
    Array.from(document.querySelectorAll("button")).forEach((elem) => {elem.setAttribute("disabled", "disabled")});
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



function getCompanyDebts() {
    rs.callback = htmlCompanyTaxesCallback;
    rs.httpGet('company-paytaxfine');
    Array.from(document.querySelectorAll("button")).forEach((elem) => {elem.setAttribute("disabled", "disabled")});
    
}

function htmlCompanyTaxesCallback(text) {
    let data = JSON.parse(text);
    let tax_amount = data["tax_amount"],
    talic = talicWordEnding(tax_amount);

    let label = "Уплата налогов фирмы";
    if (data["status"] == 200) {
        let message = `Налоги фирмы и её штрафы только что были уплачены!`;
        let bcgcolor = "#3BFF86";
        output(message, bcgcolor, label);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "debts have already been paid") {
            let message = `Налоги уже были уплачены за этот период!`;
            let bcgcolor = "#FE9654";
            output(message, bcgcolor, label);
        }
        else {
            let message = `У вас недостаточно средств для уплаты налогов и штрафов фирмы!<br>
                            Сумма к уплате налогов: ${tax_amount} ${talic}`;
            let bcgcolor = "#FE9654";
            output(message, bcgcolor, label);
        }
    }
    else {
        message = "Произошла непревиденная ошибка!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor, label);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



function postPayCompanySalary(text) {
    let employees = text[0].trim().split(" ");
    let salary = Number(text[1]);

    if (employees.filter((employee) => !!Number(employee) == true).length == employees.length && salary%1 == 0 && salary >= 1) {
        let data = {
            employees: employees.map((employee) => Number(employee)),
            salary: salary,
        }

        rs.callback = htmlPayCompanySalary;
        rs.httpPost("/company-salary", JSON.stringify(data), "application/json");
    }
    else {
        let message = "Неправильно введены данные!";
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
}

function htmlPayCompanySalary(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Зарплаты успешно выплачены!";
        bcgcolor = "#3BFF86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 400) {
        if (data["message"] == "tax aren't paid") {
            message = "Для выплаты зарплаты нужно уплатить налоги и штрафы!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else if (data["message"] == "not enough money") {
            message = "Недостаточно денег для выплаты зарплаты!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else {
            message = "Данных игроков нет в фирме!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
    }
}



function postAddEmployee(text) {
    data = {
        "company": `${text[2]}`,
        "founder": `${text[1]}`,
        "employee": `${text[0]}`,
    }
    let company = data["company"];
    let founder = data["founder"];
    let employee = data["employee"];

    if (company % 1 != 0 || founder % 1 != 0 || employee % 1 != 0 || company <= 0 || founder <= 0 || employee <= 0) {
        let message = "Неправильно введены данные!";
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlAddEmployeeCallback;
        rs.httpPost("add-employee", JSON.stringify(data), "application/json");
    }
}

function htmlAddEmployeeCallback(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;
    
    if (data["status"] == 200) {
        message = "Игрок успешно нанят!";
        bcgcolor = "#3BFF86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        message = "Такого владельца в фирме нет!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["status"] == 400) {
        message = "Либо игрока не существует, либо он уже работает в фирме!";
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



function postRemoveEmployee(text) {
    data = {
        "company": `${text[2]}`,
        "founder": `${text[1]}`,
        "employee": `${text[0]}`
    }

    rs.callback = htmlRemoveEmployeeCallback;
    rs.httpPost("remove-employee", JSON.stringify(data), "application/json")
}

function htmlRemoveEmployeeCallback(text) {
    let data = JSON.parse(text);

    if (data["status"] == 200) {
        message = "Игрок успешно уволен!";
        bcgcolor = "#3BFF86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        message = "Такого владельца в фирме нет!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["status"] == 400) {
        message = "Либо игрока не существует, либо он уже работает в фирме!";
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



function postAddPlayerFine(text) {
    let data = {
        "player": Number(text[0]),
        "fine": Number(text[1]),
    }
    let player = data["player"];
    let fine = data["fine"];
    let message = null, bcgcolor = null;

    if (player % 1 != 0 || fine % 1 != 0 || player <= 0 || fine <= 0) {
        message = "Неправильно введены данные!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlAddPlayerFine;
        rs.httpPost(`add-player-fine`, JSON.stringify(data), "application/json")
    }
}

function htmlAddPlayerFine(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Штраф выписан игроку успешно!";
        bcgcolor = "#3BFF86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        message = "Такого игрока не существует!";
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



function postAddFirmFine(text) {
    let data = {
        "firm": Number(text[0]),
        "fine": Number(text[1]),
    }
    let firm = data["firm"];
    let fine = data["fine"];
    let message = null, bcgcolor = null;

    if (firm % 1 != 0 || fine % 1 != 0 || firm <= 0 || fine <= 0) {
        message = "Неправильно введены данные!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlAddFirmFine;
        rs.httpPost(`add-firm-fine`, JSON.stringify(data), "application/json")
    }
}

function htmlAddFirmFine(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Штраф выписан фирме успешно!";
        bcgcolor = "#3BFF86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        message = "Такой фирмы не существует!";
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



function postChangeServiceCost(text) {
    let data = {
        "service": text[0].toUpperCase().trim(),
        "cost": text[1],
    }
    let cost = data["cost"];

    if (cost%1 != 0 || cost < 1) {
        message = "Неправильно введены данные!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlChangeServiceCostCallback;
        rs.httpPost(`change-service-cost`, JSON.stringify(data), "application/json")
    }
}

function htmlChangeServiceCostCallback(text) {
    let data = JSON.parse(text);
    if (data["status"] == 200) {
        message = "Стоимость услуги успешно изменена!";
        bcgcolor = "#3BFF86";
        output(message, bcgcolor);
    }
    else if (data["status"] == 406) {
        message = "Неправильно набрано число!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else if (data["status"] == 404) {
        message = "Такой услуги не существует!";
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



function getDebtors() {
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

    rs.callback = htmlDebtorsCallback;
    rs.httpGet("/debtors");
}

function htmlDebtorsCallback(text) {
    let transferDiv = document.getElementById("log-table");
    let data = JSON.parse(text);

    if (data["status"] == 200) {
        for (let i = 0; data["debtors"][i] != undefined; i++) {
            let player = `${data["debtors"][i][1]} ${data["debtors"][i][0]}, PLAYER_ID: ${data["debtors"][i][2]}`,
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



function getFinePlayerFind() {
    let input = document.getElementById("fine-input");
    document.getElementById("modal-body").innerHTML = "";
    document.getElementById("drop-charges").setAttribute("disabled", "disabled");

    if (input.value == "") {
        input.style.border = "3px solid #ff483b";
    }
    else {
        input.style.border = "3px solid #3BFF86"
        document.getElementById("find-player").setAttribute("disabled", "disabled");
        rs.callback = htmlFinePlayerFind;
        rs.httpGet(`check-player?player_id=${input.value}`);
    }
}

function htmlFinePlayerFind(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        let firstname = data["player"][0],
        lastname = data["player"][1],
        player_id = data["player"][2]
        fine = data["player"][3],
        talic = talicWordEnding(fine),
        tax = data["player"][4] == "1" ? "уплачены" : "не уплачены",
        body = document.getElementById("modal-body");


        body.insertAdjacentHTML("beforeend", `
        <h2 id="player_id">Игрок: ${firstname} ${lastname}, PLAYER_ID: ${player_id}</h2>
        <span>Налоги:</span><span id="taxes" style="background-color: #FE9654; color: #000" class="modal-frame">${tax}</span><br>
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
        try {document.getElementById("find-player").removeAttribute("disabled")} catch {};
    }, 1000);
}



function postFinePlayerPay() {
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
    let message = null, bcgcolor = null;

    if (data["status"] == 200) {
        message = "Штраф аннулирован, налоги были уплачены!"
        bcgcolor = "#3BFF86";
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



function postWithdraw(text) {
    data = {
        "player_id": `${text[0]}`,
        "amount": `${text[1]}`
    }
    let player_id = data["player_id"];
    let amount = data["amount"];
    
    if (player_id % 1 != 0 || amount % 1 != 0 || player_id <= 0 || amount <= 0) {
        let message = "Неправильно введены данные!";
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlWithdraw;
        rs.httpPost("withdraw", JSON.stringify(data), "application/json")
    }
}

function htmlWithdraw(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;
    
    if (data["status"] == 200) {
        message = "Деньги сняты успешно!";
        bcgcolor = "#3BFF86"
        output(message, bcgcolor)
    }
    else if (data["status"] == 400) {
        if (data["message"] == "not enough cash") {
            message = "У вас кончились наличные деньги!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else if (data["message"] == "not enough money to withdraw") {
            message = "У игрока недостаточно денег для вывода!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else {
            message = "Неправильно введены данные!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
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



function postDeposit(text) {
    data = {
        "player_id": `${text[0]}`,
        "amount": `${text[1]}`
    }
    let player_id = data["player_id"];
    let amount = data["amount"]

    if (player_id % 1 != 0 || amount % 1 != 0 || player_id <= 0 || amount <= 0) {
        let message = "Неправильно введены данные!";
        let bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
    else {
        rs.callback = htmlDeposit;
        rs.httpPost("deposit", JSON.stringify(data), "application/json")
    }
}

function htmlDeposit(text) {
    let data = JSON.parse(text);
    let message = null, bcgcolor = null;
    
    if (data["status"] == 200) {
        message = "Деньги внесены успешно!";
        bcgcolor = "#3BFF86"
        output(message, bcgcolor)
    }
    else if (data["status"] == 400) {
        if (data["message"] == "not enough cash") {
            message = "У вас кончились наличные деньги!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else if (data["message"] == "not enough money to withdraw") {
            message = "У игрока недостаточно денег для вывода!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
        else {
            message = "Неправильно введены данные!";
            bcgcolor = "#FE9654";
            output(message, bcgcolor);
        }
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



function getAllLogs(text) {
    if (text%1 == 0 && text >= 0) {
        let logsDiv = document.getElementById("log-table");
        try {logsDiv.remove()} catch {};
        let functionName = "getClearLogs";
        functionName = CONFIRM != "false" ? `checkFieldsDataSave('${functionName}', true)` : `checkFieldsDataSave(${functionName}, false)`;
    
    
    
        logsDiv = document.createElement("div");
        logsDiv.classList.add("log-table");
        logsDiv.setAttribute("id", "log-table");
        document.body.append(logsDiv);
        lightDarkToggle();
        logsDiv.insertAdjacentHTML("afterbegin", `
        <h2>Здесь будут выводиться все логи платёжной системы</h2>
        <button onclick="${functionName}" id="clear-logs" class="btn-purple">Очистить системные логи</button><br>
        <hr>`);
        logsDiv.animate([ {opacity: 0}, {opacity: 1}], { duration: 1000});
        
        rs.callback = htmlAllLogsCallback;
        rs.httpGet(`ministry_economic_logs?length=${text}`);
    }
    else {
        message = "Неправильно введены данные!";
        bcgcolor = "#FE9654";
        output(message, bcgcolor);
    }
}

function htmlAllLogsCallback (text) {
    let logsDiv = document.getElementById("log-table");
    let data = JSON.parse(text);

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
        
        window.scrollBy({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
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
        bcgcolor = "#3BFF86";
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



setInterval(() => {
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