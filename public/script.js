import { request } from "./js/request.mod.js";
import { booking } from "./booking.js";

const $s = s => document.querySelector(s);
const $sAll = s => document.querySelectorAll(s);
const $ce = el => document.createElement(el);

var week = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
var months = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
var date = new Date();

window.SERVICES = [];

//Időpontfoglalás lerenderelése
const appointments = {
    render: function renderServices(hairdresserList) {
        $s(".main").style.backgroundImage = "none"
        var main = $s(".main-card");

        $s("#sideband").style.display = "block";

        var date1 = new Date(date);
        var date7 = new Date(date);;
        date7.setDate(date7.getDate() + 6);


        var mainString = "";

        for (const hdItem of hairdresserList) {
            date1 = new Date(date)
            mainString += `
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
            <div class="card-calendarium">
                <div class="date-now">
                        <div class="date-header-frame"> 
                            <div class="date-header">
                                <div class="left-arrow arrow">&#8592;</div>
                                <div class="date-header-week">
                                        ${months[date1.getMonth()] + ". " + (("0" + date1.getDate()).slice(-2)) + ". - " +
                (months[date1.getMonth() + 1] === undefined ? months[date1.getMonth() - 11] : months[date1.getMonth()])
                + ". " + (("0" + date7.getDate()).slice(-2))}    
                                </div>
                                <div class="right-arrow arrow">&#8594;</div> 
                            </div>
                        </div> 
                    <div class="date-week"> 
                    `;
            //napok és foglalási idők megjelenítése
            for (let i = 0; i < 7; i++) {
                mainString += `
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
                                                ${padTo2Digits(resTime.getHours()) + ':' + padTo2Digits(resTime.getMinutes())}</div>
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
                                            if (ifMore > 6) {
                                                if (ifMoreString === 0) {
                                                    serviceString += `
                                                <div class="date-time-services-more">+ Több</div>
                                                `;
                                                    ifMoreString++;
                                                }
                                                serviceString += `
                                            <div class="date-time-services d-none" data-date-time="${openDate}" data-date="${formatDate(openDate)}" data-closing="${e.to}" data-time="${openTime}" data-id="${hdItem._id}">`
                                                    + openTime + `</div>
                                                `;
                                                openDate.setMinutes(openDate.getMinutes() + 30);
                                            } else if (openTime) {
                                                serviceString += `
                                    <div class="date-time-services" data-date-time="${openDate}" data-date="${formatDate(openDate)}" data-closing="${e.to}" data-time="${openTime}" data-id="${hdItem._id}">`
                                                    + openTime + `</div>
                                        `;
                                                openDate.setMinutes(openDate.getMinutes() + 30);
                                                ifMore++;
                                            }
                                        }
                                        openTime = padTo2Digits(openDate.getHours()) + ":" + padTo2Digits(openDate.getMinutes());
                                    }
                                }
                                return serviceString;
                            }
                        }).join("")}
                            </div> 
                        </div> 
               `;
                date1.setDate(date1.getDate() + 1);
            }

            mainString += `   
                        </div>                     
                    </div>
                </div>
            </div>  
        </div>`;
        }

        main.innerHTML = mainString;

        //dátum felosztása YYYY-MM-DD
        function formatDate(date) {
            return [
                date.getFullYear(),
                padTo2Digits(date.getMonth() + 1),
                padTo2Digits(date.getDate()),
            ].join('.');
        }

        //dátum léptetése előre
        $sAll(".right-arrow").forEach(e => {
            e.onclick = function () {
                date.setDate(date.getDate() + 7);
                renderServices(hairdresserList)
            }
        });
        //dátum léptetése vissza
        $sAll(".left-arrow").forEach(e => {
            e.onclick = function () {
                if (date.getDate() != new Date().getDate()) {
                    date.setDate(date.getDate() - 7);
                    renderServices(hairdresserList)
                }
            }
        });
        //"+Több" időpont megjelenítése
        $sAll(".date-time-services-more").forEach(more => {
            more.onclick = function () {
                more.classList.add("d-none")
                let el = more.nextElementSibling;
                while (el) {
                    el.classList.remove("d-none");
                    el = el.nextElementSibling;
                }
            }
        });
        //FOGLALÁS TEMPLATE - booking.js
        $sAll(".date-time-services").forEach(serv => {
            booking.render(serv, ".main-card", hairdresserList)
        });

        //kétjegyű szám
        function padTo2Digits(num) {
            return String(num).padStart(2, '0');
        };

    },

    load: function loads() {
        request.get("/services", (res) => {
            SERVICES = JSON.parse(res);

            appointments.render(SERVICES);
        });
    }
}
//oldal betöltése
appointments.load()

export { appointments };