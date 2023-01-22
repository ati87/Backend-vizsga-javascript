const fs = require(`fs`);
const path = require(`path`);
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();

const express = require(`express`);
const app = express();

const mongodb = require(`mongodb`);
const MongoClient = mongodb.MongoClient;

function dbConnect(collectionName, callBack) {

    const uri = process.env.DB_URI;

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    client.connect().then(res => {

        let collection = client.db("Vizsgamunka-backend").collection(collectionName);

        callBack(client, collection);   //colletion az adatbázis
    });
}

app.use(
    express.static(path.join(__dirname, `public`))
);

app.use(express.json());

//IDŐPONTFOGLALÁS kezdete

//termékek megjelenítése
app.get(`/services`, (request, response) => {
    dbConnect("fodraszok", (cli, collectionHD) => {

        collectionHD.find()
            .toArray()
            .then(res => {
                cli.close();
                response.json(res);

            });
    });
});

//Új foglalás hozzáadása az adatbázishoz
app.post(`/newclient`, (req, response) => {

    const newBooking = req.body;

    //email küldés a vengéd számára
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    var serv = "";
    for (let i = 0; i < newBooking.services.services.length; i++) {
        if (newBooking.services.services.length - 1 == i) {
            serv += newBooking.services.services[i]
        } else {
            serv += newBooking.services.services[i] + ", "
        }
    }

    var mailOptions = {
        from: 'developer.ha87@gmail.com',
        to: newBooking.services.email,
        subject: 'JS fodrászszalon időpontfoglalás',
        html: '<h2>Kedves ' + newBooking.services.name + `! </h2> <div>Szeretettel várjuk ` + newBooking.services.dateDay + `-én ` + newBooking.services.dateTime + `-kor szalonunkban az alábbi szolgáltatás(ok)ra: ` + serv + `.</div><br>Üdvözlettel a JS csapata.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email elküldve: ' + info.response);
        }
    });
    //email vége

    dbConnect("fodraszok", (cli, collectionHD) => {

        const newBooking = req.body;

        collectionHD.updateOne({ _id: newBooking.id }, { $push: { "reservations": newBooking.services } }, (err, resp) => {
            response.json({ message: "OK" });
            cli.close();
        });

    });

});

//szűrés (Női vagy Férfi fodrász)
app.post(`/filter-gender`, (req, response) => {

    const filter = req.body;
    dbConnect("fodraszok", (cli, collectionHD) => {

        collectionHD.find({ class: filter.gender })
            .toArray()
            .then(res => {
                cli.close();
                response.json(res);
            });
    });

});

//szűrés (szolgáltatások)
app.post(`/filter-services`, (req, response) => {

    const filter = req.body;

    dbConnect("fodraszok", (cli, collectionHD) => {

         collectionHD.find({services:{$elemMatch:{service: { $in:filter.filterHd}}}})
            .toArray()
            .then(res => {
                cli.close();
                response.json(res);

            });
    });

});
//IDŐPONTFOGLALÁS vége

//ADMIN oldal kezdete
app.get(`/admin`, (req, res) => {
    fs.readFile(path.join(__dirname, `public`, `admin.html`), (err, body) => {
        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/html'
        })
            .end(body);
    });
});

//elemek betöltése az adatbázisból fájlból
app.post(`/login`, (req, response) => {

    const admin = req.body;

    dbConnect("adminUsers", (cli, collectionAdmin) => {

        collectionAdmin.findOne({ $and: [{ email: admin.email }, { password: admin.password }] }, (err, res) => {
            cli.close();
            if (res) {
                dbConnect("fodraszok", (cli, collectionHD) => {

                    collectionHD.find()
                        .toArray()
                        .then(res => {
                            cli.close();
                            response.json(res);
                        });
                });
            } else {
                console.log(err);
            }
        });
    });
});

//foglalás törlése
app.delete(`/delete/:name/time:time/day:day/id:id/email:email`, (req, response) => {

    dbConnect("fodraszok", (cli, collectionHD) => {

        collectionHD.updateOne({ _id: req.params.id }, {
            $pull: { reservations: { name: req.params.name, dateDay: req.params.day, dateTime: req.params.time } }
        },
            (err, resp) => {
                cli.close();

                collectionHD.find()
                    .toArray()
                    .then(res => {
                        cli.close();
                        response.json(res);
                    });



                //email küldés a vengéd számára
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                var mailOptions = {
                    from: 'developer.ha87@gmail.com',
                    to: req.params.email,
                    subject: 'JS fodrászszalon időpontfoglalás törlése',
                    html: '<h2>Kedves ' + req.params.name + `! </h2> <div>Foglalását töröltük (` + req.params.day + `. ` + req.params.time + `).</div><br>Üdvözlettel a JS csapata.`
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email elküldve: ' + info.response);
                    }
                });
                //email vége                 
            });
    });
});

//szűrés (fodrászok)
app.post(`/filter-hairdressers`, (req, response) => {

    const filter = req.body;

    dbConnect("fodraszok", (cli, collectionHD) => {

         collectionHD.find({_id: { $in:filter.filterHd}})
            .toArray()
            .then(res => {
                cli.close();
                response.json(res);
            });
    });

});

app.listen(process.env.PORT);
