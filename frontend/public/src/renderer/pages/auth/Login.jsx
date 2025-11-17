import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, TrendingUp } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useLoginMutation } from '@/services/api/auth.api';
import { loginSchema } from '@/utils/validators';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();
      
      // Salvar credenciais no Redux
      dispatch(setCredentials({
        user: result.user,
        token: result.token,
      }));

      // Salvar token no localStorage se "lembrar-me" estiver marcado
      if (data.rememberMe) {
        localStorage.setItem('auth_token', result.token);
      }

      // Redirecionar para dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.status === 401) {
        setError('root', {
          message: 'Email ou senha incorretos',
        });
      } else if (error.status === 403) {
        setError('root', {
          message: 'Conta não verificada. Verifique seu email.',
        });
      } else {
        setError('root', {
          message: 'Erro interno do servidor. Tente novamente.',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Investment App</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Entre na sua conta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse sua plataforma de investimentos
            </p>
          </div>

          {/* Formulário */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email */}
              <Input
                label="Email"
                type="email"
                icon={<Mail className="h-4 w-4" />}
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Senha */}
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Opções */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  {...register('rememberMe')}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {/* Erro geral */}
            {errors.root && (
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="text-sm text-destructive">{errors.root.message}</div>
              </div>
            )}

            {/* Botão de submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Link para registro */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Lado direito - Imagem/Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <TrendingUp className="h-24 w-24 mx-auto mb-8 opacity-80" />
            <h3 className="text-3xl font-bold mb-4">
              Invista com Inteligência
            </h3>
            <p className="text-xl opacity-90 max-w-md">
              Plataforma completa para seus investimentos na B3 com análises em tempo real
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm opacity-80">Ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Suporte</div>
              </div>
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm opacity-80">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
