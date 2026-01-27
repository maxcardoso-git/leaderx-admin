'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { PaletteIcon, CheckIcon } from '@/components/icons';

// Theme color palette
const colorPalette = {
  primary: [
    { name: 'Gold', value: '#c4a45a', variable: '--color-gold' },
    { name: 'Gold Light', value: '#d4af37', variable: '--color-gold-light' },
    { name: 'Gold Dark', value: '#9c8347', variable: '--color-gold-dark' },
  ],
  backgrounds: [
    { name: 'Background', value: '#f8f9fa', variable: '--color-background' },
    { name: 'Card', value: '#ffffff', variable: '--color-background-card' },
    { name: 'Hover', value: '#f3f4f6', variable: '--color-background-hover' },
  ],
  text: [
    { name: 'Primary', value: '#111827', variable: '--color-text-primary' },
    { name: 'Secondary', value: '#4b5563', variable: '--color-text-secondary' },
    { name: 'Muted', value: '#9ca3af', variable: '--color-text-muted' },
  ],
  status: [
    { name: 'Success', value: '#10b981', variable: '--color-success' },
    { name: 'Warning', value: '#f59e0b', variable: '--color-warning' },
    { name: 'Error', value: '#ef4444', variable: '--color-error' },
    { name: 'Info', value: '#3b82f6', variable: '--color-info' },
  ],
  borders: [
    { name: 'Border', value: '#e5e7eb', variable: '--color-border' },
    { name: 'Border Light', value: '#f3f4f6', variable: '--color-border-light' },
    { name: 'Border Dark', value: '#d1d5db', variable: '--color-border-dark' },
  ],
};

function ColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-sm font-medium text-text-primary">{name}</p>
        <p className="text-xs text-text-muted font-mono">{color}</p>
      </div>
    </div>
  );
}

function ColorSection({ title, colors }: { title: string; colors: typeof colorPalette.primary }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-text-primary mb-4">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color) => (
          <ColorSwatch key={color.variable} color={color.value} name={color.name} />
        ))}
      </div>
    </div>
  );
}

export default function AppearanceSettingsPage() {
  const t = useTranslations('settings');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {t('appearance')}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {t('appearanceSubtitle')}
        </p>
      </div>

      {/* Theme Info Card */}
      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gold/10">
            <PaletteIcon size={24} className="text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Tema LeaderX Premium
            </h3>
            <p className="text-sm text-text-secondary">
              Design system moderno com cores claras e detalhes dourados.
              O tema é aplicado automaticamente em toda a aplicação.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                <CheckIcon size={12} />
                Ativo
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Color Palette */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Paleta de Cores
        </h3>

        <div className="space-y-8">
          <ColorSection title="Cores Primárias (Gold)" colors={colorPalette.primary} />
          <ColorSection title="Fundos" colors={colorPalette.backgrounds} />
          <ColorSection title="Texto" colors={colorPalette.text} />
          <ColorSection title="Status" colors={colorPalette.status} />
          <ColorSection title="Bordas" colors={colorPalette.borders} />
        </div>
      </Card>

      {/* Component Preview */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Prévia de Componentes
        </h3>

        <div className="space-y-8">
          {/* Buttons */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Botões</h4>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-xl font-medium text-sm text-gray-900 shadow-gold transition-all hover:brightness-105 bg-gradient-to-r from-gold-gradient-start via-gold-gradient-mid to-gold-gradient-end">
                Primário
              </button>
              <button className="px-4 py-2 rounded-xl font-medium text-sm bg-white border border-border text-text-secondary hover:bg-background-hover transition-all">
                Secundário
              </button>
              <button className="px-4 py-2 rounded-xl font-medium text-sm bg-transparent border border-gold text-gold hover:bg-gold/5 transition-all">
                Outline
              </button>
              <button className="px-4 py-2 rounded-xl font-medium text-sm bg-transparent text-text-muted hover:bg-gray-100 transition-all">
                Ghost
              </button>
              <button className="px-4 py-2 rounded-xl font-medium text-sm bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all">
                Danger
              </button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Badges</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                Ativo
              </span>
              <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                Pendente
              </span>
              <span className="px-3 py-1 rounded-full bg-error/10 text-error text-xs font-medium">
                Inativo
              </span>
              <span className="px-3 py-1 rounded-full bg-info/10 text-info text-xs font-medium">
                Info
              </span>
              <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">
                Premium
              </span>
            </div>
          </div>

          {/* Form Elements */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Formulário</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Input de texto
                </label>
                <input
                  type="text"
                  placeholder="Digite algo..."
                  className="w-full h-10 px-4 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:ring-2 focus:ring-gold/15 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Select
                </label>
                <select className="w-full h-10 px-4 bg-white border border-border rounded-xl text-sm text-text-primary focus:border-gold focus:ring-2 focus:ring-gold/15 focus:outline-none transition-all">
                  <option>Selecione uma opção</option>
                  <option>Opção 1</option>
                  <option>Opção 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Cards</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-border rounded-2xl shadow-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gold/10">
                    <span className="text-gold">📊</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Card Título</p>
                    <p className="text-xs text-text-muted">Subtítulo</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  Conteúdo do card com informações relevantes.
                </p>
              </div>
              <div className="p-4 bg-white border border-border rounded-2xl shadow-card hover:border-gold/30 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <span className="text-success">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Card Hover</p>
                    <p className="text-xs text-text-muted">Com efeito hover</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  Passe o mouse para ver o efeito.
                </p>
              </div>
              <div className="p-4 bg-white border border-border rounded-2xl shadow-card">
                <p className="text-sm text-text-muted mb-1">Estatística</p>
                <p className="text-3xl font-semibold text-text-primary">1,234</p>
                <p className="text-xs text-success mt-1">+12% este mês</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Tabela</h4>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-background">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Cargo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border-light hover:bg-background-hover">
                    <td className="px-4 py-3 text-sm text-text-primary">João Silva</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">Coordenador</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs">Ativo</span>
                    </td>
                  </tr>
                  <tr className="border-t border-border-light hover:bg-background-hover">
                    <td className="px-4 py-3 text-sm text-text-primary">Maria Santos</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">Líder</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-gold/10 text-gold text-xs">Premium</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
