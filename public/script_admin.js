import { request } from "./js/request.mod.js";
import { Cookies } from "./js/cookies.cls.js"

const $s = s => document.querySelector(s);
const $sAll = s => document.querySelectorAll(s);

window.HAIRDRESSERS = [];
const COOKIE = new Cookies();

if (COOKIE.get("email")) {
    request.get("/login-cookie", (res) => {
        var HAIRDRESSERS = JSON.parse(res);
        adminInterface.renderHairdressers(HAIRDRESSERS);
    });
} else {
    var main = $s("#main");
    main.innerHTML = `
    <div class="container">
            <div class="screen">
                <div class="screen__content">
                    <div class="login">
                        <div class="login__field">
                            <i class="login__icon fas fa-user"></i>
                            <input type="text" name="email" class="login__input" placeholder="Email">
                        </div>
                        <div class="login__field">
                            <i class="login__icon fas fa-lock"></i>
                            <input type="password" name="password" class="login__input" placeholder="Jelszó">
                        </div>
                        <button id="login__submit" class="button login__submit">
                            <span class="button__text">Bejelentkezés</span>
                            <i class="button__icon fas fa-chevron-right"></i>
                        </button>
                    </div>

                </div>
                <div class="screen__background">
                    <span class="screen__background__shape screen__background__shape4"></span>
                    <span class="screen__background__shape screen__background__shape3"></span>
                    <span class="screen__background__shape screen__background__shape2"></span>
                    <span class="screen__background__shape screen__background__shape1"></span>
                </div>
            </div>
        </div>
    `;

    //login (email & password check)
    $s("#login__submit").onclick = function () {
        var email = $s(`input[name="email"]`).value.trim();
        var password = $s(`input[name="password"]`).value.trim();
        if (ValidateEmail($s(`input[name="email"]`)) && password) {
            request.post(
                "/login",
                {
                    email,
                    password
                },
                function (res) {
                    var HAIRDRESSERS = JSON.parse(res);
                    adminInterface.renderHairdressers(HAIRDRESSERS);
                });
            COOKIE.set("email", email);
        }
    }
    //email ellenőrzés
    function ValidateEmail(inputText) {
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (inputText.value.match(mailformat)) {
            return true;
        }
        else {
            alert("Érvénytelen e-mail címet adott meg!");
            return false;
        }
    }

}

var n = 0;
var filterHd = [];
var date = new Date();
var months = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
var week = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

function dateStepTPL(nowDate, date7) {
    let stringTpl = `
    <div class="navbar ">
        <div class="nav-logo">
            <div id="page-logo">
                <img src="style/logo.png">
            </div>
           <div class="title">JS Fodrászat</div>
           </div>
           <button id="logout">Kijelentkezés</button>
    </div>
    <div>
    <div class="main-container">
        <div class="date-header-frame"> 
            <div class="date-header">
                <div class="left-arrow arrow">&#8592;</div>
                <div class="date-header-week"> ${months[nowDate.getMonth()] + ". " + (("0" + nowDate.getDate()).slice(-2)) +
        (nowDate.getTime() === date7.getTime() ? ". " :
            ". - " +
            (months[nowDate.getMonth() + 1] === undefined ? months[nowDate.getMonth() - 11] : months[nowDate.getMonth()])
            + ". " + (("0" + date7.getDate()).slice(-2)))}    
                </div>
                <div class="right-arrow arrow">&#8594;</div> 
            </div>
        </div> 
       <div class="hd-select">
`;

    return stringTpl
};

//input - fodrászok szűrése
function filterEmployee(obj) {
    let stringTpl = "";
    for (const check of obj) {
        stringTpl += `
                <div>
                    <input type="checkbox" name="hairdressers" value="${check._id}">
                    <label for="vehicle1">${check.name}</label><br>
                </div>
        `;
    }
    stringTpl += `
                <div>
                    <button id="filter" class="btn">Szűrés</button>
                    <button id="filter-delete" class="btn">Szűrés törlése</button>
                </div> 
            </div> 
            <div class="hairdressers">
    `;
    return stringTpl;
}

