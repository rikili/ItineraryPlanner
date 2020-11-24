const express = require('express');
const app = express();
const mysql = require('mysql');
const util = require('util');


//parse the post 
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//using morgan
const morgan = require('morgan');
const {
    json
} = require('express');
app.use(morgan('short'))

const cors = require('cors');
app.use(cors());

//connecting to database
const db = mysql.createPool({
    host: "192.168.1.87",
    user: "root",
    password: "password",
    database: "test2",
    port: 3306
});

const formatRes = (resArr) => {
    return resArr.map((res) => {
        res.StartDate = res.StartDate.toISOString().match(/.*(?=T)/g)[0];
        res.EndDate = res.EndDate.toISOString().match(/.*(?=T)/g)[0];
        return {...res};
    });
}

const getItineraryFromUser = (res, Username) => {
    const query = `SELECT ir.Destination, ir.Number_of_People, ir.StartDate, ir.EndDate, ir.TripID, ic.Estimated_Cost
                   FROM  Account a
                   INNER JOIN (personal_user pu, user_account ua,custom_itinerary_manages cim, custom_itinerary ci, itinerary_rest ir, itinerary_cost ic)
                   ON (a.Username = '${Username}' AND a.Username = ua.Username AND pu.UserID=ua.UserID AND pu.UserID = cim.UserID 
                   AND cim.ItineraryID = ci.ItineraryID AND ci.ParentID = ir.TripID AND ir.Number_of_People = ic.Number_of_People AND ir.Destination = ic.Destination
                   AND ir.StartDate = ic.StartDate AND ir.EndDate = ic.EndDate)`
    db.query(query,(err,result)=>{
        if (err) res.send(400, err);
        console.log(result);
        res.send(formatRes(result));
    })
}

/////////////////////////////////////////////////
///////////////////// GET //////////////////////
///////////////////////////////////////////////

app.get('/get/rentals', (req, res) => {
    const query = `SELECT r.RentalID , r.rentalRate , r.EquipmentType
                  FROM custom_itinerary ci
                  INNER JOIN (custom_itinerary_rentals cir,rentals r)
                  ON (ci.ItineraryID = cir.ItineraryID AND r.RentalID = cir.RentalID)
                  WHERE ci.ParentID = '${req.query.TripID}'`
    db.query(query, (err, result) => {
        if (err) res.send(400, err);
        res.send(result);
    })
})

const getAccommodation = (res, TripID) => {
    const query = `SELECT ar.Type, ar.CheckIn_Time, ar.CheckOut_Time, ica.RoomNum, ica.Address, atc.Daily_Cost
                  FROM itinerary_contains_accommodation ica
                  INNER JOIN (accommodation_rest ar, accommodation_type_cost atc)
                  ON (ar.Type = atc.Type AND ar.RoomNum = ica.RoomNum AND ar.Address = ica.Address)
                  WHERE ica.TripID = '${TripID}'`
    db.query(query, (err, result) => {
        if (err) res.send(400, err);
        res.send(result);
    })
}

app.get('/get/accommodation', (req, res) => {
    getAccommodation(res, req.query.TripID);
})

const getAttractions = (res, TripID) => {
    const query = `SELECT iatb.Name, a.Location
                  FROM itinerary_available_to_attractions iatb
                  INNER JOIN (attractions a)
                  ON (a.Name = iatb.Name)
                  WHERE iatb.TripID = '${TripID}'`
    db.query(query, (err, result) => {
        if (err) res.send(400, err);
        res.send(result);
    })
}

app.get('/get/attractions', (req, res) => {
    getAttractions(res, req.query.TripID);
})

