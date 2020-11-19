import React, { useState } from 'react';
import { Table } from 'antd';


const columns = [
    {
        title: 'Name',
        dataIndex: 'name'
    },
    {
        title: 'Location',
        dataIndex: 'loc'
    },
    {
        title: 'Start-Date',
        dataIndex: 'startDate'
    },
    {
        title: 'End-Date',
        dataIndex: 'endDate'
    },
    {
        title: 'Approx. Cost',
        dataIndex: 'estimatedCost'
    }
]


const DisplayItineraries = (props) => {
    // TODO: use id in props to find itinerary information
    return (
        <div className="table">
            <Table 
                dataSource={props.data} 
                columns={columns} 
                rowSelection={
                    {
                        type: "radio",
                        onSelect: (rec) => {
                            props.changeSelected(rec.key);
                        }
                    }
                }
            />
        </div>
    )
}

export default DisplayItineraries;