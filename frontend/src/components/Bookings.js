import React, { useEffect, useState } from 'react';
import { Row, Col, Divider, Table, Button } from 'antd';
import AddAccForm from './AddAccForm';
import AddAttForm from './AddAttForm';
import styled from 'styled-components';
const axios = require('axios');

export const Modbutton = styled(Button)`
    margin-left: .5em;
    margin-top: .5em;
`

export const Modbutton2 = styled(Button)`
    margin-left: 8em;
    margin-top: .5em;
`

const columnsAccommodation = [
    {
        title: 'Address',
        dataIndex: 'Address'
    },
    {
        title: 'Room Number',
        dataIndex: 'RoomNum'
    },
    {
        title: 'Type',
        dataIndex: 'Type'
    },
    {
        title: 'Daily Cost',
        dataIndex: 'Daily_Cost'
    },
    {
        title: 'Check-In Time',
        dataIndex: 'CheckIn_Time'
    },
    {
        title: 'Check-Out Time',
        dataIndex: 'CheckOut_Time'
    }
]

const columnsAggAttraction = [
    {
        title: 'Location',
        dataIndex: 'Location'
    },
    {
        title: 'Count',
        dataIndex: 'Count'
    }
]

const columnsAvgPeople = [
    {
        title: 'Location',
        dataIndex: 'Destination'
    },
    {
        title: 'Average',
        dataIndex: 'Average'
    }
]

const columnsAttraction = [
    {
        title: 'Name',
        dataIndex: 'Name'
    },
    {
        title: 'Location',
        dataIndex: 'Location'
    }
]

// TODO: every setData should be refactored to a function that handles formatting response format (adding keys)

const processResponse  = (res, type) => { // add keys
    if (type === 'acc') {
        return res.map((item, index) => {
            const checkin = item.CheckIn_Time.match(/[^T]*?(?=[T.]+)/g)[0];
            const checkout = item.CheckOut_Time.match(/[^T]*?(?=[T.]+)/g)[0];
            return {...item, key: index, CheckIn_Time: checkin, CheckOut_Time: checkout};
        });
    } else if (type === 'att') {
        return res.map((item, index) => {
            return {...item, key: index};
        })
    }
}

const processSend = (res) => {
    res.CheckIn_Time = res.CheckIn_Time + " 00:00:00";
    res.CheckOut_Time = res.CheckOut_Time + " 00:00:00";
    return {...res};
}