// join transit line, bus cost, train cost
app.get('/get/transit', (req, res) => {
    let getBusOnly = `SELECT bc.Ticket_Cost, tl.Bus_Lines, cpt.TransportID
                        FROM custom_itinerary ci
                        INNER JOIN (custom_public_transportation cpt, transport_lines tl, bus_cost bc)
                        ON tl.TransportID = cpt.TransportID AND cpt.ItineraryID = ci.ItineraryID  AND bc.Bus_Lines = tl.Bus_Lines
                        WHERE ci.ParentID = '${req.query.TripID}' AND tl.Train_Lines is NULL`;

    let getTrainOnly = `SELECT DISTINCT tc.Ticket_Cost, tl.Train_Lines, cpt.TransportID
                        FROM custom_itinerary ci
                        INNER JOIN (custom_public_transportation cpt, transport_lines tl, train_cost tc)
                        ON tl.TransportID = cpt.TransportID AND cpt.ItineraryID = ci.ItineraryID AND tc.Train_lines = tl.Train_lines
                        WHERE ci.ParentID = '${req.query.TripID}' AND tl.Bus_Lines is NULL`;

    db.query(getBusOnly, (err, resultBus) => {
        if (err) res.send(400, err);
        db.query(getTrainOnly, (err, resultTrain) => {
            if (err) res.send(400, err);
            res.send({
                bus: resultBus,
                train: resultTrain
            });
        })
    }
    )
})

app.get('/get/UserItinerary', (req,res)=>{
    getItineraryFromUser(res, req.query.Username);
})



app.get('/get/checkUsername', (req, res) => {
    const username = req.query.Username;
    console.log(username);

    const query = `SELECT COUNT(*) as counted
                   FROM Account a
                   INNER JOIN (personal_user pu, user_account ua)
                   ON (a.Username = '${req.query.Username}' AND a.Username = ua.Username AND pu.UserID=ua.UserID)`

    db.query(query, (err, result) => {
        if (err) res.send(400, err);
        //let ret = (result.length !== 0);
        let ret = (result[0].counted !== 0);
        console.log(result[0].counted);
        res.send({
            result: ret
        });
    })
})

/////////////////////////////////////////////////
//////////////// Aggregates ////////////////////
///////////////////////////////////////////////


app.get('/get/locationCount', (req, res) => {
    const query = `SELECT a.Location, COUNT(a.Location) AS Count
                    FROM itinerary_available_to_attractions iatb
                    INNER JOIN (attractions a)
                    ON (a.Name = iatb.Name)
                    WHERE iatb.TripID = '${req.query.TripID}'
                    GROUP BY a.Location`
    db.query(query, (err, result) => {
        if (err) res.send(400, err);
        res.send(result)
    })
})

//aggregation with HAVING CLAUSE: gives the rental rate for where the rental rate has more than one item
app.get('/get/rentalRateGreater', (req, res) => {
    const query = `SELECT r.rentalRate, COUNT(*) AS Count
                    FROM custom_itinerary ci
                    INNER JOIN (custom_itinerary_rentals cir,rentals r)
                    ON (ci.ItineraryID = cir.ItineraryID AND r.RentalID = cir.RentalID)
                    WHERE ci.ParentID = '${req.query.TripID}'
                    GROUP BY r.rentalRate
                    HAVING COUNT(*)>1
                    `
    db.query(query, (err, result) => {
        if (err) res.send(400, err);
        res.send(result)
    })
})

// NESTED AGGREGATION WITH GROUP BY:
// User gives an attraction and it finds for each destination, the average number of people who 
// did not go on a trip to see the attraction.
app.get('/get/averagePeople', (req, res) => {
    let place = req.query.Name;
    const query = `SELECT itinerary_rest.Destination, AVG(Number_of_People) AS Average
                    FROM itinerary_rest
                    WHERE itinerary_rest.TripID NOT IN (SELECT itinerary_available_to_attractions.TripID
                                                    FROM itinerary_available_to_attractions
                                                    WHERE itinerary_available_to_attractions.Name = '${place}')
                    GROUP BY Destination`
    db.query(query, (err, result) => {
        if (err) res.send(400, err);
        res.send(result)
    })
})

