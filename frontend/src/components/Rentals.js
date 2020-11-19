import React, { useState } from 'react';
import { Table, Button, Row } from 'antd';
import AddRentalForm from './AddRentalForm'
import { v4 as uuidv4 } from 'uuid';

const tempData = [
    {
        key: 1,
        type: 'tennis racket',
        rentalCost: 10
    },
    {
        key: 2,
        type: 'basketball',
        rentalCost: 5
    }
]

const columns = [
    {
        title: 'Type',
        dataIndex: 'type'
    },
    {
        title: 'Rental Cost',
        dataIndex: 'rentalCost'
    }
]

const submitHandlerAdd = (res, data, setData) => {
    // send add request
    res['key'] = uuidv4();
    setData([...data,res]);
}

const submitHandlerModify = (res, data, selected, setData) => {
    // send modify request
    const temp = data.map((item) => {
        if (item.key === selected){
            return {
                key: item.key,
                type: res['type'],
                rentalCost: res['rentalCost']
            };
        }
        return item;
    });
    setData(temp);
}

const deleteRental = (selected, data, setData) => {
    // send delete request
    console.log(selected);
    const temp = data.filter((item) => {
        return !(item.key === selected);
    });
    setData(temp);
}

const Rentals = () => {
    const [formRental, setFormRental] = useState('');
    const [selected, setSelected] = useState('');
    const [data, setData] = useState(tempData);
    let rental = null;

    // get data from request

    if (formRental === 'add') {
        rental = <AddRentalForm data={null} type={formRental} onSubmit={(e)=>{submitHandlerAdd(e, data, setData)}}/>
    } else if (formRental === 'modify') {
        rental = <AddRentalForm data={data[selected]} type={formRental} onSubmit={(e)=>{submitHandlerModify(e, data, selected, setData)}}/>
    }

    return (
        <div>
            <Table columns = {columns} dataSource={data} rowSelection={
                    {
                        type: "radio",
                        onSelect: (rec) => {
                            setSelected(rec.key);
                        }
                    }
                }/>
            <Row>
                <Button onClick={()=>{setFormRental('add')}}>Add</Button>
                <Button onClick={()=>{setFormRental('modify')}} disabled={isNaN(selected)}>Modify</Button>
                <Button onClick={()=>{deleteRental(selected, data, setData)}}>Delete</Button>
            </Row>
            { rental }
        </div>
    )
}

export default Rentals;