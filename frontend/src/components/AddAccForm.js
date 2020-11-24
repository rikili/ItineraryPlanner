import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, DatePicker } from 'antd';
import styled from 'styled-components';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const Sdiv = styled.div`
    width: 90%;
    padding-top: 1em;
`

const AddAccForm = ({ data, onSubmit, type }) => {
    const [form] = Form.useForm();

    if (data !== null) {
        form.setFieldsValue(data);
    }

    return (
        <Sdiv>
            <Form
                {...layout}
                name='acc'
                onFinish={(e) => onSubmit(e, 'acc')}
            >
                <Form.Item
                    label='Address'
                    name='Address'
                >
                    <Input disabled={type==='modify' ? true : false}/>
                </Form.Item>
                <Form.Item
                    label='Room Number'
                    name='RoomNum'
                >
                    <InputNumber disabled={type==='modify' ? true : false}/>
                </Form.Item>
                <Form.Item
                    label='Type'
                    name='Type'
                >
                    <Input disabled={type==='modify' ? true : false}/>
                </Form.Item>
                <Form.Item
                    label='Daily Cost'
                    name='Daily_Cost'
                >
                    <InputNumber min={0} />
                </Form.Item>
                <Form.Item
                    label='Check-In Time'
                    name='CheckIn_Time'
                >
                    <DatePicker />
                </Form.Item>
                <Form.Item
                    label='Check-Out Time'
                    name='CheckOut_Time'
                >
                    <DatePicker />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">{type === 'add' ? 'Add' : 'Modify'}</Button>
                </Form.Item>
            </Form>
        </Sdiv>
    );
}

export default AddAccForm;