// DIVISION: shows how many groups that every destination in the itinerary
app.get('/get/allAttractions', (req,res)=>{
    const viewSet = `CREATE OR REPLACE VIEW wrongtrips AS SELECT ir1.TripID, ir2.Name
                    FROM itinerary_available_to_attractions ir1, itinerary_available_to_attractions ir2
                    WHERE NOT EXISTS (SELECT * 
                                    FROM itinerary_available_to_attractions ir3
                                    WHERE ir1.TripID = ir3.TripID AND ir2.Name = ir3.Name)`;
    const query2 = `SELECT COUNT(DISTINCT TripID) AS Count
                    FROM itinerary_available_to_attractions ir
                    WHERE ir.TripID NOT IN (SELECT TripID 
                                            FROM wrongtrips)`;  
    db.query(viewSet, (err) => {
        if (err) res.send(400, err);
        db.query(query2,(err,result)=>{
            if (err) res.send(400, err);
                res.send(result);
        });
    });
})


/////////////////////////////////////////////////
/////////////////// Insert /////////////////////
///////////////////////////////////////////////


// Itinerary Add
app.post('/add/itinerary', (req, res) => {
    let post;
    let count;
    let userid = null;
    let tripid = null;
    let iid = null;
    const fetchedUserN = req.body.Username;
    const numPeople = req.body.Number_of_People;
    const dest = req.body.Destination;
    const startdate = req.body.StartDate;
    const enddate = req.body.EndDate;
    const estimatedCost = req.body.Estimated_Cost;
    const sqlItRest = "SELECT COUNT(*) AS itinerary_count FROM itinerary_rest"
    const sqlCustI = "SELECT COUNT(*) AS itinerary_count_iid FROM custom_itinerary";
    db.query(`SELECT user_account.UserID FROM user_account WHERE '${fetchedUserN}' = user_account.Username`, function (err, result1) {
        if (err) res.send(400, err);
        let row = result1[0];
        userid = row.UserID;
        // Insert into itinerary_rest for foreign key first
        db.query(sqlItRest, function (err, rows) {
            if (err) res.send(400, err);
            count = rows[0].itinerary_count;
            tripid = count + 1;
            post = 
            { 
                Number_of_People: numPeople, 
                Destination: dest, TripID: tripid, 
                StartDate: startdate, 
                EndDate: enddate 
            };
            db.query('INSERT INTO itinerary_rest SET ?', post, (err) => {if(err) res.send(400, err)});

            // Generate new iid and insert into custom itinerary
            db.query(sqlCustI, function (err, rows) {
                if (err) res.send(400, err);
                count = rows[0].itinerary_count_iid;
                iid = (count + 1);
                post = { ItineraryID: iid, ParentID: tripid };
                db.query('INSERT INTO custom_itinerary SET ?', post, (err) => {if(err) res.send(400, err)});

                // insert estimated_cost into itinerary_cost
                post = 
                { 
                    Number_of_People: numPeople, 
                    Destination: dest, StartDate: startdate, 
                    EndDate: enddate, 
                    Estimated_Cost: estimatedCost 
                };
                db.query('INSERT INTO itinerary_cost SET ?', post, (err) => {if(err) res.send(400, err)});

                // insert into custom_itinerary_manages
                post = { ItineraryID: iid, UserID: userid };
                db.query('INSERT INTO custom_itinerary_manages SET ?', post, function (err, result) {
                    if(err) res.send(400, err);
                    getItineraryFromUser(res, fetchedUserN); // sends user itineraries back to user
                })
            })
        })
    })
})


