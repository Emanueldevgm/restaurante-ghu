import React from 'react';

interface FormToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

export function FormToggle({ isLogin, onToggle }: FormToggleProps) {
  return (
    <div className="text-center pt-2">
      <p className="text-gray-600 text-sm">
        {isLogin ? (
          <>
            Não tem conta?{' '}
            <button
              type="button"
              onClick={onToggle}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            Já tem conta?{' '}
            <button
              type="button"
              onClick={onToggle}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
