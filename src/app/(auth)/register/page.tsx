import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input } from '../../../components/ui';
import { signUp } from '../../../lib/auth';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await signUp(email, password);
            router.push('/(auth)/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="w-80">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button type="submit" className="mt-4">Register</Button>
            </form>
            <p className="mt-4">
                Already have an account? <a href="/(auth)/login" className="text-blue-500">Login</a>
            </p>
        </div>
    );
};

export default RegisterPage;