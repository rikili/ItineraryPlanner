const express = require('express');
const app = express();
const mysql = require('mysql');


//parse the post 
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//using morgan
const morgan = require('morgan');
app.use(morgan('short'))

//connecting to database
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "password",
    database: "itinerary"
})

//delete method
    function deleteMethod(where, idName, id){
        let nameID=idName;
        let response = where;
        const DeleteId = id;
        db.query('DELETE FROM "' + where + " WHERE " + nameID + ' = ?',  DeleteId, (err, res) => {
            if (err) throw err;
            })
        }
        // db.query('DELETE FROM transport_lines WHERE TransportID = ?',DeleteId, (err, res) => {
        // if (err) throw err;
        // })

        // insert method for accomodation_type_cost
        // function insertMethod(where, a, b) {

        //     db.connect(function(err) {
        //         if (err) throw err;
        //         console.log("Connected!");
        //         var sql = "INSERT INTO accommodation_type_cost(type, daily_cost) VALUES (" + type + "," + cost + ")";
        //         db.query(sql, function (err, result) {
        //             if (err) throw err;
        //             console.log("1 record inserted")
        //         })
        //     })
        // }


// var query = db.query('INSERT INTO accommodation_type_cost SET ?', post, function(err, result) {
//     result.end();

// });

// app.get('delete/table/__ID__')

/////////////////////////////////////////////////
///////////////////// GET //////////////////////
///////////////////////////////////////////////


app.get('/get/rentals', (req, res) => {

    // const query = ``` SELECT * 
    //                   FROM rentals r
    //                   INNER JOIN (custom_itinerary_rentals cir)
    //                   ON (cir.RentalID = r.RentalID AND )
    // ```
    db.query(```SELECT *
                FROM rentals
                INNER JOIN custom_itinerary_rentals
                ON rentals.RentalID = custom_itinerary_rentals.RentalID
                WHERE custom_itinerary_rentals.ItineraryID = ``` + req.params.ItineraryID, (err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.get('/get/accommodation', (req, res) => {
    db.query(```SELECT * 
                FROM accommodation_rest 
                INNER JOIN accommodation_type_cost 
                ON accommodation_rest.Type = accommodation_type_cost.Type
                INNER JOIN itinerary_contains_accommodation
                ON accommodation_rest.Address = itinerary_contains_accommodation.Address AND
                   accommodation_rest.RoomNum = itinerary_contains_accommodation.RoomNum
                WHERE itinerary_contains_accommodation.TripID = ``` + req.params.TripID, (err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

// join transit line, bus cost, train cost
app.get('/get/transit', (req, res) => {
    db.query(```SELECT *
                FROM transport_lines tl
                INNER JOIN bus_cost
                ON tl.bus_lines = bus_cost.bus_lines
                INNER JOIN train_cost
                ON tl.train_lines = train_cost.train_lines
                INNER JOIN custom_public_transportation
                ON tl.TransportID = custom_public_transportation.TransportID
                WHERE custom_public_transportation.ItineraryID = ``` + req.params.ItineraryID, (err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.get('/get/itinerary', (req, res) => {
    const tripID = req.params.TripID;
    db.query(```SELECT *
                FROM itinerary_rest ir
                INNER JOIN (itinerary_cost ic, itinerary_contains_accommodation ica, accommodation_rest ar, accommodation_type_cost atc)
                ON (ic.Number_of_People = ir.Number_of_People AND ic.Destination = ir.Destination AND ic.StartDate = ir.StartDate 
                    AND ic.EndDate = ir.EndDate AND ica.TripID = ir.TripID AND ar.RoomNum = ica.RoomNum AND ar.Address AND ica.Address 
                    AND ar.Type = atc.Type AND ir.TripID = ${tripID})
        ```, (err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

// 2009-01-12
// YYYY-MM-DD
app.get('/get/checkUsername', (req, res) => {
    const username = req.params.username;
    const query = ```
    SELECT COUNT(*)
    FROM Account A
    INNER JOIN (itinerary_cost IC, custom_itinerary CustI, custom_itinerary_manages CIM, personal_user PU, user_account UA, itinerary_rest IR)
        ON (IR.Number_of_People = IC.Number_of_People AND IC.Destination = IR.Destination AND IC.StartDate = IR.StartDate AND IC.EndDate = IR.EndDate
            AND IR.TripID = CustI.ParentID 
            AND CustI.ItineraryID = CIM.ItineraryID 
            AND CIM.UserID = UA.UserID
            AND UA.Username = A.Username
            AND A.Username = ${username})
    ```
    db.query(query, (err, result) => {
        if (err) throw err;
        let ret = (result.length !== 0);
        res.send({result: ret});
    })
})



//get method
// function getMethod(where) {
//     let temp = 'SELECT * FROM ';
//     let response = where;
    // app.get('/get/' + where, (req, res) => {
    //     db.query(temp + response, (err, result) => {
    //         if (err) throw err;
    //         res.send(result);
    //     })
    // })
// }

/////////////////////////////////////////////////
////////////////////////////////////////////////
///////////////////////////////////////////////


// insert to tour itinerary
app.post('/tour_itinerary', (req, res) => {
        var cn = req.body.company_name;
        var pn = req.body.phone_number;
        var pid = req.body.parentid;
        var mid = req.body.managerid;
        var sql = "INSERT INTO tour_itinerary(company_name, phone_number, parentid, managerid) VALUES (" + cn + "," + pn + "," + pid + "," + mid + ")";
        db.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted")
        })
        res.end();
    }) 



// localhost.../getGeneral/cmd/{command: ADD/DELETE/UPDATE type: Car, number: 214}

// JSON.parse({type: Car, number: 214});





// let temp = 'SELECT * FROM ';
// let response = 'transport_lines';
// app.get('/getGeneral/' + response, (req, res) => {
//     //const id = req.params.id;
//     db.query(temp + response, (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     })
// })





// db.query('SELECT * FROM accommodation_type_cost', (err, rows) => {
//     if (err) throw err;
//     console.log("received data");
//     console.log(rows);

// })

// insert accomodation type cost



// STATIC INSERT
// const author = { Type: 1 , CheckIn_Time: '2000-01-24 12:02:12', CheckOut_Time: '2002-01-24 12:02:12', RoomNum: 12, Address: 'cool St.'};
// db.query('INSERT INTO accommodation_rest SET ?', author, (err, res) => {
//   if (err) throw err;

//   console.log('Last Type #:', res.id);
// });







//getting the route
app.get("/", (req, res) => {
    console.log("responding to root route");
    res.send("hello from route");
})

app.listen(3005, () => {
    console.log("server up listening on 3005");
});