import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';
import { LoginSchema, LoginFormData } from '@/schemas';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormInput } from '../customUi/formInput';

interface LoginFormProps {
    onSwitchToRegister?: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const loginMutation = useLogin();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <LogIn className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-2">
                            Sign in to access your dashboard
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                            <div className='space-y-10'>
                                
                                <FormInput
                                    control={form.control}
                                    name='username'
                                    label='Username'
                                    type='text'
                                    placeholder='Enter your username'
                                    className='h-11 border-border/50 focus:border-primary transition-colors'
                                    disabled={loginMutation.isPending}
                                    leftIcon={<User className='w-4 h-4' />}
                                />

                                <FormInput
                                    control={form.control}
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    className="h-10 border-border/50 focus:border-primary transition-colors"
                                    disabled={loginMutation.isPending}
                                    leftIcon={<Lock className="w-4 h-4" />}
                                    rightIcon={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loginMutation.isPending}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    }
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 bg-primary hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 text-primary-foreground">
                                        <LogIn className="w-4 h-4 text-primary-foreground" />
                                        <span>Sign In</span>
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center space-y-2">
                        <div className="text-xs text-muted-foreground">
                            <p>Demo credentials: admin / admin123</p>
                        </div>
                        {onSwitchToRegister && (
                            <div className="text-sm">
                                <span className="text-muted-foreground">Don't have an account? </span>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto text-primary font-medium"
                                    onClick={onSwitchToRegister}
                                >
                                    Register here
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}