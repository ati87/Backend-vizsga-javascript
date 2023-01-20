const request = {

    get: function (url, succes, method = "GET") {

        let xhr = request.createHTTP(succes);

        xhr.open(method, url);
        xhr.send();
    },

    post: function (url, body, succes) {

        let xhr = request.createHTTP(succes);

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify(body));
    },

    delete: function (url, succes) {
        request.get(url, succes, "DELETE");
    },

    createHTTP: function (cbFn) {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200)
                cbFn(xhr.responseText);
        }

        return xhr;
    }
}

export { request };