// ADD ACCOMMODATION
app.post('/add/accommodations', (req, res) => {

    const query = `SELECT ar.Type, ar.CheckIn_Time, ar.CheckOut_Time, ica.RoomNum, ica.Address, atc.Daily_Cost 
                  FROM itinerary_contains_accommodation ica
                  INNER JOIN (accommodation_rest ar, accommodation_type_cost atc)
                  ON (ar.Type = atc.Type AND ar.RoomNum = ica.RoomNum AND ar.Address = ica.Address)
                  WHERE ica.TripID = '${req.body.TripID}'`

    // Insert accommodation_rest
    var t = req.body.Type;
    var cit = req.body.CheckIn_Time;
    var cot = req.body.CheckOut_Time;
    var rn = req.body.RoomNum;
    var a = req.body.Address;
    var post = { Type: t, CheckIn_Time: cit, CheckOut_Time: cot, RoomNum: rn, Address: a };
    db.query('INSERT INTO accommodation_rest SET ?', post, (err) => {if (err) res.send(400, err)});

    // Insert accommodation_type
    var dc = req.body.Daily_Cost;
    var post = { Type: t, Daily_Cost: dc };
    db.query('INSERT INTO accommodation_type_cost SET ?', post, (err) => {if (err) res.send(400, err)});

    // Insert itinerary_contains_accommodation
    var tid = req.body.TripID;
    var post = { RoomNum: rn, Address: a, TripID: tid };
    db.query('INSERT INTO itinerary_contains_accommodation SET ?', post, (err) => {if (err) res.send(400, err)});

    db.query(query, (err) => {
        if (err) res.send(400, err);
        try {
            getAccommodation(res, tid);
        } catch (err) {
            res.json({ message: err })
        }
    })
})


// ADD ATTRACTION
app.post('/add/attractions', (req, res) => {
    var l = req.body.Location;
    var n = req.body.Name;
    var post = { Location: l, Name: n }
    db.query('INSERT INTO attractions SET ?', post, (err) => {if (err) res.send(400, err)})

    var tid = req.body.TripID;
    var post = { TripID: tid, Name: n }
    db.query('INSERT INTO itinerary_available_to_attractions SET ?', post, (err) => {
        if (err) res.send(400, err);
        getAttractions(res, tid);
    })
})



// ADD RENTAL
app.post('/add/rentals', (req, res) => {
    // INSERT INTO RENTAL
    var rr = req.body.rentalRate;
    var et = req.body.EquipmentType;
    var rid = null;
    var sql = "SELECT COUNT(*) AS rental_id FROM rentals";
    db.query(sql, async function (err, rows, fields) {
        try {
            var count = rows[0].rental_id;
            rid = await (count + 1);
            var post = { RentalID: rid, rentalRate: rr, EquipmentType: et };
            db.query('INSERT INTO rentals SET ?', post, function (err, result) {
            })
        }
        catch (err) {
            res.send(400, err)
        }
    })

    // INSERT INTO CUSTOM_ITINERARY_RENTALS
    var tid = req.body.TripID;
    var iid = null;

    db.query(`SELECT custom_itinerary.ItineraryID FROM custom_itinerary WHERE '${tid}' = custom_itinerary.ParentID`, function (err, result1, fields) {
        var row = result1[0];
        iid = row.ItineraryID;
        var post = { ItineraryID: iid, RentalID: rid };
        db.query('INSERT INTO custom_itinerary_rentals SET ?', post, function (err, result) {
        })
    })
    res.end();
})


