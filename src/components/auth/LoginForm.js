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
`;

const ErrorMessage = styled.div`
    color: #ff4444;
    margin: 10px 0;
`;

function LoginForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await supabaseService.signIn(email, password);
            onSuccess(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <h2>Přihlášení</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Heslo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Přihlašování...' : 'Přihlásit se'}
                </Button>
            </form>
        </FormContainer>
    );
}

export default LoginForm;