const Bookings = (props) => { //props contains userID
    const [formAcc, setFormAcc] = useState('');
    const [formAtt, setFormAtt] = useState('');
    const [attractionData, setAttData] = useState([]);
    const [accommodationData, setAccData] = useState([]);
    const [attractionAgg, setAggAtt] = useState([]);
    const [avgData, setAvgData] = useState([]);
    const [showTable, setShowTable] = useState('att');
    const [selectAcc, setSelAcc] = useState(null);
    const [selectAtt, setSelAtt] = useState(null);

    useEffect(() => {
        const get = async () => {
            try {
                const attData = await axios.get('http://localhost:3005/get/attractions?TripID=' + props.tripID);
                const accData = await axios.get('http://localhost:3005/get/accommodation?TripID=' + props.tripID);
                setAttData(processResponse(attData.data, 'att'));
                setAccData(processResponse(accData.data, 'acc'));
            } catch (e) {
                console.error(e);
            }
        }

        get();
    }, [setAttData, setAccData, props]);

    const onAddSubmit = async (res, type) => {
        let result = [];
        const setData = (type === 'acc' ? setAccData : setAttData);
        try {
            if (type === "acc") {
                result = await axios.post('http://localhost:3005/add/accommodations', 
                {
                    ...res,
                    TripID: props.tripID
                });
            } else {
                result = await axios.post('http://localhost:3005/add/attractions', 
                {
                    ...res,
                    TripID: props.tripID
                });
            }
            setData(processResponse(result.data, type));
        } catch (err) {
            console.log("booking on add Error");
        }
    };

    const onModifySubmit = async (res, type, selected) => {
        let result = [];
        const setData = (type === 'acc' ? setAccData : setAttData);
        try {
            if (type === "acc") {
                res = processSend(res);
                const temp = {
                    ...res,
                    Address: accommodationData[selected].Address,
                    RoomNum: accommodationData[selected].RoomNum,
                    Type: accommodationData[selected].Type,
                    TripID: props.tripID
                }
                result = await axios.post('http://localhost:3005/update/accommodation', temp);
            } else {
                result = await axios.post('http://localhost:3005/update/attractions', {...res, Name: attractionData[selected].Name, TripID: props.tripID});
            }
            
        } catch (err) {
            console.log("booking on modify Error");
        }
        setData(processResponse(result.data, type));
    };

    const onDelete = async (type) => {
        let result = [];
        const setData = (type === 'acc' ? setAccData : setAttData);
        try {
            if (type === "acc") {
                result = await axios.post('http://localhost:3005/delete/accommodation', {...accommodationData[selectAcc], TripID: props.tripID});
            } else {
                result = await axios.post('http://localhost:3005/delete/attractions', {...attractionData[selectAtt], TripID: props.tripID});
            }
            
        } catch (err) {
            console.log("booking on delete Error");
        }
        setData(processResponse(result.data, type));
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

    const showAttractions = <Table pagination={false} columns={columnsAttraction} dataSource={attractionData} rowSelection={
            {
                type: "radio",
                onSelect: (rec) => {
                    setSelAtt(rec.key);
                }
            }
        }/>

    const showAggAttractions = <Table pagination={false} columns={columnsAggAttraction} dataSource={attractionAgg}/>
    const showAvgPeople = <Table pagination={false} columns = {columnsAvgPeople} dataSource={avgData}/>

    const showAggHandler = async () => {
        setShowTable('agg');
        setSelAtt(null);
        try {
            const result = await axios.get('http://localhost:3005/get/locationCount?TripID=' + props.tripID);
            setAggAtt(processResponse(result.data, 'att'));
        } catch (err) {
            console.log("aggregate display error");
        }
    }

    const showAttHandler = async () => {
        setShowTable('att');
        setSelAtt(null);
        try {
            const attData = await axios.get('http://localhost:3005/get/attractions?TripID=' + props.tripID);
            setAttData(processResponse(attData.data, 'att'));
        } catch (e) {
            console.log('error in showAtthandler')
        }
    }

    const showAvgHandler = async () => {
        setShowTable('avg');
        try {
            const attData = await axios.get('http://localhost:3005/get/averagePeople?Name=' + attractionData[selectAtt].Name);
            setAvgData(processResponse(attData.data, 'att'));
        } catch (e) {
            console.log('error in showAtthandler')
        }
    }

    const tableHandler = () => {
        switch(showTable) {
            case 'agg':
                return showAggAttractions;
            case 'avg':
                return showAvgPeople;
            default:
                return showAttractions;
        }
    }

    const modifyLogic = () => {
        if (showTable !== 'att') {
            return true;
        } else {
            if (selectAtt === null) {
                return true;
            }
        }
        return false;
    }

    return (
        <Row>
            <Col className="gutter-row" span={11}>
                <h2>Accommodations:</h2>
                <Table pagination={false} columns={columnsAccommodation} dataSource={accommodationData} onChange={() => {setSelAcc(null)}} rowSelection={
                    {
                        type: "radio",
                        onSelect: (rec) => {
                            setSelAcc(rec.key);
                        }
                    } 
                }/>
                <Row>
                    <Modbutton onClick={() => setFormAcc('add')}>Add</Modbutton>
                    <Modbutton disabled={selectAcc === null} onClick={() => setFormAcc('modify')}>Modify</Modbutton>
                    <Modbutton onClick={() => onDelete('acc')}>Delete</Modbutton>
                </Row>
                { formAccElem }
            </Col>
            <Col className="gutter-row" span={11} offset={2}>
                <h2>Attractions:</h2>
                { tableHandler() }
                <Row>
                    <Modbutton disabled={showTable !== 'att'} onClick={() => setFormAtt('add')}>Add</Modbutton>
                    <Modbutton disabled={modifyLogic()} onClick={() => setFormAtt('modify')}>Modify</Modbutton>
                    <Modbutton disabled={showTable !== 'att'} onClick={() => onDelete('att')}>Delete</Modbutton>
                    <Modbutton2 disabled={selectAtt === null} onClick={()=>showAvgHandler()}>AVG</Modbutton2>
                    <Modbutton disabled={showTable === 'agg'} onClick={() => showAggHandler()}>Group Locations</Modbutton>
                    <Modbutton disabled={showTable === 'att'} onClick={() => showAttHandler()}>Display Attractions</Modbutton>
                </Row>
                { formAttElem }
            </Col>
        </Row>
    )
}

export default Bookings