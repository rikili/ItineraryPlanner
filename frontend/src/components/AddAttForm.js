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

const AddAttForm = ({ data, onSubmit, type }) => {
    const [form] = Form.useForm();

    if (data !== null) {
        form.setFieldsValue(data);
    }

    return (
        <Sdiv>
            <Form
                {...layout}
                name='acc'
                onFinish={(e) => onSubmit(e, 'att')}
            >
                <Form.Item
                    label='Name'
                    name='Name'
                >
                    <Input disabled={type==='modify' ? true : false}/>
                </Form.Item>
                <Form.Item
                    label='Location'
                    name='Location'
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

export default AddAttForm;