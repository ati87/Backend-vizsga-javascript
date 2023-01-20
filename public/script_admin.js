import { request } from "./js/request.mod.js";

const $s = s => document.querySelector(s);
const $sAll = s => document.querySelectorAll(s);

window.HAIRDRESSERS = [];

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
                renderHairdressers(HAIRDRESSERS);
            })
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


var n = 0;
var filterHd = [];
var date = new Date();
var months = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
var week = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

function renderHairdressers(obj) {
    //media query
    var x = window.matchMedia("(min-width: 1600px)");
    var y = window.matchMedia("(min-width: 1200px)");
    if (n === 0) {
        myFunctionX(x);
        myFunctionY(y);
    }

    var main = $s("#main");
    var stringTpl = "";

    var nowDate = new Date(date);
    var date7 = new Date(date);;
    date7.setDate(date7.getDate() + n - 1);

    stringTpl += `
        <div class="main-container">
            <div class="date-header-frame"> 
                <div class="date-header">
                    <div class="left-arrow arrow">&#8592;</div>
                    <div class="date-header-week"> ${months[nowDate.getMonth()] + ". " + (("0" + nowDate.getDate()).slice(-2)) + ". - " +
                    (months[nowDate.getMonth() + 1] === undefined ? months[nowDate.getMonth() - 11] : months[nowDate.getMonth()])
                     + ". " + (("0" + date7.getDate()).slice(-2))}    
                    </div>
                    <div class="right-arrow arrow">&#8594;</div> 
                </div>
            </div> 
           <div class="hd-select">
    `;
    //input - fodrászok szűrése
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
                    <button id="filter">Szűrés</button>
                    <button id="filter-delete">Szűrés törlése</button>
                </div> 
            </div> 
            <div class="hairdressers">
    `;


    for (let i = 0; i < n; i++) {
        var openTime = nowDate;
        var closeTime = "18:30";
        openTime.setHours(8, 0, 0, 0);

        stringTpl += `
        <div class="hd-days">
            <div class="hd-days-display">${months[nowDate.getMonth()] + ". " 
            + (("0" + nowDate.getDate()).slice(-2)) + " " + week[nowDate.getDay()]}
            </div>
            <div class="hd-day-cards">
            `;

        if (i === 0) {
            stringTpl += `
                <div class="hd-card-time">
                    <div class="hd-card-main">
                    </div>
                <div>
        `;

            //nyitvatartási idők kiírása
            while (closeTime != (padTo2Digits(openTime.getHours()) + ":" + padTo2Digits(openTime.getMinutes()))) {
                stringTpl += `
       <div class="sideband-time">${padTo2Digits(openTime.getHours()) + ":" + padTo2Digits(openTime.getMinutes())}</div>
        `;
                openTime.setMinutes(openTime.getMinutes() + 30);
            }
            stringTpl += `
            </div>
        </div>
      `;
        }
        //fodrászok és foglalásaik megjelenítése
        for (const hdItem of obj) {
            openTime.setHours(8, 0, 0, 0);
            //fodrászok szűrése
            if (filterHd.find(e => e === hdItem._id) || filterHd.length === 0) {
                stringTpl += `
        <div class="hd-card">
            <div class="hd-card-main" data-id="${hdItem._id}" data-name="${hdItem.name}">
                <div class="inner-card">
                        <div class="hd-image">
                            <img src="${hdItem.img || "img/noimage.jpg"}">
                        </div>
                        <div class="hd-nickname">${hdItem.name}</div>
                        <div class="hd-titulus">${hdItem.titulus}</div>
                        <div>`
                //nyitvatartás megjelenítése
                var opening = hdItem.open.find(p => p.day === week[nowDate.getDay()]);
                stringTpl += `
                        ${opening ? opening.from + " - " + opening.to : "zárva"}
                        </div>
                </div>
            </div>
        <div>
        `;
                //foglalások megjelenítése
                while (closeTime != (padTo2Digits(openTime.getHours()) + ":" + padTo2Digits(openTime.getMinutes()))) {
                    let time = (padTo2Digits(openTime.getHours()) + ":" + padTo2Digits(openTime.getMinutes()));
                    let checkRes = true;

                    hdItem.reservations.find(e => {
                        
                        if (e.dateDay === formatDate(openTime) && e.dateTime === time) {
                            let heigth = (e.serviceTime / 30) * 60;
                            let endOfServices = new Date(openTime);
                            endOfServices.setMinutes(endOfServices.getMinutes() + e.serviceTime);
                            let endOfServiceTime = (padTo2Digits(endOfServices.getHours()) + ":" + padTo2Digits(endOfServices.getMinutes()));
                            stringTpl += `
                    <div class="hd-time" style="height:${heigth}px;" >
                         <div class="reserved-time" style="background-color:${random_bg_color()};height:${heigth - 5}px;"> 
                            <div>${e.name}</div>
                            <div style="display:none">${e.dateDay}</div>
                            <div style="display:none">${hdItem._id}</div>
                            <div style="display:none">${e.email}</div>
                            <div>${e.services}</div>
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

    main.innerHTML = stringTpl;

    //dátum léptetése előre
    $s(".right-arrow").onclick = function () {
        date.setDate(date.getDate() + n);
        renderHairdressers(obj);
    };

    //dátum léptetése vissza
    $s(".left-arrow").onclick = function () {
        date.setDate(date.getDate() - n);
        renderHairdressers(obj);

    };

    //dátum felosztása YYYY-MM-DD
    function formatDate(date) {
        return [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('.');
    };

    //kétjegyű szám
    function padTo2Digits(num) {
        return String(num).padStart(2, '0');
    };

    //szűrés
    $s("#filter").onclick = function () {

        filterHd = [];
        $sAll(`input[name="hairdressers"]`).forEach(d => {
            if (d.checked === true) {
                filterHd.push(d.value);
            }
        });
        if (filterHd.length > 0) {
            renderHairdressers(obj);
        }
    };

    //szűrés törlése
    $s("#filter-delete").onclick = function () {
        if (filterHd.length > 0) {
            filterHd = [];
            renderHairdressers(obj);
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
                    renderHairdressers(JSON.parse(res));
                    
                }); 
            }
        }
    });

    //véletlen szín generálás
    function random_bg_color() {
        var x = Math.floor(Math.random() * 256);
        var y = Math.floor(Math.random() * 200) + 56;
        var z = Math.floor(Math.random() * 156) + 100;
        var bgColor = "rgb(" + x + "," + y + "," + z + ")";

        return bgColor;
    }

    //media query
    function myFunctionX(x) {
        if (x.matches) {
            n = 3;
        } else {
            n = 2;
        }
    }
    function myFunctionY(y) {
        if (y.matches) {
            n = 2;
        } else {
            n = 1;
        }
    }
    //media query figyelése
    x.addEventListener("change", (event) => {

        if (event.matches) {
            n = 3;
            renderHairdressers(obj);
        } else {
            n = 2;
            renderHairdressers(obj);
        }
    });
    y.addEventListener("change", (event) => {

        if (event.matches) {
            n = 2;
            renderHairdressers(obj);
        } else {
            n = 1;
            renderHairdressers(obj);
        }
    });

}






