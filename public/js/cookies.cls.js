export class Cookies {

    cookie = {};

    constructor() {
        let tmp = document.cookie.split("; ");

        for (let c of tmp) {
            let cookieKeyValue = c.split("=");
            this.cookie[cookieKeyValue[0]] = cookieKeyValue[1];
        }
    }

    get(key) {
        return this.cookie[key];
    }

    set(key, value, expireDay = 1, path = "/") {
        this.cookie[key] = value;

        let date = new Date();
        date.setTime(date.getTime() + (1000 * 60 * 60 * 24 * expireDay));

        document.cookie = `${key}=${value};expires=${date.toUTCString()};path=${path}`;
    }

    clear(key) {
        this.cookie[key] = undefined;
        document.cookie = `${key}=;expires=${new Date(1980).toUTCString()};path=/;`;

        //set(key, undifined, -1);
    }
}