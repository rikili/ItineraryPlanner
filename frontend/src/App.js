import React, { useState, useEffect } from 'react';
import './App.css';
import DisplayItineraries from './components/DisplayItineraries';
import AddItineraryForm from './components/AddItineraryForm';
import { Layout, Button, message, Modal } from 'antd';
import styled from 'styled-components';
import Bookings from './components/Bookings';
import Rentals from './components/Rentals';
import Transport from './components/Transport';
import LoginForm from './components/LoginForm';
const axios = require('axios');


const { Sider } = Layout;

const state = [
    {
        key: 1,
        name: "potato",
        loc: "tomato",
        startDate: "asdb123",
        endDate: "zxb123",
        estimatedCost: 123421
    },
    {
        key: 2,
        name: "pineapple",
        loc: "zxcv",
        startDate: "asdb123",
        endDate: "zxb123",
        estimatedCost: 124123
    }
];

const MenuButton = styled(Button)`
    width: 100%;
    color: white;
`

const MenuButtonLower = styled(MenuButton)`
    margin-bottom: 1.15em;
`

const Spacer = styled.div`
    padding-top: 2em;
`

const MenuLabel = styled.h2`
    color: white;
`

const TextLabel = styled.p`
    color: white;
    font-size: 11px;
`

const checkSelect = (selected, cb) => {
    if (isNaN(selected)) {
        message.error("Please select an Itinerary first", 1.5)
    } else {
        cb(true);
    }
}

const handleOk = (selected, setFn) => {
    setFn(false);
}

const handleCancel = (setFn) => {
    setFn(false);
}

const handleAdd = (data, res) => {
    data.push(res); // parse out only the itinerary data and add that to itinerary data
    // 
    console.log(data);
}


function App() { // TODO: props holds user data
    const [selected, setSelected] = useState(NaN);
    const [addVisible, setAdd] = useState(false);
    const [bookingVisible, setBooking] = useState(false);
    const [rentalsVisible, setRentals] = useState(false);
    const [transportVisible, setTransport] = useState(false);
    const [username, setUsername] = useState('');
    const [data, setData] = useState([]);

    const checkUsername = async (username) => {
        try {
            const result = state;
            // const result = await axios.get('localhost:4000/checkUser/' + username);
            setData([...result]);
            setUsername(username);
        } catch (error) {
            console.log("problemo -- checkUsername")
            message.error("Invalid Login", 1.5)
        }

    }

    return (
        <Layout className="App" style={{height: '100vh', width: '100hh'}}>
            <Sider style={{padding: '30px'}}>
                <MenuButton 
                    type='default' 
                    ghost
                    onClick={()=>setAdd(true)}
                >
                    Add New Itinerary
                </MenuButton>
                <Modal
                    visible={addVisible}
                    onOk={()=>handleOk(selected, setAdd)}
                    onCancel={()=>handleCancel(setAdd)}
                >
                    <AddItineraryForm add={(inp)=>handleAdd([], inp)}/>
                </Modal>
                <Spacer>
                    <MenuLabel>Manage:</MenuLabel>
                    <TextLabel>*requires a selection*</TextLabel>
                    <MenuButtonLower type='primary' onClick={()=>checkSelect(selected, setBooking)}>Bookings</MenuButtonLower>
                    <Modal
                        title='Manage Accommodations & Attractions'
                        visible={bookingVisible}
                        onOk={()=>handleOk(selected, setBooking)}
                        onCancel={()=>handleCancel(setBooking)}
                        width={'95%'}
                    >
                        <Bookings tripID={selected}/>
                    </Modal>
                    <MenuButtonLower type='primary' onClick={()=>checkSelect(selected, setRentals)}>Rentals</MenuButtonLower>
                    <Modal
                        getContainer={false}
                        title='Manage Rentals'
                        visible={rentalsVisible}
                        onOk={()=>handleOk(selected, setRentals)}
                        onCancel={()=>handleCancel(setRentals)}
                        width={'95%'}
                    >
                        <Rentals tripID={selected}/>
                    </Modal>
                    <MenuButtonLower type='primary'onClick={()=>checkSelect(selected, setTransport)}>Transport</MenuButtonLower>
                    <Modal
                        title='Manage Transportation'
                        visible={transportVisible}
                        onOk={()=>handleOk(selected, setTransport)}
                        onCancel={()=>handleCancel(setTransport)}
                        width={'95%'}
                    >
                        <Transport tripID={selected}/>
                    </Modal>
                    <Spacer/>
                    <MenuLabel>View:</MenuLabel>
                    <MenuButtonLower type='primary'>Tours</MenuButtonLower>
                    <MenuButtonLower type='primary'>Other Itineraries</MenuButtonLower>
                </Spacer>
                <Spacer>
                    <Button type='primary' danger>Delete Itinerary</Button>
                </Spacer>
                <Spacer>
                    <LoginForm onSubmit={checkUsername}/>
                </Spacer>
            </Sider>
            <Layout className='test'>
                <div>Hello: {username}</div>
                <DisplayItineraries changeSelected={setSelected} data={data}/>
            </Layout>
        </Layout>
    );
}

export default App;
