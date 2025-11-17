import React from 'react';

const Settings = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Configurações</h1>
      <div className="trading-card">
        <p className="text-muted-foreground">
          Página de configurações em desenvolvimento. Aqui será implementado:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground ml-4">
          <li>• Configurações de perfil</li>
          <li>• Configurações de segurança (2FA)</li>
          <li>• Preferências de trading</li>
          <li>• Configurações de notificações</li>
          <li>• Temas (claro/escuro)</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
