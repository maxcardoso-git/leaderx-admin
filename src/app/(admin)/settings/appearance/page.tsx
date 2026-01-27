'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Button, Card, CardHeader } from '@/components/ui';
import { themeService } from '@/services/theme.service';
import type { editor } from 'monaco-editor';

// Dynamic import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-[500px] bg-background-alt animate-pulse rounded-lg" /> }
);

const DEFAULT_CSS = `:root {
  --bg-color: #0d1117;
  --gold: #c4a45a;
  --gold-rgb: 196, 164, 90;
  --text-main: #ffffff;
  --text-muted: #a0a0a0;
  --pill-bg: rgba(255, 255, 255, 0.05);
  --pill-border: #333333;
  --card-bg: rgba(255, 255, 255, 0.03);
  --card-border: rgba(255, 255, 255, 0.08);
  --input-bg: rgba(255, 255, 255, 0.04);
  --input-border: rgba(255, 255, 255, 0.1);
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
}

/* Logo */
.logo-text {
  font-size: 2.5rem;
  letter-spacing: 2px;
  margin-bottom: 0;
  text-transform: uppercase;
}
.logo-text span { color: var(--gold); }
.tagline {
  color: var(--gold);
  font-size: 0.8rem;
  margin-top: -5px;
  letter-spacing: 1px;
}

/* Main Title */
.main-title {
  font-size: 4rem;
  font-weight: 600;
  margin: 40px 0;
  line-height: 1.1;
}

.italic-gold {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: var(--gold);
  font-weight: 400;
}

/* Description */
.description {
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 50px auto;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 12px 30px;
  border: 1px solid var(--pill-border);
  border-radius: 50px;
  background-color: var(--pill-bg);
  font-size: 0.9rem;
  color: #ddd;
}

.dot {
  height: 8px;
  width: 8px;
  background-color: var(--gold);
  border-radius: 50px;
  margin-right: 12px;
  box-shadow: 0 0 8px var(--gold);
}

.status-pill strong {
  margin-left: 5px;
  color: #fff;
}

/* ===== UI COMPONENTS ===== */

/* Section Titles */
.preview-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--card-border);
}

/* Headings */
.preview-h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.preview-h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.preview-h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

/* Cards */
.preview-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
}

.preview-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.preview-card-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.preview-card-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.preview-stat {
  text-align: center;
}

.preview-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gold);
}

.preview-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Buttons */
.preview-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.preview-btn-primary {
  background: var(--gold);
  color: #000;
}

.preview-btn-primary:hover {
  opacity: 0.9;
}

.preview-btn-secondary {
  background: var(--pill-bg);
  border: 1px solid var(--pill-border);
  color: var(--text-main);
}

.preview-btn-outline {
  background: transparent;
  border: 1px solid var(--gold);
  color: var(--gold);
}

.preview-btn-ghost {
  background: transparent;
  color: var(--text-muted);
}

.preview-btn-ghost:hover {
  color: var(--text-main);
  background: var(--pill-bg);
}

/* Inputs */
.preview-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.875rem;
}

.preview-input:focus {
  outline: none;
  border-color: var(--gold);
}

.preview-input::placeholder {
  color: var(--text-muted);
}

.preview-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 8px;
}

/* Badges */
.preview-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.preview-badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
}

.preview-badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--error);
}

.preview-badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.preview-badge-gold {
  background: rgba(196, 164, 90, 0.15);
  color: var(--gold);
}

/* Table */
.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid var(--card-border);
}

.preview-table th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
}

.preview-table td {
  font-size: 0.875rem;
  color: var(--text-main);
}

.preview-table tr:hover td {
  background: var(--pill-bg);
}`;

interface CSSValidationError {
  line: number;
  message: string;
}

