import { RegisterForm } from '@/components/auth/RegisterForm';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return <RegisterForm onBackToLogin={handleBackToLogin} />;
}