import { request } from "./js/request.mod.js";
import { booking } from "./booking.js";

const $s = s => document.querySelector(s);
const $sAll = s => document.querySelectorAll(s);

var week = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
var months = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
var date = new Date();

var filterHd = [];
var gender;
var n = 0;
var numbOfRows = 0

window.SERVICES = [];

//media query
var x = window.matchMedia("(min-width: 900px)");
if (n === 0) {
    myFunctionX(x);
}
//media query
function myFunctionX(x) {
    if (x.matches) {
        n = 3;
    } else {
        n = 2;
    }
}

//media query figyelése (szűrési feltételek törlése)
x.addEventListener("change", (event) => {
    if (!event.matches) {
        Array.from($sAll(".search-2")).forEach(e => e.checked = false);
        Array.from($sAll(".search-2")).forEach(e => e.disabled = false);
        $s("#female").disabled = false;
        $s("#male").disabled = false;
        $s("#all").checked = true;
        filterHd = [];
        appointments.load();
    }
});


window.addEventListener("load", function () {
    updatenumbOfRows();
});

window.addEventListener("resize", function () {
    updatenumbOfRows();
    // updateFilter();
});
function updatenumbOfRows() {
    let width = window.innerWidth;

    if (width <= 767 && numbOfRows != 3) {
        numbOfRows = 3;
        appointments.load();
    } else if (width > 767 && numbOfRows != 6) {
        numbOfRows = 6;
        appointments.load();
    }
};

//dátum léptetés
function dateStepTPL(date1, date7) {
    return `
    <div class="date-header-frame"> 
        <div class="date-header">
            <div class="left-arrow arrow">&#8592;</div>
            <div class="date-header-week">
                    ${months[date1.getMonth()] + ". " + (("0" + date1.getDate()).slice(-2)) + ". - " +
        (months[date7.getMonth() + 1] === undefined ? months[date7.getMonth() - 11] : months[date7.getMonth()])
        + ". " + (("0" + date7.getDate()).slice(-2))}    
            </div>
            <div class="right-arrow arrow">&#8594;</div> 
        </div>
    </div> 
    `;
};

//fodrászok megjelenítése
var cardTPL = hdItem => `
<div class="hd-card" data-id="${hdItem._id}" data-name="${hdItem.name}">
    <div class="inner-card">
        <div class="hd-image">
            <img src="${hdItem.img || "img/noimage.jpg"}">
        </div>
        <div class="hd-main">
            <div class="hd-nickname">${hdItem.nickname}</div>
            <div class="hd-titulus">${hdItem.titulus}</div>
            <div class="hd-card-services">
                <ul> <li>Szolgáltatások: </li>
                    ${hdItem.services.map(e => {
    return "<li>" + e.service + "</li>"
}).join("")}
                </ul>
            </div>
        </div>
    </div>
    <div class="mobil-appointments">
        Időpontok
    </div>
    <div class="card-calendarium">
        <div class="date-now">
            <div class="mobil-nickname">${hdItem.nickname} időpontjai:</div>
            <div class="mobil-calendar-close"></div>
            <div class="date-week"> 
            `;

