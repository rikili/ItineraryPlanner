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
    if (selected === null) {
        message.error("Please select an Itinerary first", 1.5)
    } else {
        cb(true);
    }
}

function App() { // TODO: props holds user data
    const [selected, setSelected] = useState(null);
    const [addVisible, setAdd] = useState(false);
    const [bookingVisible, setBooking] = useState(false);
    const [rentalsVisible, setRentals] = useState(false);
    const [transportVisible, setTransport] = useState(false);
    const [username, setUsername] = useState('');
    const [data, setData] = useState([]);

    const handleClose = (setFn) => {
        setFn(false);
    }
    
    const checkUsername = async(username) => {
        try {
            // const result = state;
            const result = await axios.get('http://localhost:3005/get/checkUsername?Username=' + username);
            setUsername(username);
            if (result.data.result === true) {
                const update = await axios.get('http://localhost:3005/get/UserItinerary?Username=' + username)
                console.log(update);
                updateData(update);
                message.success("Logged In As: " + username);
            } else {
                message.error("Invalid Login", 1.5);
            }
        } catch (error) {
            console.log("problemo -- checkUsername");
            message.error("Invalid Login", 1.5);
        }
    }

    const handleAdd = async (res) => {
        const ret = {...res, Username: username};
        try {
            await axios.post('http://localhost:3005/add/itinerary', ret);
            const result = await axios.get('http://localhost:3005/get/UserItinerary?Username=' + username);
            updateData(result);
        } catch (e) {
            console.log(e.stack);
            message.info(e);
        }
        message.info("Added: " + res.Destination);
    }

    const handleDelete = async () => {
        let result = [];
        // const location = data[selected].Destination;
        try {
            result = await axios.post('http://localhost:3005/delete/itinerary', {
                TripID: selected,
                Username: username
            });
        } catch (e) {
            console.log(e.stack);
            message.info(e);
        }
        updateData(result);
        message.info("Trip Deleted");
    }

    const updateData = (result) => {
        const genKey = (arr) => {
            return arr.map((item, index) => {
                return {...item, key: index};
            });
        }
    
        const update = async () => {
            try{
                setData(genKey(result.data));
            } catch (e) {
                console.log('problemo -- updateData');
            }
        }

        update();
    }

    const callAllAtt = async () => {
        try {
            const result = await axios.get('http://localhost:3005/get/allAttractions');
            const res = result.data[0].Count;
            message.info("Itineraries that contain every destination: " + res, 3);
        } catch (e) {
            console.log("Problem allAttractions call")
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
                    onOk={()=>handleClose(setAdd)}
                    onCancel={()=>handleClose(setAdd)}
                >
                    <AddItineraryForm add={(inp)=>handleAdd(inp)}/>
                </Modal>
                <Spacer>
                    <MenuLabel>Manage:</MenuLabel>
                    <TextLabel>*requires a selection*</TextLabel>
                    <MenuButtonLower type='primary' onClick={()=>checkSelect(selected, setBooking)}>Bookings</MenuButtonLower>
                    <Modal
                        title='Manage Accommodations & Attractions'
                        visible={bookingVisible}
                        onOk={()=>handleClose(setBooking)}
                        onCancel={()=>handleClose(setBooking)}
                        width={'95%'}
                    >
                        <Bookings tripID={selected}/>
                    </Modal>
                    <MenuButtonLower type='primary' onClick={()=>checkSelect(selected, setRentals)}>Rentals</MenuButtonLower>
                    <Modal
                        getContainer={false}
                        title='Manage Rentals'
                        visible={rentalsVisible}
                        onOk={()=>handleClose(setRentals)}
                        onCancel={()=>handleClose(setRentals)}
                        width={'95%'}
                    >
                        <Rentals tripID={selected}/>
                    </Modal>
                    <MenuButtonLower type='primary'onClick={()=>checkSelect(selected, setTransport)}>Transport</MenuButtonLower>
                    <Modal
                        title='Manage Transportation'
                        visible={transportVisible}
                        onOk={()=>handleClose(setTransport)}
                        onCancel={()=>handleClose(setTransport)}
                        width={'95%'}
                    >
                        <Transport tripID={selected}/>
                    </Modal>
                    <Spacer/>
                    <MenuLabel>View:</MenuLabel>
                    <MenuButtonLower onClick={()=>callAllAtt()} type='primary'>Div Stats</MenuButtonLower>
                    {/* <MenuButtonLower type='primary'>Other Itineraries</MenuButtonLower> */}
                </Spacer>
                <Spacer>
                    <Button type='primary' danger onClick={handleDelete}>Delete Itinerary</Button>
                </Spacer>
                <Spacer>
                    <LoginForm onSubmit={checkUsername}/>
                </Spacer>
            </Sider>
            <Layout className='test'>
                <div>{data.length === 0 ?  "" : "Hello: " + username}</div>
                <DisplayItineraries changeSelected={setSelected} data={data}/>
            </Layout>
        </Layout>
    );
}

export default App;