// ADD TRANSPORT tripID, transitline, ticketCost
app.post('/add/transit', async (req, res) => {
    
    var t = req.body.Type;
    var tl = req.body.TransitLine;
    var tripid = req.body.TripID;

    // type is bus case:
    if (t == "bus") {

        var iid = null;

        // insert into transport_lines
        var transid = null;
        var sql = "SELECT COUNT(*) AS transport_id FROM transport_lines";
        db.query(sql, function(err, rows, fields) {
            var count = rows[0].transport_id;
            transid = (count + 1);
            var post = {TransportID:transid, Bus_Lines:tl};
            db.query('INSERT INTO transport_lines SET ?', post, function(err, result) {
            })
        })

        // get itinerary_id from custom_itinerary
        db.query(`SELECT custom_itinerary.ItineraryID FROM custom_itinerary WHERE '${tripid}' = custom_itinerary.ParentID`,function (err,result1,fields) {
            var row = result1[0];
            iid = row.ItineraryID;
            var post = {TransportID:transid, ItineraryID:iid};
            db.query("INSERT INTO custom_public_transportation SET ?", post, function(err, result) {
            })
        })

        // Insert bus cost
        var tc = req.body.Ticket_Cost;
        var tl = req.body.TransitLine;
        var post = {Bus_lines:tl, Ticket_Cost:tc};
        console.log(tl);
        console.log(tc);
        db.query('INSERT INTO bus_cost SET ?', post, function(err, result) {

        })

    }

    else if (t == "train") {

        var iid = null;

        // insert into transport_lines
        var transid = null;
        var sql = "SELECT COUNT(*) AS transport_id FROM transport_lines";
        db.query(sql, function(err, rows, fields) {
            var count = rows[0].transport_id;
            transid = (count + 1);
            var post = {TransportID:transid, Train_Lines:tl};
            db.query('INSERT INTO transport_lines SET ?', post, function(err, result) {
            })
        })

        // get itinerary_id from custom_itinerary
        db.query(`SELECT custom_itinerary.ItineraryID FROM custom_itinerary WHERE '${tripid}' = custom_itinerary.ParentID`,function (err,result1,fields) {
            var row = result1[0];
            iid = row.ItineraryID;
            var post = {TransportID:transid, ItineraryID:iid};
            db.query("INSERT INTO custom_public_transportation SET ?", post, function(err, result) {
            })
        })

        // Insert train cost
        var tc = req.body.Ticket_Cost;
        var tl = req.body.TransitLine;
        var post = {Train_lines:tl, Ticket_Cost:tc};
        console.log(tl);
        console.log(tc);
        db.query('INSERT INTO train_cost SET ?', post, function(err, result) {

        })

    }

    res.end();
})


/////////////////////////////////////////////////
///////////////////// Delete ///////////////////
///////////////////////////////////////////////


app.post('/delete/itinerary', (req, res) => {
    let parsed = req.body;
    let queryDelete = `DELETE FROM itinerary_rest WHERE itinerary_rest.TripID = '${parsed.TripID}'`
    let username = parsed.Username;
    const queryReturn = `SELECT ir.Destination, ir.Number_of_People, ir.StartDate, ir.EndDate, ir.TripID, ic.Estimated_Cost
                    FROM  Account a
                    INNER JOIN (personal_user pu, user_account ua,custom_itinerary_manages cim, custom_itinerary ci, itinerary_rest ir, itinerary_cost ic)
                    ON (a.Username = '${username}' AND a.Username = ua.Username AND pu.UserID=ua.UserID AND pu.UserID = cim.UserID 
                    AND cim.ItineraryID = ci.ItineraryID AND ci.ParentID = ir.TripID AND ir.Number_of_People = ic.Number_of_People AND ir.Destination = ic.Destination
                    AND ir.StartDate = ic.StartDate AND ir.EndDate = ic.EndDate)`
    db.query(queryDelete, (err, result1) => {
        if (err) res.send(400, err);
        db.query(queryReturn, (err, result2) => {
            if (err) res.send(400, err);
            res.send(result2);
        })
    })
})

app.post('/delete/accommodation', (req, res) => {
    let parsed = req.body;
    let tripID = parsed.TripID;
    let room = parsed.RoomNum;
    let address = parsed.Address;
    let queryDelete = `DELETE ica, accommodation_rest, accommodation_type_cost 
                       FROM itinerary_contains_accommodation ica
                       INNER JOIN (accommodation_rest, accommodation_type_cost)
                       ON (ica.Address = accommodation_rest.Address AND accommodation_rest.RoomNum = ica.RoomNum
                       AND accommodation_rest.Type = accommodation_type_cost.Type)
                       WHERE ica.RoomNum = '${room}' AND ica.Address= '${address}'`;
    let queryReturn = `SELECT ar.Type, ar.CheckIn_Time, ar.CheckOut_Time, ica.RoomNum, ica.Address, atc.Daily_Cost
                        FROM itinerary_contains_accommodation ica
                        INNER JOIN (accommodation_rest ar, accommodation_type_cost atc)
                        ON (ar.Type = atc.Type AND ar.RoomNum = ica.RoomNum AND ar.Address = ica.Address)
                        WHERE ica.TripID = '${tripID}'`
    db.query(queryDelete, (err, result1) => {
        if (err) res.send(400, err);
        db.query(queryReturn, (err, result2) => {
            if (err) res.send(400, err);
            res.send(result2)
        })
    })
})


