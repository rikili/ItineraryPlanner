import React from 'react';
import { Form, Input, Button } from 'antd';
import styled from 'styled-components';

const Label = styled.label`
    color: white;
`

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

const LoginForm = ({onSubmit}) => {
    return (
        <div>
            <h2 style={{color:'white'}}>
                Login
            </h2>
            <Form
                {...layout}
                name='login'
                onFinish={(e)=>onSubmit(e.username)}
            >
                <Form.Item
                    label={<Label>User: </Label>}
                    name='username'
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label={<Label>Pass: </Label>}
                    name='password'
                >
                    <Input.Password visibilityToggle={false}/>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">Login</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default LoginForm;