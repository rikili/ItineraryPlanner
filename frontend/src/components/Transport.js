import React, { useState, useEffect } from 'react';
import { Table, Button, Row } from 'antd';
import AddTransitForm from './AddTransitForm'
import { Modbutton } from './Bookings';
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

const columns = [
    {
        title: 'Type',
        dataIndex: 'Type'
    },
    {
        title: 'Line',
        dataIndex: 'Lines'
    },
    {
        title: 'Ticket Cost',
        dataIndex: 'Ticket_Cost'
    }
]

const processResponse  = (res) => {
    const bus = res.bus.map((item) => {
        return {Ticket_Cost: item.Ticket_Cost, Lines: item.Bus_Lines, Type: "bus", TransportID: item.TransportID};
    })
    const train = res.train.map((item) => {
        return {Ticket_Cost: item.Ticket_Cost, Lines: item.Train_Lines, Type: "train", TransportID: item.TransportID};
    })
    const combine = bus.concat(train);
    return combine.map((item, index) => {
        return {...item, key: index};
    })
}


const Transport = (props) => {
    const [formTransit, setFormTransit] = useState('');
    const [selected, setSelected] = useState(NaN);
    const [data, setData] = useState(tempData);
    let transit = null;


    useEffect(() => {
        const get = async () => {
            try {
                const transitData = await axios.get('http://localhost:3005/get/transit?TripID=' + props.tripID);
                setData(processResponse(transitData.data));
            } catch (e) {
                console.error(e);
            }
        }

        get();
    }, [setData, props]);

    const submitHandlerAdd = async (res, setData) => {
        // try{
        //     const result = await axios.post('localhost:3005/add/transport', {params: res});
        //     setData(processResponse(result));
        // } catch (e) {
        //     console.log(e.stack);
        // }
    }
    
    //update ticketcost, need type,cost,transportid,tripid
    const submitHandlerModify = async (res, data, selected, setData) => {

        const selectedMod = data[selected];
        let ret = 
        {
            ...res, 
            type: selectedMod.Type, 
            Ticket_Cost: res.Ticket_Cost,
            TripID: props.tripID, 
            TransportId: selectedMod.TransportID,
        };
        try{
            const result = await axios.post('http://localhost:3005/update/transit', ret);
            setData(processResponse(result.data));
        } catch (e) {
            console.log(e.stack);
        }
    }
    
    const deleteTransit = async (selected, data, setData) => {
        const selectedMod = data[selected];
        const queryObj = {
            TripID: props.tripID,
            Type: selectedMod.Type,
            TransportID: selectedMod.TransportID,
        };
        if (selectedMod.Type === "bus") {
            queryObj["Bus_Lines"] = selectedMod.Lines;
        } else {
            queryObj["Train_Lines"] = selectedMod.Lines;
        }
        try {
            const result = await axios.post('http://localhost:3005/delete/transit', queryObj);
            console.log(result);
            setData(processResponse(result.data));
        } catch (e) {
            console.log(e.stack);
        }
    }

    if (formTransit === 'add') {
        transit = <AddTransitForm data={null} type={formTransit} onSubmit={(e)=>{submitHandlerAdd(e, setData)}}/>
    } else if (formTransit === 'modify') {
        transit = <AddTransitForm data={data[selected]} type={formTransit} onSubmit={(e)=>{submitHandlerModify(e, data, selected, setData)}}/>
    }

    return (
        <div>
            <Table pagination={false} columns = {columns} dataSource={data} rowSelection={
                    {
                        type: "radio",
                        onSelect: (rec) => {
                            setSelected(rec.key);
                        }
                    }
                }/>
            <Row>
                {/* <Button onClick={()=>{setFormTransit('add')}}>Add</Button> */}
                <Modbutton onClick={()=>{setFormTransit('modify')}} disabled={isNaN(selected)}>Modify</Modbutton>
                <Modbutton onClick={()=>{deleteTransit(selected, data, setData)}}>Delete</Modbutton>
            </Row>
            { transit }
        </div>
    )
}

export default Transport;