function adminTPL(obj, nowDate) {
    let stringTpl = "";
    for (let i = 0; i < n; i++) {
        var openTime = nowDate;
        var closeTime = "18:30";
        openTime.setHours(8, 0, 0, 0);

        if (i === 0) {
            stringTpl += `
            <div class="hd-card-time">
                <div class="hd-card-main hd-card-main-time">
                </div>
            <div>
    `;

            //nyitvatartási idők kiírása
            while (closeTime != (adminInterface.padTo2Digits(openTime.getHours()) + ":" + adminInterface.padTo2Digits(openTime.getMinutes()))) {
                stringTpl += `
   <div class="sideband-time">${adminInterface.padTo2Digits(openTime.getHours()) + ":" + adminInterface.padTo2Digits(openTime.getMinutes())}</div>
    `;
                openTime.setMinutes(openTime.getMinutes() + 30);
            }
            stringTpl += `
        </div>
    </div>
  `;
        }

        stringTpl += `
    <div class="hd-days">
        <div class="hd-days-display">${(("0" + (nowDate.getMonth() + 1))).slice(-2) + ". "
            + (("0" + nowDate.getDate()).slice(-2)) + " " + week[nowDate.getDay()]}
        </div>
        <div class="hd-day-cards">
        `;


        let cardColor = adminInterface.random_bg_color();
        //fodrászok és foglalásaik megjelenítése
        for (const hdItem of obj) {
            openTime.setHours(8, 0, 0, 0);

            //fodrászok szűrése
            if (filterHd.find(e => e === hdItem._id) || filterHd.length === 0) {
                var opening = hdItem.open.find(p => p.day === week[nowDate.getDay()]);
                stringTpl += `
        <div class="hd-card">
            <div class="hd-card-main" data-id="${hdItem._id}" data-name="${hdItem.name}" style="background-color:${cardColor}">
                <div class="inner-card" >
                    <div class="hd-image">
                        <img src="${hdItem.img || "img/noimage.jpg"}">
                    </div>
                    <div class="hd-nickname">${hdItem.name}</div>
                    <div class="hd-titulus">${hdItem.titulus}</div>
                    <div>                    
                    ${opening ? opening.from + " - " + opening.to : "zárva"}
                    </div>
                </div>
            </div>
        <div style="background-color:${opening ? "" : "#b2aeae"}">
        `;
                //foglalások megjelenítése
                while (closeTime != (adminInterface.padTo2Digits(openTime.getHours()) + ":" + adminInterface.padTo2Digits(openTime.getMinutes()))) {
                    let time = (adminInterface.padTo2Digits(openTime.getHours()) + ":" + adminInterface.padTo2Digits(openTime.getMinutes()));
                    let checkRes = true;

                    hdItem.reservations.find(e => {

                        if (e.dateDay === adminInterface.formatDate(openTime) && e.dateTime === time) {
                            let heigth = (e.serviceTime / 30) * 60;
                            let endOfServices = new Date(openTime);
                            endOfServices.setMinutes(endOfServices.getMinutes() + e.serviceTime);
                            let endOfServiceTime = (adminInterface.padTo2Digits(endOfServices.getHours()) + ":" + adminInterface.padTo2Digits(endOfServices.getMinutes()));
                            stringTpl += `
                <div class="hd-time" style="height:${heigth}px;" >
                     <div class="reserved-time" style="background-color:${adminInterface.random_bg_color()};height:${heigth - 5}px;"> 
                        <div>${e.name}</div>
                        <div style="display:none">${e.dateDay}</div>
                        <div style="display:none">${hdItem._id}</div>
                        <div style="display:none">${e.email}</div>
                        <div class="hd-services">${e.services.join(', ')}</div>
                        <div>${e.dateTime} - ${endOfServiceTime} </div>
                        <div class="dellink">X</div>
                     </div>
                </div>
                `;
                            openTime.setMinutes(openTime.getMinutes() + e.serviceTime);
                            checkRes = false;
                        }
                    });
                    //ha nincs foglalás (üres)
                    if (checkRes) {
                        stringTpl += `
            <div class="hd-time">
            </div>
            `;
                        openTime.setMinutes(openTime.getMinutes() + 30);
                    }
                }

                stringTpl += `
            </div>
        </div>
      `;
            }
        }

        stringTpl += `
        </div>
    </div>
    `;
        nowDate.setDate(nowDate.getDate() + 1);
    }

    stringTpl += `
        </div>
    </div>
    `;

    return stringTpl;
}