//időpontok megjelenítése
function appointmentsTPL(hdItem, date1, numbOfRows) {
    let text = `
                        <div class="date-days-services">
                            <div class="date-days" 
                                data-date ="${date1.getFullYear() + "." + (("0" + (date1.getMonth() + 1))).slice(-2) + "."
        + ("0" + date1.getDate()).slice(-2)}">   
                                <div class="date-days-day"> ${week[date1.getDay()]} </div>
                                <div> ${date1.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? "Ma" : (("0" + (date1.getMonth() + 1))).slice(-2) + "."
            + (("0" + date1.getDate()).slice(-2))}  </div>  
                            </div>    
                        <div class="data-time">  
                    ${hdItem.open.map(e => {
                if (e.day == week[date1.getDay()]) {
                    //"+Több" megjelenítéséhez
                    let ifMore = 0;
                    let ifMoreString = 0;
                    let serviceString = "";
                    let openTime = "";
                    let fromArray = e.from.split(":");
                    let openDate = date1;
                    openDate.setHours(fromArray[0], fromArray[1], 0, 0);

                    //Nyitvatartási idő és foglalások megjelenítése
                    while (openTime.replace(":", "") <= e.to.replace(":", "")) {
                        let check = 0;
                        //ne jelenítsen meg foglalást a "Mai" nap, ha már az a fogadási idő elmúlt
                        if (new Date() > openDate) {
                            openDate.setMinutes(openDate.getMinutes() + 30);
                        } else {
                            //Foglalások ellenőrzése és megjelenítése
                            hdItem.reservations.map(o => {
                                if (openDate.getTime() === new Date(o.date).getTime()) {
                                    if (ifMore <= 6) {
                                        let resTime = new Date(o.date);

                                        serviceString += `
                                                <div class="date-time-services-reserved " title="foglalt">
                                                ${appointments.padTo2Digits(resTime.getHours()) + ':' + appointments.padTo2Digits(resTime.getMinutes())}</div>
                                                `;
                                        openDate.setMinutes(openDate.getMinutes() + o.serviceTime);
                                        check++;
                                        ifMore++;
                                    } else {
                                        serviceString += `
                                                <div class="date-time-services-reserved d-none" title="foglalt">` + openTime + `</div>
                                                `;
                                        openDate.setMinutes(openDate.getMinutes() + o.serviceTime);
                                        check++;
                                        ifMore++;
                                    }
                                }
                            });
                            //Ha nincs foglalás, akkor a nyitvatártási idők megjelenítése
                            if (check === 0) {
                                if (ifMore > numbOfRows) {
                                    if (ifMoreString === 0) {
                                        serviceString += `
                                                <div class="date-time-services-more">+ Több</div>
                                                `;
                                        ifMoreString++;
                                    }
                                    serviceString += `
                                            <div class="date-time-services d-none" data-date-time="${openDate}" data-date="${appointments.formatDate(openDate)}" data-closing="${e.to}" data-time="${openTime}" data-id="${hdItem._id}">`
                                        + openTime + `</div>
                                                `;
                                    openDate.setMinutes(openDate.getMinutes() + 30);
                                } else if (openTime) {
                                    serviceString += `
                                    <div class="date-time-services" data-date-time="${openDate}" data-date="${appointments.formatDate(openDate)}" data-closing="${e.to}" data-time="${openTime}" data-id="${hdItem._id}">`
                                        + openTime + `</div>
                                        `;
                                    openDate.setMinutes(openDate.getMinutes() + 30);
                                    ifMore++;
                                }
                            }
                            openTime = appointments.padTo2Digits(openDate.getHours()) + ":" + appointments.padTo2Digits(openDate.getMinutes());
                        }
                    }
                    return serviceString;
                }
            }).join("")}
                            </div> 
                        </div> 
               `;
    date1.setDate(date1.getDate() + 1);

    return text;
};


