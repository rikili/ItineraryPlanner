import React from 'react'
import { Form, Input, InputNumber, Button } from 'antd';

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

const AddTransitForm = ({data, type, onSubmit}) => {
    // const [form] = Form.useForm();

    // if (data !== null) {
    //     form.setFieldsValue(data);
    // }

    return (
        <Form
            {...layout}
            name='transit'
            onFinish={(e)=>onSubmit(e)}
        >
            <Form.Item
                label='Type'
                name='Type'
            >
                <Input style={{width: '60%'}}  disabled={type==='modify' ? true : false}/>
            </Form.Item>
            <Form.Item
                label='Lines'
                name='Lines'
            >
                <Input style={{width: '60%'}}  disabled={type==='modify' ? true : false}/>
            </Form.Item>
            <Form.Item
                label='Ticket Cost'
                name='Ticket_Cost'
            >
                <InputNumber min={0}/>
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">{type === 'add' ? 'Add' : 'Modify'}</Button>
            </Form.Item>
        </Form>
    )
}

export default AddTransitForm;