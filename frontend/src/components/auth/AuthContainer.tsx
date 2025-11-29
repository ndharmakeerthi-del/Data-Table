import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthContainer() {
    const [isLoginMode, setIsLoginMode] = useState(true);

    const showRegister = () => setIsLoginMode(false);
    const showLogin = () => setIsLoginMode(true);

    if (isLoginMode) {
        return <LoginForm onSwitchToRegister={showRegister} />;
    }

    return <RegisterForm onBackToLogin={showLogin} />;
}