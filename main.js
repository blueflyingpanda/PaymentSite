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
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", this.url + "/" + path, this.isAsync);
        xmlHttp.send(null);
    }

    httpPost(path = "", data) {
        var xmlHttp = new XMLHttpRequest();
        let callback = this.callback
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("POST", this.url + "/" + path, this.isAsync);
        xmlHttp.send(data);
    }
}

const url = "https://lhelper.pythonanywhere.com";  // "http://127.0.0.1:5000"

let rs = new RequestsSender(url, RequestsSender.logCallback);

function main() {
    addEventListener("submit", (e) => {
        e.preventDefault();
        rs.callback = RequestsSender.logCallback
        let form = document.getElementById('studentForm');
        rs.httpPost('student', new FormData(form))
    })
}

function htmlCustomCallback(text) {
    let data = JSON.parse(text);
    if (data["status"] == 200) {
        let output = document.getElementById("output")
        for (let i = 0; i < data["message"].length; i++) {
            output.innerHTML += `<h1>${data["message"][i][3]} ${data["message"][i][1]} ${data["message"][i][2]}</h1>`;
            output.innerHTML += `<h2>Класс: ${data["message"][i][4]}</h2>`;
            output.innerHTML += `<h3>Почта: ${data["message"][i][5]}</h3>`;
            output.innerHTML += `<h4>ШкололоКоинов: ${data["message"][i][6]}</h4>`;
            output.innerHTML += `<hr>`;
        }
    }

}

function showStudents() {
    clearStudents()
    rs.callback = htmlCustomCallback
    rs.httpGet()
}

function clearStudents() {
    document.getElementById("output").innerHTML = '<button onclick="showStudents()">показать список</button><button onclick="clearStudents()">очистить список</button>';
}