const adminInterface = {
    renderHairdressers: function renderHairdressers(obj, list) {
        //media query
        var x = window.matchMedia("(min-width: 1600px)");
        var y = window.matchMedia("(min-width: 1100px)");

        adminInterface.myFunctionX(x);
        adminInterface.myFunctionY(y);


        var main = $s("#main");
        var nowDate = new Date(date);
        var date7 = new Date(date);
        date7.setDate(date7.getDate() + n - 1);

        var text = "";
        text += dateStepTPL(nowDate, date7);

        text += filterEmployee(obj);

        if (list)
            text += adminTPL(list, nowDate);
        else
            text += adminTPL(obj, nowDate);

        main.innerHTML = text;

        //kijelentkezés
        $s("#logout").onclick = function () {
            COOKIE.clear("email")
            location.reload();
        }

        //dátum léptetése előre
        $s(".right-arrow").onclick = function () {
            date.setDate(date.getDate() + n);
            adminInterface.renderHairdressers(obj);
        };

        //dátum léptetése vissza
        $s(".left-arrow").onclick = function () {
            date.setDate(date.getDate() - n);
            adminInterface.renderHairdressers(obj);

        };

        //szűrés
        $s("#filter").onclick = function () {

            filterHd = [];
            $sAll(`input[name="hairdressers"]`).forEach(d => {
                if (d.checked === true) {
                    filterHd.push(d.value)
                }
            });
            if (filterHd.length > 0) {
                request.post(
                    "/filter-hairdressers",
                    {
                        filterHd
                    },
                    function (res) {
                        var FILTER = JSON.parse(res);
                        adminInterface.renderHairdressers(obj, FILTER);
                    });
            }
        };

        //szűrés (fodrászok) törlése
        $s("#filter-delete").onclick = function () {
            if (filterHd.length > 0) {
                filterHd = [];
                n = 0;
                adminInterface.renderHairdressers(obj);
            }
        };

        //foglalások törlése és küldése a server felé
        $sAll(".reserved-time").forEach(d => {
            d.querySelector(".dellink").onclick = function () {
                let name = d.children[0].innerText;
                let day = d.children[1].innerText;
                let id = d.children[2].innerText;
                let email = d.children[3].innerText;
                let time = d.children[5].innerText.slice(0, 5);

                if (confirm("Biztos, hogy törölni szeretnéd " + name + " foglalását?")) {
                    request.delete(`delete/${name}/time${time}/day${day}/id${id}/email${email}`, function (res) {
                        adminInterface.renderHairdressers(JSON.parse(res));
                    });
                }
            }
        });

        //media query figyelése
        x.addEventListener("change", (event) => {

            if (event.matches) {
                switch (true) {
                    case filterHd.length === 1:
                        n = 12;
                        adminInterface.renderHairdressers(obj);
                        break;
                    case filterHd.length === 2:
                        n = 6;
                        adminInterface.renderHairdressers(obj);
                        break;
                    default:
                        n = 3;
                        adminInterface.renderHairdressers(obj);
                        break;
                }
            } else {
                switch (true) {
                    case filterHd.length === 1:
                        n = 8;
                        adminInterface.renderHairdressers(obj);
                        break;
                    case filterHd.length === 2:
                        n = 4;
                        adminInterface.renderHairdressers(obj);
                        break;
                    default:
                        n = 2;
                        adminInterface.renderHairdressers(obj);
                        break;
                }
            }
        });

        y.addEventListener("change", (event) => {

            if (event.matches) {
                switch (true) {
                    case filterHd.length === 1:
                        n = 8;
                        adminInterface.renderHairdressers(obj);
                        break;
                    case filterHd.length === 2:
                        n = 4;
                        adminInterface.renderHairdressers(obj);
                        break;
                    default:
                        n = 2;
                        adminInterface.renderHairdressers(obj);
                        break;
                }

            } else {
                switch (true) {
                    case filterHd.length === 1:
                        n = 4;
                        adminInterface.renderHairdressers(obj);
                        break;

                    case filterHd.length === 2:
                        n = 2;
                        adminInterface.renderHairdressers(obj);
                        break;
                    default:
                        n = 1;
                        adminInterface.renderHairdressers(obj);
                        break;
                }
            }
        });



    },
    //dátum felosztása YYYY-MM-DD
    formatDate: function formatDate(date) {
        return [
            date.getFullYear(),
            adminInterface.padTo2Digits(date.getMonth() + 1),
            adminInterface.padTo2Digits(date.getDate()),
        ].join('.');
    },

    //kétjegyű szám
    padTo2Digits: function padTo2Digits(num) {
        return String(num).padStart(2, '0');
    },



    //véletlen szín generálás
    random_bg_color: function random_bg_color() {
        var x = Math.floor(Math.random() * 256);
        var y = Math.floor(Math.random() * 200) + 56;
        var z = Math.floor(Math.random() * 156) + 100;
        var bgColor = "rgb(" + x + "," + y + "," + z + ")";
        return bgColor;
    },

    //media query
    myFunctionX: function myFunctionX(x) {
        if (x.matches) {
            switch (true) {
                case filterHd.length === 1:
                    n = 12;
                    break;
                case filterHd.length === 2:
                    n = 6;
                    break;
                default:
                    n = 3;
                    break;
            }
        } else {
            switch (true) {
                case filterHd.length === 1:
                    n = 8;
                    break;
                case filterHd.length === 2:
                    n = 4;
                    break;
                default:
                    n = 2;
                    break;
            }
        }
    },
    myFunctionY: function myFunctionY(y) {
        if (y.matches) {
            switch (true) {
                case filterHd.length === 1:
                    n = 8;
                    break;
                case filterHd.length === 2:
                    n = 4;
                    break;
                default:
                    n = 2;
                    break;
            }

        } else {
            switch (true) {
                case filterHd.length === 1:
                    n = 4;
                    break;

                case filterHd.length === 2:
                    n = 2;
                    break;
                default:
                    n = 1;
                    break;
            }
        }
    }
}










