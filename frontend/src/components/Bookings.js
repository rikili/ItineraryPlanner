import React, { useEffect, useState } from 'react';
import { Row, Col, Divider, Table, Button } from 'antd';
import AddAccForm from './AddAccForm';
import AddAttForm from './AddAttForm';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
const axios = require('axios');

const Modbutton = styled(Button)`
    margin-left: .5em;
    margin-top: .5em;
`

const columnsAccommodation = [
    {
        title: 'Address',
        dataIndex: 'addr'
    },
    {
        title: 'Room Number',
        dataIndex: 'RoomNum'
    },
    {
        title: 'Type',
        dataIndex: 'type'
    },
    {
        title: 'Daily Cost',
        dataIndex: 'dailycost'
    },
    {
        title: 'Check-In Time',
        dataIndex: 'checkinTime'
    },
    {
        title: 'Check-Out Time',
        dataIndex: 'checkoutTime'
    }
]

const columnsAttraction = [
    {
        title: 'Name',
        dataIndex: 'name'
    },
    {
        title: 'Location',
        dataIndex: 'location'
    }
]


const Bookings = (props) => { //props contains userID
    const [formAcc, setFormAcc] = useState('');
    const [formAtt, setFormAtt] = useState('');
    const [attractionData, setAttData] = useState([]);
    const [accommodationData, setAccData] = useState([]);
    const [selectAcc, setSelAcc] = useState(null);
    const [selectAtt, setSelAtt] = useState(null);

    useEffect(() => {
        const get = async () => {
            try {
                // const result = axios.get('/');
                // set
                setAttData([]); // todo: revisit
                setAccData([]);
            } catch (e) {
                console.error(e);
            }
        }

        get();
    }, [setAttData, setAccData]);

    const resetForm = (type) => {
        if (type === 'att') {
            setFormAtt('');
        } else {
            setFormAcc('');
        }
    }

    const onAddSubmit = async (res, type) => {
        try {
            // const result = await axios.post('localhost:4000/'); // ItineraryID, 
            console.log(res);
            console.log(type);
            const data = (type === 'acc' ? accommodationData : attractionData);
            const setData = (type === 'acc' ? setAccData : setAttData);
            console.log(data);
            res['key'] = uuidv4();
            setData([...data,res]);
            resetForm(type);
        } catch (err) {

        }
    };

    const onModifySubmit = (res, type, selected) => {
        // request call
        const data = (type === 'acc' ? accommodationData : attractionData);
        const setData = (type === 'acc' ? setAccData : setAttData);
        let temp = [];
        if (type === 'acc') {
            temp = data.map((item) => {
                if (item.key === selected){
                    return {
                        key: item.key,
                        addr: res['addr'],
                        RoomNum: res['RoomNum'],
                        type: res['type'],
                        dailycost: res['dailycost'],
                        checkinTime: res['checkinTime'],
                        checkoutTime: res['checkoutTime']
                    };
                }
                return item;
            });
        } else {
            temp = data.map((item) => {
                if (item.key === selected){
                    return {
                        key: item.key,
                        name: res['name'],
                        location: res['location']
                    };
                }
                return item;
            });
        }
        setData(temp);
        resetForm(type);
    };

    const onDelete = (type) => {
        const data = (type === 'acc' ? accommodationData : attractionData);
        const setData = (type === 'acc' ? setAccData : setAttData);
        const selected = (type === 'acc' ? selectAcc : selectAtt);
        const temp = data.filter((item) => {
            return !(item.key === selected);
        });
        setData(temp);
        resetForm(type);
    };

    let formAccElem = null;
    if (formAcc === 'add') {
        formAccElem = <AddAccForm data={null} onSubmit={(e, type)=>onAddSubmit(e, type)} type='add' />
    } else if (formAcc === 'modify') {
        formAccElem = <AddAccForm data={null} onSubmit={(e, type)=>onModifySubmit(e, type, selectAcc)} type='modify' />  // todo fill data
    }

    let formAttElem = null;
    if (formAtt === 'add') {
        formAttElem = <AddAttForm data={null} onSubmit={(e, type)=>onAddSubmit(e, type)} type='add' />
    } else if (formAtt === 'modify') {
        formAttElem = <AddAttForm data={null} onSubmit={(e, type)=>onModifySubmit(e, type, selectAtt)} type='modify' />  // todo fill data
    }

    // get info call
    return (
        <Row>
            <Col className="gutter-row" span={11}>
                <h2>Accommodations:</h2>
                <Table columns={columnsAccommodation} dataSource={accommodationData} rowSelection={
                    {
                        type: "radio",
                        onSelect: (rec) => {
                            setSelAcc(rec.key);
                        }
                    }
                }/>
                <Row>
                    <Modbutton onClick={() => setFormAcc('add')}>Add</Modbutton>
                    <Modbutton onClick={() => setFormAcc('modify')}>Modify</Modbutton>
                    <Modbutton onClick={() => onDelete('acc')}>Delete</Modbutton>
                </Row>
                { formAccElem }
            </Col>
            <Col className="gutter-row" span={11} offset={2}>
                <h2>Attractions:</h2>
                <Table columns={columnsAttraction} dataSource={attractionData} rowSelection={
                    {
                        type: "radio",
                        onSelect: (rec) => {
                            setSelAtt(rec.key);
                        }
                    }
                }/>
                <Row>
                    <Modbutton onClick={() => setFormAtt('add')}>Add</Modbutton>
                    <Modbutton onClick={() => setFormAtt('modify')}>Modify</Modbutton>
                    <Modbutton onClick={() => onDelete('att')}>Delete</Modbutton>
                </Row>
                { formAttElem }
            </Col>
        </Row>
    )
}

export default Bookings