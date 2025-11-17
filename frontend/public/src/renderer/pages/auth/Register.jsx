import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Investment App</h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Criar Conta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Página de registro em desenvolvimento
          </p>
        </div>
        
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
