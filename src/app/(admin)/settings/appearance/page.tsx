'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [previewKey, setPreviewKey] = useState(0);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Find CSS selector in editor and highlight it
  const findCSSSelector = useCallback((selector: string) => {
    if (!editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    // Search for the selector in the CSS code
    const searchText = selector.includes('{') ? selector : `${selector}`;
    const matches = model.findMatches(searchText, false, false, false, null, false);

    if (matches.length > 0) {
      const match = matches[0];
      // Scroll to the line and highlight
      editorRef.current.revealLineInCenter(match.range.startLineNumber);
      editorRef.current.setSelection(match.range);
      editorRef.current.focus();
    } else {
      // Try searching for just the class/selector name without special characters
      const simplifiedSelector = selector.replace(/[.#\[\]]/g, '');
      const simpleMatches = model.findMatches(simplifiedSelector, false, false, false, null, false);
      if (simpleMatches.length > 0) {
        const match = simpleMatches[0];
        editorRef.current.revealLineInCenter(match.range.startLineNumber);
        editorRef.current.setSelection(match.range);
        editorRef.current.focus();
      }
    }
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
  as: Component = 'div',
  onSelect,
}: {
  selector: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
  onSelect: (selector: string) => void;
}) {
  return (
    <Component
      className={`${className || ''} cursor-pointer hover:outline hover:outline-2 hover:outline-gold/50 hover:outline-offset-2 transition-all`}
      style={style}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(selector);
      }}
      title={`Clique para localizar: ${selector}`}
    >
      {children}
    </Component>
  );
}

// Preview Component
function StylePreview({ css, onSelectCSS }: { css: string; onSelectCSS: (selector: string) => void }) {
  // Scope all CSS selectors to the preview container to avoid conflicts
  const scopedCSS = css
    // Scope body selector to preview
    .replace(/\bbody\s*\{/g, '.preview-scope {')
    // Scope main selector to preview
    .replace(/\bmain\s*\{/g, '.preview-scope main {');

  return (
    <div className="relative h-full preview-scope">
      {/* Inject custom CSS with scoped selectors */}
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />

      {/* Preview Container - wraps content in main element */}
      <main
        className="p-6 min-h-full"
        style={{ backgroundColor: 'var(--bg-color, #0d1117)' }}
      >
        {/* Hero Section */}
        <div className="text-center mb-8 pb-8" style={{ borderBottom: '1px solid var(--card-border)' }}>
          {/* Logo */}
          <div className="logo mb-4">
            <ClickableElement selector=".logo-text" as="h2" className="logo-text" onSelect={onSelectCSS}>
              LEADER<span onClick={(e) => { e.stopPropagation(); onSelectCSS('.logo-text span'); }}>X</span>
            </ClickableElement>
            <ClickableElement selector=".tagline" as="p" className="tagline" onSelect={onSelectCSS}>
              exponential leadership
            </ClickableElement>
          </div>

          {/* Main Title */}
          <ClickableElement selector=".main-title" as="h1" className="main-title" style={{ fontSize: '2rem', margin: '16px 0' }} onSelect={onSelectCSS}>
            O Futuro da Liderança <br />
            <span className="italic-gold" onClick={(e) => { e.stopPropagation(); onSelectCSS('.italic-gold'); }}>está sendo reescrito.</span>
          </ClickableElement>

          {/* Status Pill */}
          <ClickableElement selector=".status-pill" className="status-pill" style={{ padding: '8px 20px', fontSize: '0.8rem' }} onSelect={onSelectCSS}>
            <span className="dot" onClick={(e) => { e.stopPropagation(); onSelectCSS('.dot'); }}></span>
            Em desenvolvimento por <strong>Hans Werner</strong>
          </ClickableElement>
        </div>

        {/* Headings Section */}
        <div className="mb-6">
          <ClickableElement selector=".preview-section-title" className="preview-section-title" onSelect={onSelectCSS}>
            Títulos
          </ClickableElement>
          <ClickableElement selector=".preview-h1" as="h1" className="preview-h1" onSelect={onSelectCSS}>
            Título Principal (H1)
          </ClickableElement>
          <ClickableElement selector=".preview-h2" as="h2" className="preview-h2" onSelect={onSelectCSS}>
            Título Secundário (H2)
          </ClickableElement>
          <ClickableElement selector=".preview-h3" as="h3" className="preview-h3" onSelect={onSelectCSS}>
            Título Terciário (H3)
          </ClickableElement>
        </div>

        {/* Cards Section */}
        <div className="mb-6">
          <ClickableElement selector=".preview-section-title" className="preview-section-title" onSelect={onSelectCSS}>
            Cards
          </ClickableElement>
          <ClickableElement selector=".preview-card" className="preview-card" onSelect={onSelectCSS}>
            <ClickableElement selector=".preview-card-title" className="preview-card-title" onSelect={onSelectCSS}>
              Card de Estatísticas
            </ClickableElement>
            <ClickableElement selector=".preview-card-text" className="preview-card-text" onSelect={onSelectCSS}>
              Visualize métricas importantes em tempo real.
            </ClickableElement>
            <ClickableElement selector=".preview-card-stats" className="preview-card-stats" onSelect={onSelectCSS}>
              <ClickableElement selector=".preview-stat" className="preview-stat" onSelect={onSelectCSS}>
                <ClickableElement selector=".preview-stat-value" className="preview-stat-value" onSelect={onSelectCSS}>
                  1,234
                </ClickableElement>
                <ClickableElement selector=".preview-stat-label" className="preview-stat-label" onSelect={onSelectCSS}>
                  Usuários
                </ClickableElement>
              </ClickableElement>
              <ClickableElement selector=".preview-stat" className="preview-stat" onSelect={onSelectCSS}>
                <ClickableElement selector=".preview-stat-value" className="preview-stat-value" onSelect={onSelectCSS}>
                  56
                </ClickableElement>
                <ClickableElement selector=".preview-stat-label" className="preview-stat-label" onSelect={onSelectCSS}>
                  Grupos
                </ClickableElement>
              </ClickableElement>
              <ClickableElement selector=".preview-stat" className="preview-stat" onSelect={onSelectCSS}>
                <ClickableElement selector=".preview-stat-value" className="preview-stat-value" onSelect={onSelectCSS}>
                  89%
                </ClickableElement>
                <ClickableElement selector=".preview-stat-label" className="preview-stat-label" onSelect={onSelectCSS}>
                  Engajamento
                </ClickableElement>
              </ClickableElement>
            </ClickableElement>
          </ClickableElement>
        </div>

        {/* Buttons Section */}
        <div className="mb-6">
          <ClickableElement selector=".preview-section-title" className="preview-section-title" onSelect={onSelectCSS}>
            Botões
          </ClickableElement>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ClickableElement selector=".preview-btn-primary" as="button" className="preview-btn preview-btn-primary" onSelect={onSelectCSS}>
              Primário
            </ClickableElement>
            <ClickableElement selector=".preview-btn-secondary" as="button" className="preview-btn preview-btn-secondary" onSelect={onSelectCSS}>
              Secundário
            </ClickableElement>
            <ClickableElement selector=".preview-btn-outline" as="button" className="preview-btn preview-btn-outline" onSelect={onSelectCSS}>
              Outline
            </ClickableElement>
            <ClickableElement selector=".preview-btn-ghost" as="button" className="preview-btn preview-btn-ghost" onSelect={onSelectCSS}>
              Ghost
            </ClickableElement>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-6">
          <ClickableElement selector=".preview-section-title" className="preview-section-title" onSelect={onSelectCSS}>
            Badges / Status
          </ClickableElement>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <ClickableElement selector=".preview-badge-success" as="span" className="preview-badge preview-badge-success" onSelect={onSelectCSS}>
              Ativo
            </ClickableElement>
            <ClickableElement selector=".preview-badge-error" as="span" className="preview-badge preview-badge-error" onSelect={onSelectCSS}>
              Inativo
            </ClickableElement>
            <ClickableElement selector=".preview-badge-warning" as="span" className="preview-badge preview-badge-warning" onSelect={onSelectCSS}>
              Pendente
            </ClickableElement>
            <ClickableElement selector=".preview-badge-gold" as="span" className="preview-badge preview-badge-gold" onSelect={onSelectCSS}>
              Premium
            </ClickableElement>
          </div>
        </div>

        {/* Form Inputs Section */}
        <div className="mb-6">
          <ClickableElement selector=".preview-section-title" className="preview-section-title" onSelect={onSelectCSS}>
            Formulário
          </ClickableElement>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <ClickableElement selector=".preview-label" as="label" className="preview-label" onSelect={onSelectCSS}>
                Nome
              </ClickableElement>
              <input
                type="text"
                className="preview-input cursor-pointer hover:outline hover:outline-2 hover:outline-gold/50"
                placeholder="Digite seu nome..."
                onClick={() => onSelectCSS('.preview-input')}
                title="Clique para localizar: .preview-input"
                readOnly
              />
            </div>
            <div>
              <ClickableElement selector=".preview-label" as="label" className="preview-label" onSelect={onSelectCSS}>
                Email
              </ClickableElement>
              <input
                type="email"
                className="preview-input cursor-pointer hover:outline hover:outline-2 hover:outline-gold/50"
                placeholder="exemplo@email.com"
                onClick={() => onSelectCSS('.preview-input')}
                title="Clique para localizar: .preview-input"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mb-6">
          <ClickableElement selector=".preview-section-title" className="preview-section-title" onSelect={onSelectCSS}>
            Tabela
          </ClickableElement>
          <table
            className="preview-table cursor-pointer hover:outline hover:outline-2 hover:outline-gold/50"
            onClick={() => onSelectCSS('.preview-table')}
            title="Clique para localizar: .preview-table"
          >
            <thead>
              <tr>
                <th onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table th'); }}>Nome</th>
                <th onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table th'); }}>Cargo</th>
                <th onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table th'); }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>João Silva</td>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>Coordenador</td>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>
                  <span className="preview-badge preview-badge-success">Ativo</span>
                </td>
              </tr>
              <tr>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>Maria Santos</td>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>Líder</td>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>
                  <span className="preview-badge preview-badge-gold">Premium</span>
                </td>
              </tr>
              <tr>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>Pedro Oliveira</td>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>Membro</td>
                <td onClick={(e) => { e.stopPropagation(); onSelectCSS('.preview-table td'); }}>
                  <span className="preview-badge preview-badge-warning">Pendente</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
