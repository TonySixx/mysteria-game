import React, { useState } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';
import { theme } from '../../styles/theme';

const FormContainer = styled.div`
    max-width: 500px;
    margin: 40px auto;
    padding: 30px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 3px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    color: ${theme.colors.text.primary};
    box-shadow: ${theme.shadows.golden};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${theme.colors.border.golden};
    }

    h2 {
        font-family: 'MedievalSharp', cursive;
        text-align: center;
        font-size: 2em;
        margin-bottom: 30px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: ${theme.colors.text.primary};
        text-shadow: ${theme.shadows.golden};
    }
`;

const Input = styled.input`
    font-family: 'Crimson Pro', serif;
    width: 465px;
    padding: 15px;
    margin: 15px 0;
    border: 2px solid ${theme.colors.backgroundLight};
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.3);
    color: ${theme.colors.text.light};
    font-size: 1.1em;
    transition: all 0.3s;

    &:focus {
        border-color: ${theme.colors.primary};
        box-shadow: ${theme.shadows.golden};
        outline: none;
    }

    &::placeholder {
        font-family: 'Crimson Pro', serif;
        color: rgba(255, 215, 0, 0.3);
    }
`;

const Button = styled.button`
    font-family: 'Cinzel', serif;
    width: 100%;
    padding: 15px;
    margin: 20px 0;
    background: linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.backgroundLight});
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    font-size: 1.2em;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    font-family: 'Crimson Pro', serif;
    color: ${theme.colors.accent};
    margin: 15px 0;
    padding: 10px;
    border: 1px solid ${theme.colors.accent};
    border-radius: 4px;
    background: rgba(139, 0, 0, 0.1);
    text-align: center;
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
            setError('All fields are required');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters long');
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
            window.location.reload();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <h2>Register</h2>
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
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </Button>
            </form>
        </FormContainer>
    );
}

export default RegisterForm;
