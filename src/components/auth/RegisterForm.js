import React, { useState } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';

const FormContainer = styled.div`
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    color: white;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #444;
    border-radius: 4px;
    background: #222;
    color: white;
`;

const Button = styled.button`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    background: #4a90e2;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;

    &:hover {
        background: #357abd;
    }

    &:disabled {
        background: #666;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    color: #ff4444;
    margin: 10px 0;
`;

function RegisterForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
            setError('Všechna pole jsou povinná');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Hesla se neshodují');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Heslo musí mít alespoň 6 znaků');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Uživatelské jméno musí mít alespoň 3 znaky');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const { data } = await supabaseService.signUp(
                formData.email,
                formData.password,
                formData.username
            );
            onSuccess(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <h2>Registrace</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    type="text"
                    name="username"
                    placeholder="Uživatelské jméno"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Heslo"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Potvrzení hesla"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Registruji...' : 'Registrovat'}
                </Button>
            </form>
        </FormContainer>
    );
}

export default RegisterForm;