//Oldal lerenderelése
const appointments = {
    render: function renderServices(hairdresserList) {
        $s(".main").style.backgroundImage = "none";
        var main = $s(".main-card");

        $s("#sideband").style.display = "block";

        var date1 = new Date(date);
        var date7 = new Date(date);
        date7.setDate(date7.getDate() + 6);

        var mainString = "";
        //TPL
        mainString += dateStepTPL(date1, date7);

        for (const hdItem of hairdresserList) {
            date1 = new Date(date);
            //TPL
            mainString += cardTPL(hdItem);

            //napok és foglalási idők megjelenítése
            for (let i = 0; i < 7; i++) {
                //TPL
                mainString += appointmentsTPL(hdItem, date1, numbOfRows);
            }
            mainString += `   
                        </div>                     
                    </div>
                </div>
            </div>  
        </div>
        `;
        }
        //szolgáltatások szűrése
        $sAll(`input[name="search-1"]`).forEach(d => {
            d.onclick = function () {

                switch (true) {
                    case d.value === "Férfi":

                        gender = d.value

                        request.post(
                            "/filter-gender",
                            {
                                gender
                            },
                            function (res) {
                                var FILTER = JSON.parse(res);
                                renderServices(FILTER);
                            });
                        $s("#serv-1").disabled = true;
                        $s("#serv-2").disabled = false;
                        $s("#serv-3").disabled = false;
                        break;

                    case d.value === "Női":
                        gender = d.value;
                        request.post(
                            "/filter-gender",
                            {
                                gender
                            },
                            function (res) {
                                var FILTER = JSON.parse(res);
                                renderServices(FILTER)
                            });
                        $s("#serv-1").disabled = false;
                        $s("#serv-2").disabled = true;
                        $s("#serv-3").disabled = true;
                        break;

                    case d.value === "all":
                        appointments.load();
                        Array.from($sAll(".search-2")).forEach(e => e.checked = false);
                        Array.from($sAll(".search-2")).forEach(e => e.disabled = false);
                        $s("#female").disabled = false;
                        $s("#male").disabled = false;
                        filterHd = [];
                        break;

                    default:
                        break;
                }
            }
        });

        //szolgáltatások szűrése
        $sAll(`input[name="search-2"]`).forEach(d => {
            d.onclick = function () {
                if (d.checked === true) {
                    filterHd.push(d.value);
                    request.post(
                        "/filter-services",
                        {
                            filterHd
                        },
                        function (res) {
                            var FILTER = JSON.parse(res);
                            renderServices(FILTER);
                        });
                    switch (true) {
                        case d.value === "Női hajvágás (rövid)":
                            $s("#female").disabled = false;
                            $s("#serv-2").disabled = true;
                            $s("#serv-3").disabled = true;
                            $s("#male").disabled = true;
                            $s("#female").checked = true;
                            break;

                        case d.value === "Férfi hajvágás" || d.value === "Szakállvágás":
                            $s("#female").disabled = true;
                            $s("#serv-1").disabled = true;
                            $s("#male").disabled = false;
                            $s("#male").checked = true;
                            break;

                        default:
                            break;
                    }
                } else {
                    filterHd.splice(filterHd.indexOf(d.value), 1);
                    if (filterHd.length > 0) {
                        request.post(
                            "/filter-services",
                            {
                                filterHd
                            },
                            function (res) {
                                var FILTER = JSON.parse(res);
                                renderServices(FILTER);
                            });

                    } else {
                        appointments.load();
                        $s("#female").disabled = false;
                        $s("#male").disabled = false;
                        Array.from($sAll(".search-2")).forEach(e => e.disabled = false);
                        $s("#all").checked = true;
                    }
                }
            }
        });

        main.innerHTML = mainString;

        //dátum léptetése előre
        $s(".right-arrow").onclick = function () {
            date.setDate(date.getDate() + 7);
            renderServices(hairdresserList);
        };

        //dátum léptetése vissza
        $s(".left-arrow").onclick = function () {
            if (date.getTime() > new Date().getTime()) {
                date.setDate(date.getDate() - 7);
                renderServices(hairdresserList);
            }
        };

        //"+Több" időpont megjelenítése
        $sAll(".date-time-services-more").forEach(more => {
            more.onclick = function () {
                more.classList.add("d-none");
                let el = more.nextElementSibling;
                while (el) {
                    el.classList.remove("d-none");
                    el = el.nextElementSibling;
                }
            }
        });

        //FOGLALÁS TEMPLATE - booking.js
        $sAll(".date-time-services").forEach(serv => {
            booking.render(serv, ".main-card", hairdresserList);
        });

        //mobil nézet - időpontfoglalás megjelenítése
        $sAll(".mobil-appointments").forEach(d => {
            d.onclick = function () {
                let nextElement = d.nextElementSibling;
                nextElement.style.display = "block";
                nextElement.children[0].children[1].style.display = "block";
                nextElement.children[0].children[1].nextElementSibling.style.display = "block";

                let parent = $s(".date-header-frame");
                let copy = parent.cloneNode(true);
                copy.classList.add("child-date");

                let parentElement = nextElement.children[0];
                let secondChild = parentElement.children[1];
                parentElement.insertBefore(copy, secondChild);
                $s(".child-date .date-header").classList.add("child-date-text");

                let arrows = $sAll(".child-date .arrow");
                for (let i = 0; i < arrows.length; i++) {
                    let arrow = arrows[i];
                    arrow.remove();
                }
            }
        });

        $sAll(".mobil-calendar-close").forEach(c => {
            c.onclick = function () {
                let nextElement = c.nextElementSibling;
                nextElement.style.display = "none";
                nextElement.parentNode.parentNode.style.display = "none";

                let element = c.previousElementSibling;
                let parent = c.parentNode;
                parent.removeChild(element);

            }
        })

    },

    //dátum felosztása YYYY-MM-DD
    formatDate: function formatDate(date) {
        return [
            date.getFullYear(),
            appointments.padTo2Digits(date.getMonth() + 1),
            appointments.padTo2Digits(date.getDate()),
        ].join('.');
    },

    //kétjegyű szám
    padTo2Digits: function padTo2Digits(num) {
        return String(num).padStart(2, '0');
    },

    //oldal betöltése
    load: function loads() {
        request.get("/services", (res) => {
            SERVICES = JSON.parse(res);
            appointments.render(SERVICES);
        });
    }
}

export { appointments };