export default function AppearanceSettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<CSSValidationError[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchNotFound, setSearchNotFound] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Find CSS selector in editor and highlight it
  const findCSSSelector = useCallback((selector: string) => {
    if (!editorRef.current) {
      console.log('Editor ref not available');
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      console.log('Model not available');
      return;
    }

    // Clear previous not found message
    setSearchNotFound(null);

    // Try multiple search strategies
    const searchStrategies = [
      selector,                                    // Exact: .main-title
      selector.replace(/^\./, ''),                // Without dot: main-title
      selector.replace(/[.#]/g, ''),              // Without . and #: main-title
      selector.split('-')[0],                      // First part: main
    ];

    for (const searchText of searchStrategies) {
      if (!searchText) continue;

      const matches = model.findMatches(searchText, false, false, false, null, false);

      if (matches.length > 0) {
        const match = matches[0];
        // Scroll to the line and highlight
        editorRef.current.revealLineInCenter(match.range.startLineNumber);
        editorRef.current.setSelection(match.range);
        editorRef.current.focus();
        return;
      }
    }

    // If nothing found, show message
    setSearchNotFound(selector);
    setTimeout(() => setSearchNotFound(null), 3000);
  }, []);

  // Handle editor mount
  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    setIsLoading(true);
    try {
      const theme = await themeService.getTheme();
      if (theme?.css) {
        setCssCode(theme.css);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      // Use default CSS
    } finally {
      setIsLoading(false);
    }
  };

  // Validate CSS
  const validateCSS = useCallback((css: string): CSSValidationError[] => {
    const validationErrors: CSSValidationError[] = [];

    // Basic CSS validation
    const lines = css.split('\n');
    let braceCount = 0;
    let inComment = false;

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Track multi-line comments
      if (line.includes('/*')) inComment = true;
      if (line.includes('*/')) inComment = false;
      if (inComment) return;

      // Count braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;

      // Check for common errors
      if (line.includes(';;')) {
        validationErrors.push({ line: lineNum, message: 'Double semicolon detected' });
      }

      // Check for property without value
      const propertyMatch = line.match(/^\s*([a-z-]+)\s*:\s*$/);
      if (propertyMatch) {
        validationErrors.push({ line: lineNum, message: `Property "${propertyMatch[1]}" has no value` });
      }
    });

    if (braceCount !== 0) {
      validationErrors.push({
        line: lines.length,
        message: braceCount > 0 ? 'Missing closing brace }' : 'Extra closing brace }'
      });
    }

    return validationErrors;
  }, []);

  // Handle CSS change
  const handleCSSChange = useCallback((value: string | undefined) => {
    const newCSS = value || '';
    setCssCode(newCSS);

    // Validate
    const validationErrors = validateCSS(newCSS);
    setErrors(validationErrors);

    // Update preview
    setPreviewKey((prev) => prev + 1);
  }, [validateCSS]);

  // Save theme
  const handleSave = async () => {
    if (errors.length > 0) {
      return;
    }

    setIsSaving(true);
    setSuccess(null);

    try {
      await themeService.saveTheme({ css: cssCode });
      setSuccess(t('themeSaved'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    setCssCode(DEFAULT_CSS);
    setErrors([]);
    setPreviewKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-background-hover rounded animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-[600px] bg-background-hover rounded animate-pulse" />
          <div className="h-[600px] bg-background-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            {t('appearance')}
          </h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>
            {t('appearanceSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleReset}>
            {t('resetDefault')}
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={errors.length > 0}
          >
            {tCommon('save')}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
          {success}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          <p className="font-semibold mb-2">{t('cssErrors')}:</p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, index) => (
              <li key={index}>
                {t('line')} {err.line}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Search Not Found Message */}
      {searchNotFound && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
          Seletor <code className="bg-warning/20 px-1 rounded">{searchNotFound}</code> não encontrado no CSS.
          Adicione a classe ao seu CSS para personalizar este elemento.
        </div>
      )}

      {/* Editor and Preview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* CSS Editor */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              {t('cssEditor')}
            </h3>
            <p className="text-sm text-text-muted mt-1">
              {t('cssEditorHint')}
            </p>
          </div>
          <div className="h-[500px]">
            <MonacoEditor
              height="100%"
              defaultLanguage="css"
              value={cssCode}
              onChange={handleCSSChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                padding: { top: 16 },
              }}
            />
          </div>
        </Card>

        {/* Live Preview */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              {t('livePreview')}
            </h3>
            <p className="text-sm text-text-muted mt-1">
              {t('livePreviewHint')}
            </p>
          </div>
          <div className="h-[500px] overflow-auto">
            <StylePreview key={previewKey} css={cssCode} onSelectCSS={findCSSSelector} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// Clickable preview element wrapper
function ClickableElement({
  selector,
  children,
  className,
  style,
  as: tag = 'div',
  onSelect,
}: {
  selector: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
  onSelect: (selector: string) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(selector);
  };

  const combinedClassName = `${className || ''} cursor-pointer hover:outline hover:outline-2 hover:outline-gold/50 hover:outline-offset-2 transition-all`;

  // Use React.createElement to avoid TypeScript issues with dynamic JSX tags
  return React.createElement(
    tag,
    {
      className: combinedClassName,
      style,
      onClick: handleClick,
      title: `Clique para localizar: ${selector}`,
    },
    children
  );
}

// Preview Component - Simulates actual admin panel structure
function StylePreview({ css, onSelectCSS }: { css: string; onSelectCSS: (selector: string) => void }) {
  // Scope CSS to preview container
  const scopedCSS = css
    .replace(/\bbody\s*\{/g, '.preview-scope {')
    .replace(/\bmain\s*(?=\{|\s*\.|\s*\[)/g, '.preview-scope main ');

  // Helper for clickable elements
  const Clickable = ({ selector, children, className = '', style, tag = 'div' }: {
    selector: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    tag?: keyof React.JSX.IntrinsicElements;
  }) => (
    <ClickableElement selector={selector} className={className} style={style} as={tag} onSelect={onSelectCSS}>
      {children}
    </ClickableElement>
  );

  return (
    <div className="relative h-full preview-scope">
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />

      {/* Main content area - mimics admin layout */}
      <Clickable selector="main" className="p-6 min-h-full" tag="main">

        {/* Page Header */}
        <div className="mb-6">
          <Clickable selector="main h1" className="text-2xl font-semibold text-gray-900 mb-2" tag="h1">
            Página de Exemplo
          </Clickable>
          <Clickable selector="main p" className="text-sm text-gray-500" tag="p">
            Subtítulo descritivo da página
          </Clickable>
        </div>

        {/* Grid of Cards - mimics dashboard */}
        <Clickable selector=".grid" className="grid grid-cols-2 gap-4 mb-6">
          {/* Stat Card 1 */}
          <Clickable selector="div[class*='rounded']" className="rounded-xl bg-white border border-gray-200 p-4">
            <Clickable selector=".text-xs" className="text-xs text-gray-500 mb-1">
              Total de Usuários
            </Clickable>
            <Clickable selector=".text-3xl" className="text-3xl font-bold text-gray-900">
              1,234
            </Clickable>
            <Clickable selector=".text-green-500" className="text-xs text-green-500 mt-1">
              +12% este mês
            </Clickable>
          </Clickable>

          {/* Stat Card 2 */}
          <Clickable selector="div[class*='rounded']" className="rounded-xl bg-white border border-gray-200 p-4">
            <Clickable selector=".text-xs" className="text-xs text-gray-500 mb-1">
              Estruturas Ativas
            </Clickable>
            <Clickable selector=".text-3xl" className="text-3xl font-bold text-gray-900">
              56
            </Clickable>
            <Clickable selector=".text-gold" className="text-xs text-gold mt-1">
              5 pendentes
            </Clickable>
          </Clickable>
        </Clickable>

        {/* Module Cards Grid */}
        <Clickable selector="main h2" className="text-lg font-semibold text-gray-900 mb-4" tag="h2">
          Módulos
        </Clickable>

        <Clickable selector=".grid" className="grid grid-cols-2 gap-4 mb-6">
          {/* Module Card */}
          <Clickable selector="div[class*='rounded-2xl']" className="rounded-2xl bg-white border border-gray-200 p-5 hover:border-gold/50 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <Clickable selector=".bg-gold" className="p-2 rounded-lg bg-gold/10">
                <span className="text-gold text-lg">👥</span>
              </Clickable>
              <div>
                <Clickable selector=".font-semibold" className="font-semibold text-gray-900">
                  Identidade
                </Clickable>
                <Clickable selector=".text-sm" className="text-sm text-gray-500">
                  Gerenciar usuários
                </Clickable>
              </div>
            </div>
            <Clickable selector=".border-t" className="pt-3 border-t border-gray-100 flex gap-4">
              <span className="text-sm"><strong className="text-gray-900">42</strong> <span className="text-gray-500">usuários</span></span>
              <span className="text-sm"><strong className="text-gray-900">3</strong> <span className="text-gray-500">funções</span></span>
            </Clickable>
          </Clickable>

          {/* Module Card 2 */}
          <Clickable selector="div[class*='rounded-2xl']" className="rounded-2xl bg-white border border-gray-200 p-5 hover:border-gold/50 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <Clickable selector=".bg-gold" className="p-2 rounded-lg bg-gold/10">
                <span className="text-gold text-lg">🏢</span>
              </Clickable>
              <div>
                <Clickable selector=".font-semibold" className="font-semibold text-gray-900">
                  Rede
                </Clickable>
                <Clickable selector=".text-sm" className="text-sm text-gray-500">
                  Estruturas organizacionais
                </Clickable>
              </div>
            </div>
            <Clickable selector=".border-t" className="pt-3 border-t border-gray-100 flex gap-4">
              <span className="text-sm"><strong className="text-gray-900">12</strong> <span className="text-gray-500">estruturas</span></span>
              <span className="text-sm"><strong className="text-gray-900">5</strong> <span className="text-gray-500">tipos</span></span>
            </Clickable>
          </Clickable>
        </Clickable>

        {/* Quick Actions */}
        <Clickable selector="main h2" className="text-lg font-semibold text-gray-900 mb-4" tag="h2">
          Ações Rápidas
        </Clickable>

        <div className="space-y-3 mb-6">
          <Clickable selector="div[class*='rounded-xl']" className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <Clickable selector=".bg-blue-500" className="p-3 rounded-xl bg-blue-500/20">
              <span className="text-blue-500">➕</span>
            </Clickable>
            <div className="flex-1">
              <Clickable selector=".font-medium" className="font-medium text-gray-900">
                Adicionar Usuário
              </Clickable>
              <Clickable selector=".text-gray-500" className="text-sm text-gray-500">
                Criar novo membro
              </Clickable>
            </div>
            <span className="text-gray-400">→</span>
          </Clickable>

          <Clickable selector="div[class*='rounded-xl']" className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <Clickable selector=".bg-green-500" className="p-3 rounded-xl bg-green-500/20">
              <span className="text-green-500">🏗️</span>
            </Clickable>
            <div className="flex-1">
              <Clickable selector=".font-medium" className="font-medium text-gray-900">
                Nova Estrutura
              </Clickable>
              <Clickable selector=".text-gray-500" className="text-sm text-gray-500">
                Criar estrutura organizacional
              </Clickable>
            </div>
            <span className="text-gray-400">→</span>
          </Clickable>
        </div>

        {/* Buttons */}
        <Clickable selector="main h2" className="text-lg font-semibold text-gray-900 mb-4" tag="h2">
          Botões
        </Clickable>

        <div className="flex flex-wrap gap-3 mb-6">
          <Clickable selector="button[class*='bg-gold']" className="px-4 py-2 rounded-lg font-medium transition-colors text-white" style={{ background: 'linear-gradient(135deg, #d4af37, #c4a45a)' }} tag="button">
            + Adicionar Usuário
          </Clickable>
          <Clickable selector="button[class*='border']" className="px-4 py-2 rounded-lg bg-transparent border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors" tag="button">
            Mais Filtros
          </Clickable>
          <Clickable selector="button[class*='ghost']" className="px-4 py-2 rounded-lg bg-transparent text-gray-500 font-medium hover:bg-gray-100 transition-colors" tag="button">
            Cancelar
          </Clickable>
        </div>

        {/* Badges */}
        <Clickable selector="main h2" className="text-lg font-semibold text-gray-900 mb-4" tag="h2">
          Badges / Status
        </Clickable>

        <div className="flex flex-wrap gap-2 mb-6">
          <Clickable selector=".bg-green-500" className="px-3 py-1 rounded-full bg-green-500/15 text-green-500 text-xs font-medium" tag="span">
            Ativo
          </Clickable>
          <Clickable selector=".bg-red-500" className="px-3 py-1 rounded-full bg-red-500/15 text-red-500 text-xs font-medium" tag="span">
            Inativo
          </Clickable>
          <Clickable selector=".bg-yellow-500" className="px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-500 text-xs font-medium" tag="span">
            Pendente
          </Clickable>
          <Clickable selector=".bg-gold" className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-medium" tag="span">
            Premium
          </Clickable>
        </div>

        {/* Form Inputs */}
        <Clickable selector="main h2" className="text-lg font-semibold text-gray-900 mb-4" tag="h2">
          Formulário
        </Clickable>

        <div className="space-y-4 mb-6">
          <div>
            <Clickable selector="label" className="block text-sm font-medium text-gray-900 mb-2" tag="label">
              Nome
            </Clickable>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 cursor-pointer hover:outline hover:outline-2 hover:outline-gold/50"
              placeholder="Digite seu nome..."
              readOnly
              onClick={() => onSelectCSS('input')}
              title="Clique para localizar: input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Categoria</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 cursor-pointer hover:outline hover:outline-2 hover:outline-gold/50"
              onClick={() => onSelectCSS('select')}
              title="Clique para localizar: select"
            >
              <option>Selecione uma opção</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Clickable selector="main h2" className="text-lg font-semibold text-gray-900 mb-4" tag="h2">
          Tabela
        </Clickable>

        <Clickable selector="table" className="w-full rounded-xl overflow-hidden border border-gray-200" tag="div">
          <table className="w-full" onClick={(e) => { e.stopPropagation(); onSelectCSS('table'); }}>
            <thead>
              <tr className="bg-gray-50">
                <Clickable selector="th" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase" tag="th">
                  Nome
                </Clickable>
                <Clickable selector="th" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase" tag="th">
                  Cargo
                </Clickable>
                <Clickable selector="th" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase" tag="th">
                  Status
                </Clickable>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-t border-gray-100 hover:bg-gray-50">
                <Clickable selector="td" className="px-4 py-3 text-sm text-gray-900" tag="td">
                  João Silva
                </Clickable>
                <Clickable selector="td" className="px-4 py-3 text-sm text-gray-500" tag="td">
                  Coordenador
                </Clickable>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-500 text-xs">Ativo</span>
                </td>
              </tr>
              <tr className="border-t border-gray-100 hover:bg-gray-50">
                <Clickable selector="td" className="px-4 py-3 text-sm text-gray-900" tag="td">
                  Maria Santos
                </Clickable>
                <Clickable selector="td" className="px-4 py-3 text-sm text-gray-500" tag="td">
                  Líder
                </Clickable>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-gold/15 text-gold text-xs">Premium</span>
                </td>
              </tr>
            </tbody>
          </table>
        </Clickable>
      </Clickable>
    </div>
  );
}
