import React from 'react';
import { Form, Input, Button, InputNumber, DatePicker } from 'antd';

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const formatRet = (res, add) => {
    res.StartDate = res.StartDate.year().toString() + '-' + res.StartDate.month().toString() + '-' + res.StartDate.date().toString();
    res.EndDate = res.EndDate.year().toString() + '-' + res.EndDate.month().toString() + '-' + res.EndDate.date().toString();
    add(res);
}

const AddItineraryForm = ({add}) => {
    return (
        <Form
            {...layout}
            name='acc'
            onFinish={(e) => formatRet(e, add)}
        >
            <Form.Item
                label='# of People'
                name='Number_of_People'
            >
                 <InputNumber min={0}/>
            </Form.Item>
            <Form.Item
                label='Location'
                name='Destination'
            >
                <Input />
            </Form.Item>
            <Form.Item
                label='Start-Date'
                name='StartDate'
            >
                <DatePicker />
            </Form.Item>
            <Form.Item
                label='End-Date'
                name='EndDate'
            >
                <DatePicker />
            </Form.Item>
            <Form.Item
                label='Est. Cost'
                name='Estimated_Cost'
            >
                <InputNumber min={0}/>
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    )
}

export default AddItineraryForm;