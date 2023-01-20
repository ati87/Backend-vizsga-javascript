import { request } from "./js/request.mod.js";
import { appointments } from "./script.js";

const booking = {
    render: function (serv, sel, hairdresserList) {

        const $s = s => document.querySelector(s);
        const $sAll = s => document.querySelectorAll(s);
        var main = $s(sel);
        serv.onclick = function () {
            var mainString = ``;
            mainString += `
         <div class="booking" data-newid="${serv.dataset.id}">
                <fieldset>
                    <legend><h2>Időpont foglalás ${serv.dataset.date + ". " + serv.dataset.time} óra</h2></legend>
                    <div class="booking-form">
                        <div class="booking-form-inner">
                            <label for="name">Név:</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="booking-form-inner">
                            <label for="mail">Email cím:</label>
                            <input type="text" id="mail" name="mail" required>
                        </div>
                        <div class="booking-form-inner">
                            <label for="tel">Telefonszám:</label>
                            <input type="text" id="tel" name="tel" required placeholder="06xxxxxxxxx">
                        </div>
                        <fieldset>
                            <legend>Kérem válasszon a szolgáltatások közül.</legend>
                            <div class="booking-services">
                            `;

            for (const hdItem of hairdresserList) {
                if (hdItem._id == serv.dataset.id) {
                    for (let i = 0; i < hdItem.services.length; i++) {
                        mainString += `
                <div class="booking-services-inner">
                    <input type="checkbox" name="hd-services" data-worktime="${hdItem.services[i].workingMinutes}" value="${hdItem.services[i].service}">
                    <label for="vehicle1"> ${hdItem.services[i].service}</label>
                    <div class="booking-price">Ár: ${hdItem.services[i].price} Ft</div>
                </div>
                `;
                    }
                }
            }
            mainString += `
                        </div>
                    </fieldset>
                </fieldset>
            <button id="booking-button" class="button-3">Lefoglalás</button>
            <button id="booking-button-back" class="button-2">Vissza</button>
        </div>
    `;
            //FOGLALÁS TEMPLATE VÉGE
            main.innerHTML = mainString;

            //IDŐPONT FOGLALÁS ÉS ADATBÁZISBA TÖRTÉNŐ FELTÖLTÉSE
            $s("#booking-button").onclick = function () {
                var booking = [];
                var check = false;
                var checkInp = true;
                var hdId = $s(".booking").dataset.newid;
                var servTime = 0;

                $sAll(`input[name="hd-services"]`).forEach(d => {
                    if (d.checked === true) {
                        booking.push(d.value);
                        check = true;
                        servTime += parseInt(d.dataset.worktime);

                        //ellenőrzés, hogy ha a szolgáltatás belenyúlik a következő foglalásba, akkor figyelmeztessen
                        for (let dressTime of hairdresserList) {
                            if (dressTime._id == hdId) {
                                for (let j = 0; j < dressTime.reservations.length; j++) {
                                    if (formatDate(new Date(dressTime.reservations[j].date)) === serv.dataset.date) {
                                        let newResTime = new Date(serv.dataset.dateTime);
                                        let reservedTime = new Date(dressTime.reservations[j].date)

                                        newResTime.setMinutes(newResTime.getMinutes() + servTime);
                                        if (new Date(serv.dataset.dateTime).getTime() < reservedTime.getTime() && reservedTime.getTime() < newResTime.getTime()) {
                                            check = false;
                                            checkInp = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                //KÉRÉS A SERVER FELÉ - foglalás mentése az adatbázisba
                if (check) {
                    //email,név és telefonszám ellenőrzése
                    if (phonenumber($s(`input[name="tel"]`)) && name($s(`input[name="name"]`).value.trim()) && ValidateEmail($s(`input[name="mail"]`)))
                        if (serv.dataset.closing === serv.dataset.time && servTime > 61) {
                            alert("Sajnáljuk, de utolsó időpontra két szolgáltatásnál többet nem választhat ki.")
                        } else {
                            if (confirm("Lefoglalja az időpontot?"))
                                request.post(
                                    "/newclient",
                                    {
                                        id: hdId,
                                        services: {
                                            name: $s(`input[name="name"]`).value.trim(),
                                            email: $s(`input[name="mail"]`).value.trim(),
                                            date: serv.dataset.dateTime,
                                            dateDay: serv.dataset.date,
                                            dateTime: serv.dataset.time,
                                            tel: $s(`input[name="tel"]`).value.trim(),
                                            serviceTime: servTime,
                                            services: booking
                                        }
                                    },
                                    function (res) {
                                        alert(`Foglalása megtörtént! ${serv.dataset.date + " " + serv.dataset.time + "-kor várjuk Önt."}`);
                                        appointments.load();
                                    }
                                )
                        }
                } else if (!checkInp) {
                    alert("A kért szolgáltatás(ok) ütköznek a következő foglalással. Kérem válasszon kevesebb szolgáltatást vagy másik időpontot.")

                } else {
                    alert("A foglaláshoz kérem, hogy töltse ki az űrlapot.")
                }
            }
            //vissza a főoldalra
            $s("#booking-button-back").onclick = function () {
                appointments.load();
            }
        }

        //név ellenőrzés
        function name(inputtxt) {
            if (inputtxt == null || inputtxt == "") {
                alert("A név nem lehet üres.");
                return false;
            } else {
                return true;
            }
        }
        //telefonszám ellenőrzés
        function phonenumber(inputtxt) {
            var regex = /^\d{11}$/;
            if (inputtxt.value.match(regex)) {
                return true;
            }
            else {
                alert("A telefonszám nem helyes. Kérem próbálja meg újra.");
                return false;
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
        //dátum felosztása YYYY-MM-DD
        function formatDate(date) {
            return [
                date.getFullYear(),
                padTo2Digits(date.getMonth() + 1),
                padTo2Digits(date.getDate()),
            ].join('.');
        }
        //kétjegyű szám
        function padTo2Digits(num) {
            return String(num).padStart(2, '0');
        }
        //oldal betöltése
        function loads() {
            request.get("/services", (res) => {
                SERVICES = JSON.parse(res);
                console.log("fds");
                renderServices(SERVICES);
            });
        }
    }
}

export { booking };