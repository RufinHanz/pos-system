import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../database/firebase';
import './logincss/Login.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await auth.signInWithEmailAndPassword(email, password);
            navigate('/Sales');
        } catch (error) {
            if (!navigator.onLine) {
                setError('No internet connection. Please Try Again.')
                return;
            }
            else {
                setError('Invalid Username or Password, Please Try Again.')
            };
        };
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <h1>Welcome!</h1>
            </div>
            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required />

                <button type="submit">
                    Log In
                </button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register here.</Link>
            </p>
        </div>
    );
};

export default LoginPage;