app.post('/delete/transit', (req, res) => {
    let parsed = req.body;
    let parentID = parsed.TripID;
    let transportID = parsed.TransportID;
    let type = parsed.Type;

    if (type == "bus") {
        let busLine = parsed.Bus_Lines;
        let queryDeleteBus = `DELETE bus_cost,tl
                        FROM transport_lines tl
                        INNER JOIN bus_cost 
                        ON tl.Bus_Lines = bus_cost.Bus_Lines 
                        WHERE tl.Bus_Lines = '${busLine}' AND tl.TransportID = '${transportID}'`;
        db.query(queryDeleteBus, (err, result1) => {
            if (err) res.send(400, err);
            console.log('deleted bus');
            retTransit(parentID, res);
        })
    } else if (type == "train") {
        let trainLine = parsed.Train_Lines;
        let queryDeleteTrain = `DELETE train_cost,tl 
                        FROM transport_lines tl
                        INNER JOIN train_cost 
                        ON tl.Train_Lines = train_cost.Train_Lines
                        WHERE tl.Train_Lines = '${trainLine}' AND tl.TransportID = '${transportID}'`;
        db.query(queryDeleteTrain, (err) => {
            if (err) res.send(400, err);
            retTransit(parentID, res);
        })
    }
})

const retTransit = (TripID, res) => {
    let getBusOnly = `SELECT bc.Ticket_Cost, tl.Bus_Lines, cpt.TransportID
        FROM custom_itinerary ci
        INNER JOIN (custom_public_transportation cpt, transport_lines tl, bus_cost bc)
        ON tl.TransportID = cpt.TransportID AND cpt.ItineraryID = ci.ItineraryID  AND bc.Bus_Lines = tl.Bus_Lines
            WHERE ci.ParentID = '${TripID}' AND tl.Train_Lines is NULL`;

    let getTrainOnly = `SELECT DISTINCT tc.Ticket_Cost, tl.Train_Lines, cpt.TransportID 
        FROM custom_itinerary ci
        INNER JOIN (custom_public_transportation cpt, transport_lines tl, train_cost tc)
        ON tl.TransportID = cpt.TransportID AND cpt.ItineraryID = ci.ItineraryID AND tc.Train_lines = tl.Train_lines
        WHERE ci.ParentID = '${TripID}' AND tl.Bus_Lines is NULL`;


    db.query(getBusOnly, (err, resultBus) => {
        if (err) res.send(400, err);
        db.query(getTrainOnly, (err, resultTrain) => {
            if (err) res.send(400, err);
            res.send({
                bus: resultBus,
                train: resultTrain
            });
        })
    })
}

app.post('/delete/rentals', (req, res) => {
    let parsed = req.body;
    let parentID = parsed.TripID;
    let rentalID = parsed.RentalID;
    let queryDelete = `DELETE cir, rentals
                       FROM custom_itinerary_rentals cir
                       INNER JOIN rentals
                       ON (rentals.RentalID='${rentalID}' AND rentals.RentalID=cir.RentalID)`;
    let queryReturn = `SELECT r.RentalID , r.rentalRate , r.EquipmentType
                        FROM custom_itinerary ci
                        INNER JOIN (custom_itinerary_rentals cir,rentals r)
                        ON (ci.ItineraryID = cir.ItineraryID AND r.RentalID=cir.RentalID)
                        WHERE ci.ParentID = '${parentID}'`

    db.query(queryDelete, (err) => {
        if (err) res.send(400, err);
        db.query(queryReturn, (err, result2) => {
            if (err) res.send(400, err);
            res.send(result2);
        })
    })
})


