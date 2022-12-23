class RequestsSender {

    constructor(url, callback, isAsync = true) {
        this.url = url;
        this.callback = callback;
        this.isAsync = isAsync;
    }

    static logCallback(text) {
        console.log(text)
    }

    static alertCallback(text) {
        alert(text)
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
        firstName = data["teacher"][0][0];
        middleName = data["teacher"][0][1];
        money = data["teacher"][0][3];
        inn = data["teacher"][0][4];
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
        firstName = data["player"][0][0];
        lastName = data["player"][0][2];
        gradeInfo = data["player"][0][3];
        money = data["player"][0][4];
        inn = data["player"][0][6];
        console.log(data)
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
    }
    else {
        alert(data["status"]);
    }
}

function invalidPassword(form) {
    alert('Wrong password!');
    form.reset();
}

function validPassword(form, formData) {
    formData.set("password", sha256(formData.get("password")))
    rs.httpPost('auth', formData);
    form.reset();
}

function main() {
    if (localStorage.getItem("Authorization") && localStorage.getItem("isTeacher") !== null) {
        if (localStorage.getItem("isTeacher") == "true") {
            window.location.replace(`${baseURL}/teacher.html`);
        }
        else {
            window.location.replace(`${baseURL}/player.html`);
        }
    }
    addEventListener("submit", (e) => {
        e.preventDefault();
        rs.callback = htmlAuthCallback
        let form = document.getElementById('authForm');
        let formData = new FormData(form);
        let password = formData.get("password")
        if (!password || password.length < commonPasswordLength) {
            invalidPassword(form);
        }
        else {
            validPassword(form, formData);
        }
    })
}
