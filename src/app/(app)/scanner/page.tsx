'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { validateImageFile } from '@/lib/utils/validation';
import type { ReceiptAnalysis } from '@/types';

const SCAN_LIMIT = 5;
const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
};

export default function ScannerPage() {
  const { userData } = useUserStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReceiptAnalysis | null>(null);
  const [scansUsed, setScansUsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isGuest = userData?.isAnonymous ?? true;

  const handleFile = useCallback((f: File) => {
    const err = validateImageFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setFile(f);
    setAnalysis(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleAnalyze = useCallback(async () => {
    if (!file || !userData?.uid || isGuest) return;
    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('uid', userData.uid);

      const res = await fetch('/api/scanner', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 429) {
        setError('Daily scan limit reached (5/day). Try again tomorrow!');
        return;
      }

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        setError(data.error ?? 'Analysis failed');
        return;
      }

      const data = (await res.json()) as { analysis: ReceiptAnalysis };
      setAnalysis(data.analysis);
      setScansUsed((prev) => prev + 1);
    } catch {
      setError('Scanner temporarily unavailable. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [file, userData, isGuest]);

  const gradeColor = analysis
    ? (GRADE_COLORS[analysis.overallScore] ?? '#64748b')
    : '#64748b';

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold mb-1">Receipt Scanner</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Upload a grocery or shopping bill to get an AI carbon analysis
        </p>
      </header>

      {/* Guest lock */}
      {isGuest && (
        <div
          className="p-5 rounded-xl text-center"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
          role="note"
        >
          <p className="font-semibold mb-1">🔒 Sign in to use the Receipt Scanner</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Scanner requires an account to save results and track improvements.
          </p>
        </div>
      )}

      {/* Rate limit indicator */}
      {!isGuest && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <ScanLine
            className="w-4 h-4"
            aria-hidden="true"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <span style={{ color: 'var(--color-text-muted)' }}>
            {scansUsed}/{SCAN_LIMIT} scans used today
          </span>
        </div>
      )}

      {/* Upload area */}
      <div
        className="relative border-2 border-dashed rounded-xl transition-all"
        style={{ borderColor: 'var(--color-border)' }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <label
          htmlFor="receipt-upload"
          className="flex flex-col items-center justify-center p-10 cursor-pointer gap-3"
          aria-label="Upload receipt image"
        >
          {preview ? (
            <div
              className="relative w-full max-w-xs mx-auto"
              style={{ aspectRatio: '3/4' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.1)' }}
                aria-hidden="true"
              >
                <Upload
                  className="w-7 h-7"
                  style={{ color: 'var(--color-forest-light)' }}
                />
              </div>
              <div className="text-center">
                <p className="font-semibold">Drop your receipt here</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  or click to browse — JPEG, PNG, WebP (max 5 MB)
                </p>
              </div>
            </>
          )}
        </label>
        <input
          id="receipt-upload"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={isGuest}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Analyze button */}
      {file && !isGuest && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          style={{
            background: analyzing
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, var(--color-forest), var(--color-forest-dark))',
            color: 'white',
          }}
          aria-label="Analyze receipt with AI"
          aria-busy={analyzing}
        >
          {analyzing ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" aria-hidden="true" />
              Analyzing your receipt with AI...
            </>
          ) : (
            <>
              <ScanLine className="w-5 h-5" aria-hidden="true" />
              Analyze Receipt
            </>
          )}
        </button>
      )}

      {/* Results */}
      {analysis && (
        <section aria-labelledby="results-heading" className="space-y-5">
          <h2 id="results-heading" className="font-bold text-lg">
            Analysis Results
          </h2>

          {/* Overall grade */}
          <div
            className="glass-card p-6 flex items-center gap-4"
            style={{ borderColor: `${gradeColor}30` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl"
              style={{ background: `${gradeColor}18`, color: gradeColor }}
              aria-label={`Overall grade: ${analysis.overallScore}`}
            >
              {analysis.overallScore}
            </div>
            <div>
              <p className="font-bold text-lg">Overall Carbon Grade</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Based on {analysis.items.length} items analyzed
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ScanLine className="w-4 h-4" aria-hidden="true" />
              Items Detected
            </h3>
            <div className="space-y-2">
              {analysis.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {item.reasoning}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium ml-3 shrink-0"
                    style={{
                      background:
                        item.carbonImpact === 'high'
                          ? 'rgba(239,68,68,0.15)'
                          : item.carbonImpact === 'medium'
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(34,197,94,0.15)',
                      color:
                        item.carbonImpact === 'high'
                          ? '#ef4444'
                          : item.carbonImpact === 'medium'
                            ? '#f59e0b'
                            : '#22c55e',
                    }}
                  >
                    {item.carbonImpact} impact
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Swap suggestions */}
          {analysis.swapSuggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                Better Swaps
              </h3>
              <div className="space-y-3">
                {analysis.swapSuggestions.map((swap, i) => (
                  <div key={i} className="glass-card p-4 space-y-1">
                    <div className="flex gap-2 text-sm">
                      <span
                        className="line-through"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {swap.instead}
                      </span>
                      <span aria-hidden="true">→</span>
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--color-forest-light)' }}
                      >
                        {swap.try}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Saves: {swap.co2Reduction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positives */}
          {analysis.positives.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: '#22c55e' }}
                  aria-hidden="true"
                />
                What You Did Well
              </h3>
              <ul className="space-y-2">
                {analysis.positives.map((pos, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span style={{ color: '#22c55e' }} aria-hidden="true">
                      ✓
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
