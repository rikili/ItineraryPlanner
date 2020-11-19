import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button } from 'antd';
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
                    name='addr'
                >
                    <Input disabled={type==='modify' ? true : false}/>
                </Form.Item>
                <Form.Item
                    label='Room Number'
                    name='RoomNum'
                >
                    <Input disabled={type==='modify' ? true : false}/>
                </Form.Item>
                <Form.Item
                    label='Type'
                    name='type'
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label='Daily Cost'
                    name='dailycost'
                >
                    <InputNumber min={0} />
                </Form.Item>
                <Form.Item
                    label='Check-In Time'
                    name='checkinTime'
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label='Check-Out Time'
                    name='checkoutTime'
                >
                    <Input />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">{type === 'add' ? 'Add' : 'Modify'}</Button>
                </Form.Item>
            </Form>
        </Sdiv>
    );
}

export default AddAccForm;