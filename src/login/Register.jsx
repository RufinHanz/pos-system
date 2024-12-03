import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../database/firebase';
import './logincss/Register.css';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError(<span style={{ color: 'orange' }}>Please enter your Email and Password.</span>);
            return;
        }


        try {
            const { user } = await auth.createUserWithEmailAndPassword(email, password);
            await firestore.collection('users').doc(user.uid).set({ email });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError(<span style={{ color: 'red' }}>This email is already in use. Please try a different email.</span>);
            } else if (error.code === 'auth/invalid-email') {
                setError(<span style={{ color: 'red' }}>Invalid email format. Please enter a valid email.</span>);
            } else if (error.code === 'auth/weak-password') {
                setError(<span style={{ color: 'red' }}>Password should be at least 6 characters.</span>);
            } else {
                setError(<span style={{ color: 'red' }}>Registration failed. Please try again.</span>);
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-header">
                <h1>Register Account?</h1>
            </div>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message" style={{color: 'orange'}}>Registration successful. Redirecting to login page...</p>}
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login here.</Link>
            </p>
        </div>
    );
};

export default RegisterPage;