app.post('/delete/attractions', (req, res) => {
    let parsed = req.body;
    let tripID = parsed.TripID;
    let name = parsed.Name;

    let queryDelete = `DELETE iata, attractions
                       FROM itinerary_available_to_attractions iata
                       INNER JOIN (attractions)
                       ON (iata.Name = attractions.Name)
                       WHERE iata.Name = '${name}'`;

    let queryReturn = `SELECT iatb.Name, a.Location
                        FROM itinerary_available_to_attractions iatb
                        INNER JOIN (attractions a)
                        ON (a.Name = iatb.Name)
                        WHERE iatb.TripID = '${tripID}'`

    db.query(queryDelete, (err) => {
        if (err) res.send(400, err);
        db.query(queryReturn, (err, result2) => {
            if (err) res.send(400, err);
            res.send(result2);
        })
    })

})


/////////////////////////////////////////////////
////////////////////////////////////////////////
///////////////////////////////////////////////



/////////////////////////////////////////////////
///////////////////// Update ///////////////////
///////////////////////////////////////////////
app.post('/update/itinerary', (req, res) => {
    let parsed = req.body;
    let np = parsed.Number_of_People;
    let d = parsed.Destination;
    let tid = parsed.TripID;
    let sd = parsed.StartDate;
    let ed = parsed.EndDate;
    let userName = parsed.Username;
    let estimatedCost = parsed.Estimated_Cost
    let queryUpdate = `UPDATE itinerary_rest ,itinerary_cost
                       SET itinerary_rest.Number_of_People = '${np}',itinerary_rest.Destination='${d}',
                            itinerary_rest.StartDate='${sd}',itinerary_rest.EndDate='${ed}',
                            itinerary_cost.Estimated_Cost='${estimatedCost}',itinerary_cost.Number_of_People = '${np}',
                            itinerary_cost.Destination='${d}',itinerary_cost.StartDate='${sd}',
                            itinerary_cost.EndDate='${ed}'
                        WHERE itinerary_rest.TripID = '${tid}' AND itinerary_rest.Number_of_People = itinerary_cost.Number_of_People 
                        AND itinerary_rest.Destination = itinerary_cost.Destination AND itinerary_rest.StartDate = itinerary_cost.StartDate 
                        AND itinerary_rest.EndDate = itinerary_cost.EndDate`

    const queryReturn = `SELECT ir.Destination, ir.Number_of_People, ir.StartDate, ir.EndDate, ir.TripID, ic.Estimated_Cost
                        FROM  Account a
                        INNER JOIN (personal_user pu, user_account ua,custom_itinerary_manages cim, custom_itinerary ci, itinerary_rest ir, itinerary_cost ic)
                        ON (a.Username = '${userName}' AND a.Username = ua.Username AND pu.UserID=ua.UserID AND pu.UserID = cim.UserID 
                        AND cim.ItineraryID = ci.ItineraryID AND ci.ParentID = ir.TripID AND ir.Number_of_People = ic.Number_of_People AND ir.Destination = ic.Destination
                        AND ir.StartDate = ic.StartDate AND ir.EndDate = ic.EndDate)`

    db.query(queryUpdate, (err) => {
        if (err) res.send(400, err);
        db.query(queryReturn, (err, result2) => {
            if (err) res.send(400, err);
            res.send(result2);
        })
    });
})



app.post('/update/accommodation', (req, res) => {
    let parsed = req.body;
    let type = parsed.Type;
    let checkIn = parsed.CheckIn_Time;
    let checkOut = parsed.CheckOut_Time;
    let roomNum = parsed.RoomNum;
    let address = parsed.Address;
    let dailyCost = parsed.Daily_Cost;
    let tripID = parsed.TripID;
    let queryUpdate = `UPDATE accommodation_rest ,accommodation_type_cost
                      SET accommodation_type_cost.Daily_Cost = '${dailyCost}', accommodation_rest.CheckIn_Time = '${checkIn}', 
                          accommodation_rest.CheckOut_Time = '${checkOut}'
                      WHERE accommodation_rest.Address = '${address}' AND accommodation_rest.RoomNum = '${roomNum}' AND accommodation_rest.Type = '${type}'
                            AND accommodation_rest.Type = accommodation_type_cost.Type`;

    const queryReturn = `SELECT ar.Type, ar.CheckIn_Time, ar.CheckOut_Time, ica.RoomNum, ica.Address, atc.Daily_Cost  
                        FROM itinerary_contains_accommodation ica
                        INNER JOIN (accommodation_rest ar, accommodation_type_cost atc)
                        ON (ar.Type = atc.Type AND ar.RoomNum = ica.RoomNum AND ar.Address = ica.Address)
                        WHERE ica.TripID = '${tripID}'`

    db.query(queryUpdate, (err) => {
        if (err) res.send(400, err);
        db.query(queryReturn, (err, result2) => {
            if (err) res.send(400, err);
            res.send(result2)
        })
    })
})

