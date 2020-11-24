import React, { useState, useEffect } from 'react';
import { Table, Button, Row } from 'antd';
import AddRentalForm from './AddRentalForm';
import { Modbutton, Modbutton2 } from './Bookings';
const axios = require('axios');

const tempData = [
    {
        key: 1,
        EquipmentType: 'tennis racket',
        rentalRate: 10
    },
    {
        key: 2,
        EquipmentType: 'basketball',
        rentalRate: 5
    }
]

const columnsAgg = [
    {
        title: 'Rental Cost',
        dataIndex: 'rentalRate'
    },
    {
        title: 'Count',
        dataIndex: 'Count'
    }
]

const columns = [
    {
        title: 'Type',
        dataIndex: 'EquipmentType'
    },
    {
        title: 'Rental Cost',
        dataIndex: 'rentalRate'
    }
]

const processResponse  = (res) => {
    return res.map((item, index) => {
        return {...item, key: index};
    });
}


const Rentals = (props) => {
    const [formRental, setFormRental] = useState('');
    const [selected, setSelected] = useState(null);
    const [data, setData] = useState(tempData);
    const [rentalAgg, setRentalAgg] = useState(false);
    const [aggData, setAggData] = useState([]);
    let rental = null;


    useEffect(() => {
        const get = async () => {
            try {
                const rentalData = await axios.get('http://localhost:3005/get/rentals?TripID=' + props.tripID);
                setData(processResponse(rentalData.data));
            } catch (e) {
                console.error(e);
            }
        }

        get();
    }, [setData, props.tripID]);


    const submitHandlerModify = async (res, data, selected, setData) => {
        try{
            const result = await axios.post('http://localhost:3005/update/rentals', 
            {
                ...res,
                RentalID: data[selected].RentalID,
                TripID: props.tripID
            });
            setData(processResponse(result.data));
        } catch (e) {
            console.log(e.stack);
        }
    }

    const submitHandlerAdd = async (res, setData, tripID) => {
        try{
            const result = await axios.post('http://localhost:3005/add/rentals', 
            {
                ...res, 
                TripID: tripID
            });
            setData(processResponse(result.data));
        } catch (e) {
            console.log(e.stack);
        }
    }
    
    
    const deleteRental = async (selected, data, setData) => {
        try {
            const result = await axios.post('http://localhost:3005/delete/rentals', {
                TripID: props.tripID,
                RentalID: data[selected].RentalID
            });
            setData(processResponse(result.data));
        } catch (e) {
            console.log(e.stack);
        }
    }

    const displayRentalHandler = async () => {
        setRentalAgg(false);
        try {
            const rentalData = await axios.get('http://localhost:3005/get/rentals?TripID=' + props.tripID);
            setData(processResponse(rentalData.data));
        } catch (e) {
            console.error(e);
        }
    }

    const displayAggHandler = async () => {
        setRentalAgg(true);
        try {
            const rentalData = await axios.get('http://localhost:3005/get/rentalRateGreater?TripID=' + props.tripID);
            console.log(rentalData);
            setAggData(processResponse(rentalData.data));
        } catch (e) {
            console.error(e);
        }
    }

    if (formRental === 'add') {
        rental = <AddRentalForm data={null} type={formRental} onSubmit={(e)=>{submitHandlerAdd(e, setData, props.tripID)}}/>
    } else if (formRental === 'modify') {
        rental = <AddRentalForm data={data[selected]} type={formRental} onSubmit={(e)=>{submitHandlerModify(e, data, selected, setData)}}/>
    }

    const rentTable = <Table pagination={false} columns = {columns} dataSource={data} rowSelection={
        {
            type: "radio",
            onSelect: (rec) => {
                setSelected(rec.key);
            }
        }
    }/>

    const aggTable = <Table pagination={false} columns={columnsAgg} dataSource={aggData} />

    const modLogic = () => {
        if (selected === null) {
            return true;
        } else {
            return rentalAgg;
        }
    }

    return (
        <div>
            { rentalAgg ? aggTable : rentTable }
            <Row>
                {/* <Button onClick={()=>{setFormRental('add')}}>Add</Button> */}
                <Modbutton disabled={modLogic()} onClick={()=>{setFormRental('modify')}}>Modify</Modbutton>
                <Modbutton disabled={rentalAgg} onClick={()=>{deleteRental(selected, data, setData)}}>Delete</Modbutton>
                <Modbutton2 disabled={rentalAgg} onClick={()=>displayAggHandler()}>Cost Groups</Modbutton2>
                <Modbutton disabled={!rentalAgg} onClick={()=>displayRentalHandler()}>Rentals</Modbutton>
            </Row>
            { rental }
        </div>
    )
}

export default Rentals;