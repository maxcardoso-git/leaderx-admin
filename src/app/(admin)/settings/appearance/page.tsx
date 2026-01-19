'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Button, Card, CardHeader } from '@/components/ui';
import { themeService } from '@/services/theme.service';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            {t('appearance')}
          </h1>
          <p className="text-sm text-text-muted mt-1">
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
            <StylePreview key={previewKey} css={cssCode} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// Preview Component
function StylePreview({ css }: { css: string }) {
  return (
    <div className="relative h-full">
      {/* Inject custom CSS */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Preview Container */}
      <div
        className="hero-container p-8 min-h-full flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: 'var(--bg-color, #000)' }}
      >
        {/* Logo */}
        <div className="logo mb-8">
          <h2 className="logo-text">
            LEADER<span>X</span>
          </h2>
          <p className="tagline">exponential leadership</p>
        </div>

        {/* Main Title */}
        <h1 className="main-title">
          O Futuro da Liderança <br />
          <span className="italic-gold">está sendo reescrito.</span>
        </h1>

        {/* Description */}
        <p className="description">
          Estamos preparando uma nova experiência digital à altura da nossa comunidade global.
          Um ecossistema de alta performance desenhado para conectar o extraordinário.
        </p>

        {/* Status Pill */}
        <div className="status-pill">
          <span className="dot"></span>
          Nova plataforma em desenvolvimento por <strong>Hans Werner</strong>
        </div>
      </div>
    </div>
  );
}
