import React from 'react';
import { Form, Input, Button, InputNumber } from 'antd';

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

const AddItineraryForm = ({add}) => {
    return (
        <Form
            {...layout}
            name='acc'
            onFinish={(e) => add(e)}
        >
            <Form.Item
                label='Name'
                name='name'
            >
                <Input />
            </Form.Item>
            <Form.Item
                label='Location'
                name='location'
            >
                <Input />
            </Form.Item>
            <Form.Item
                label='Start-Date'
                name='startDate'
            >
                <Input />
            </Form.Item>
            <Form.Item
                label='End-Date'
                name='endDate'
            >
                <Input />
            </Form.Item>
            <Form.Item
                label='Est. Cost'
                name='estimatedCost'
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