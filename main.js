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

const url = "http://127.0.0.1:5000";  // "http://lhelper.pythonanywhere.com"

let rs = new RequestsSender(url, RequestsSender.logCallback);

function main() {
    addEventListener("submit", (e) => {
        e.preventDefault();
        let form = document.getElementById('studentForm');
        rs.httpPost('student', new FormData(form))
    })
}
