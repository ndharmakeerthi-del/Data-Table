import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, User, Lock } from 'lucide-react';
import { RegisterSchema, RegisterFormData } from '@/schemas';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FormInput } from '../customUi/formInput';
import { FormSelect } from '../customUi/customSelect';

interface RegisterFormProps {
    onBackToLogin: () => void;
}

export function RegisterForm({ onBackToLogin }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const registerMutation = useRegister();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            gender: undefined,
            username: '',
            password: '',
            confirmPassword: '',
        },
    });


    if (registerMutation.isSuccess) {
        onBackToLogin();
    }

    const onSubmit = (data: RegisterFormData) => {
        registerMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserPlus className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-2">
                            Register as an admin to access the dashboard
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    control={form.control}
                                    name="firstName"
                                    label="First Name"
                                    type="text"
                                    placeholder="John"
                                    className="h-10 border-border/50 focus:border-primary transition-colors"
                                    disabled={registerMutation.isPending}
                                    leftIcon={<User className="w-4 h-4 text-muted-foreground" />}
                                />

                                <FormInput
                                    control={form.control}
                                    name="lastName"
                                    label="Last Name"
                                    type="text"
                                    placeholder="Doe"
                                    className="h-10 border-border/50 focus:border-primary transition-colors"
                                    disabled={registerMutation.isPending}
                                    leftIcon={<User className="w-4 h-4 text-muted-foreground" />}
                                />
                            </div>

                            <FormSelect
                                control={form.control}
                                name="gender"
                                label="Gender"
                                options={[
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' }
                                ]}
                                disabled={registerMutation.isPending}
                            />

                            <FormInput
                                control={form.control}
                                name="username"
                                label="Username"
                                type="text"
                                placeholder="Enter username"
                                className="h-10 border-border/50 focus:border-primary transition-colors"
                                disabled={registerMutation.isPending}
                                leftIcon={<User className="w-4 h-4" />}
                            />

                            <FormInput
                                control={form.control}
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                className="h-10 border-border/50 focus:border-primary transition-colors"
                                disabled={registerMutation.isPending}
                                leftIcon={<Lock className="w-4 h-4" />}
                                rightIcon={
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={registerMutation.isPending}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                }
                            />

                            <FormInput
                                control={form.control}
                                name="confirmPassword"
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm password"
                                className="h-10 border-border/50 focus:border-primary transition-colors"
                                disabled={registerMutation.isPending}
                                leftIcon={<Lock className="w-4 h-4" />}
                                rightIcon={
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={registerMutation.isPending}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                }
                            />

                            <div className="space-y-4 mt-6">
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-primary hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200"
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Creating Account...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2 text-primary-foreground">
                                            <UserPlus className="w-4 h-4 text-primary-foreground" />
                                            <span>Create Account</span>
                                        </div>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-10"
                                    onClick={onBackToLogin}
                                    disabled={registerMutation.isPending}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </form>
                    </Form>

                </CardContent>
            </Card>
        </div>
    );
}