//************give the type you are updating (bus or train)******************//

app.post('/update/transit', (req, res) => {
    let parsed = req.body;
    let transportId = parsed.TransportId;
    let type = parsed.type;  // this is for either bus or train
    let cost = parsed.Ticket_Cost;
    let tripID = parsed.TripID;

    if (type == "bus") {
        let queryUpdateBus = `UPDATE transport_lines , bus_cost 
                                SET bus_cost.Ticket_Cost = '${cost}'
                                WHERE transport_lines.TransportID = '${transportId}' AND bus_cost.Bus_lines = transport_lines.Bus_lines`

        db.query(queryUpdateBus, (err) => {
            if (err) res.send(400, err);
            retTransit(tripID, res)

        })
    }


    if (type == "train") {
        let queryUpdateTrain = `UPDATE transport_lines , train_cost 
                                SET train_cost.Ticket_Cost = '${cost}'
                                WHERE transport_lines.TransportID = '${transportId}' AND train_cost.Train_lines = transport_lines.Train_lines`
        db.query(queryUpdateTrain, (err) => {
            if (err) res.send(400, err);
            retTransit(tripID, res)
        })
    }
})



app.post('/update/rentals', (req, res) => {
    let parsed = req.body;
    let equipmentType = parsed.EquipmentType;
    let rentalRate = parsed.rentalRate;
    let parentID = parsed.TripID;
    let rentalID = parsed.RentalID;

    let queryUpdateRentals = `UPDATE rentals
                                SET rentals.rentalRate = '${rentalRate}', rentals.EquipmentType = '${equipmentType}'
                                WHERE rentals.RentalID = '${rentalID}'`;
    let queryReturnRentals = `SELECT r.RentalID , r.rentalRate , r.EquipmentType
                                FROM custom_itinerary ci
                                INNER JOIN (custom_itinerary_rentals cir,rentals r)
                                ON (ci.ItineraryID = cir.ItineraryID AND r.RentalID = cir.RentalID)
                                WHERE ci.ParentID = '${parentID}'`

    db.query(queryUpdateRentals, (err) => {
        if (err) res.send(400, err);
        db.query(queryReturnRentals, (err, result) => {
            if (err) res.send(400, err);
            res.send(result)
        })
    })
})


app.post('/update/attractions', (req, res) => {
    let parsed = req.body;
    let name = parsed.Name;
    let location = parsed.Location;
    let tripID = parsed.TripID;

    let queryUpdateAttraction = `UPDATE attractions, itinerary_available_to_attractions
                                 SET attractions.Location = '${location}'
                                 WHERE itinerary_available_to_attractions.Name = '${name}' AND itinerary_available_to_attractions.Name = attractions.Name`;

    let queryReturn = `SELECT iatb.Name, a.Location 
                        FROM itinerary_available_to_attractions iatb
                        INNER JOIN (attractions a)
                        ON (a.Name = iatb.Name)
                        WHERE iatb.TripID = '${tripID}'`;

    db.query(queryUpdateAttraction, (err) => {
        if (err) res.send(400, err);
        db.query(queryReturn, (err, result) => {
            if (err) res.send(400, err);
            res.send(result)
        })
    })

})






/////////////////////////////////////////////////
////////////////////////////////////////////////
///////////////////////////////////////////////


//getting the route

app.listen(3005, () => {
    console.log("server up listening on 3005");
});