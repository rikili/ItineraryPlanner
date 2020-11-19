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

const AddRentalForm = ({data, type, onSubmit}) => {
    // const [form] = Form.useForm();

    // if (data !== null) {
    //     form.setFieldsValue(data);
    // }

    return (
        <Form
            {...layout}
            name='rental'
            onFinish={(e)=>onSubmit(e)}
        >
            <Form.Item
                label='Type'
                name='type'
            >
                <Input style={{width: '60%'}}/>
            </Form.Item>
            <Form.Item
                label='Rental Cost'
                name='rentalCost'
            >
                <InputNumber min={0}/>
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">{type === 'add' ? 'Add' : 'Modify'}</Button>
            </Form.Item>
        </Form>
    )
}

export default AddRentalForm;