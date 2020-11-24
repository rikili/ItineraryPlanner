import React, { useState } from 'react';
import { Table } from 'antd';


const columns = [
    {
        title: '# of People',
        dataIndex: 'Number_of_People'
    },
    {
        title: 'Location',
        dataIndex: 'Destination'
    },
    {
        title: 'Start-Date',
        dataIndex: 'StartDate'
    },
    {
        title: 'End-Date',
        dataIndex: 'EndDate'
    },
    {
        title: 'Approx. Cost',
        dataIndex: 'Estimated_Cost'
    }
]


const DisplayItineraries = (props) => {
    // TODO: use id in props to find itinerary information
    return (
        <div className="table">
            <Table 
                dataSource={props.data} 
                columns={columns} 
                pagination={false}
                rowSelection={
                    {
                        type: "radio",
                        onSelect: (rec) => {
                            props.changeSelected(rec.TripID);
                        }
                    }
                }
            />
        </div>
    )
}

export default DisplayItineraries;