import { RiskFlags, ClaimAnalysis, PossibleIssuesDetected } from '../types';

export const SENSATIONAL_PATTERNS = [
  'breaking',
  'shocking',
  'share before deleted',
  'share before it is deleted',
  'share before its deleted',
];

export const ABSOLUTE_STATEMENT_PATTERNS = [
  'cures all',
  'cure for all',
  '100%',
  'always',
  'never',
  'everyone',
  'every single',
  'eliminate all',
  'eliminates all',
  'miracle cure',
  'guaranteed',
  'proven completely',
  'zero risk',
  'impossible to',
  'no one can',
  'completely eradicates',
  'all citizens must',
  'total ban on all',
  'all banks will',
  'eradicates cancer',
  'eradicates diabetes',
  'cures cancer',
  'cures diabetes',
  'eliminate all cash',
  'eliminates all cash',
];

export const EMOTIONAL_WORDING_PATTERNS = [
  'shocking',
  'breaking',
  'terrifying',
  'secret',
  'they don\'t want you to know',
  'furious',
  'danger',
  'disaster',
  'urgent',
  'crying',
  'horror',
  'panic',
  'betrayal',
  'evil',
  'outrage',
  'exposed',
  'devastating',
  'catastrophe',
  'corrupt',
  'beware',
  'warn everyone',
  'share before deleted',
  'nightmare',
  'deadly',
  'massive earthquake',
  'emergency quarantine',
];

export const DEFAULT_VERIFICATION_STEPS = [
  'Check the original source.',
  'Compare the claim with reliable sources.',
  'Check publication date.',
  'Look for missing context.',
  'AI does not make the final decision.',
];

export const AI_DECISION_NOTICE = 'AI does not make the final decision. Verification must be confirmed by human fact-checkers.';

/**
 * Evaluates detailed Claim Analysis:
 * - Possible issues detected:
 *   • Absolute statement
 *   • Emotional wording
 *   • Missing source
 * - Suggested verification steps:
 *   1. Check the original source.
 *   2. Compare the claim with reliable sources.
 *   3. Check publication date.
 *   4. Look for missing context.
 *   5. AI does not make the final decision.
 */
export function analyzeClaimIssues(text: string, sourceUrl?: string): ClaimAnalysis {
  const normalizedText = (text || '').toLowerCase();

  // 1. Detect Absolute statements
  const absoluteTerms: string[] = [];
  for (const pattern of ABSOLUTE_STATEMENT_PATTERNS) {
    if (normalizedText.includes(pattern)) {
      if (!absoluteTerms.includes(pattern)) {
        absoluteTerms.push(pattern);
      }
    }
  }
  const absoluteStatement = absoluteTerms.length > 0;

  // 2. Detect Emotional wording
  const emotionalTerms: string[] = [];
  for (const pattern of EMOTIONAL_WORDING_PATTERNS) {
    if (normalizedText.includes(pattern)) {
      if (!emotionalTerms.includes(pattern)) {
        emotionalTerms.push(pattern);
      }
    }
  }
  const emotionalWording = emotionalTerms.length > 0;

  // 3. Detect Missing source
  const cleanedUrl = (sourceUrl || '').trim();
  const hasValidUrl = cleanedUrl.length > 0 && 
    (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://') || 
     cleanedUrl.includes('.org') || cleanedUrl.includes('.com') || cleanedUrl.includes('.gov') || cleanedUrl.includes('.edu'));
  const missingSource = !hasValidUrl;

  const possibleIssues: PossibleIssuesDetected = {
    absoluteStatement,
    absoluteTerms,
    emotionalWording,
    emotionalTerms,
    missingSource,
  };

  return {
    possibleIssues,
    suggestedSteps: DEFAULT_VERIFICATION_STEPS,
    aiNotice: AI_DECISION_NOTICE,
  };
}

/**
 * Computes risk flags according to TruthLens civic tech heuristics:
 * 1. Sensational: Contains "breaking", "shocking", or "share before deleted"
 * 2. Shouting: > 50% uppercase alphabetic characters
 * 3. Unsourced: No valid source link provided
 * 4. High Risk: 2 or more flags triggered
 */
export function calculateRiskFlags(text: string, sourceUrl?: string): RiskFlags {
  const normalizedText = (text || '').toLowerCase();
  
  // 1. Sensational keyword detection
  const detectedKeywords: string[] = [];
  for (const pattern of SENSATIONAL_PATTERNS) {
    if (normalizedText.includes(pattern)) {
      if (!detectedKeywords.includes(pattern)) {
        detectedKeywords.push(pattern);
      }
    }
  }
  const sensational = detectedKeywords.length > 0;

  // 2. Shouting detection (>50% CAPS)
  const letters = (text || '').replace(/[^a-zA-Z]/g, '');
  const totalLetters = letters.length;
  let uppercaseLetters = 0;
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] >= 'A' && letters[i] <= 'Z') {
      uppercaseLetters++;
    }
  }

  const capsPercentage = totalLetters > 0 ? Math.round((uppercaseLetters / totalLetters) * 100) : 0;
  const shouting = totalLetters >= 6 && capsPercentage > 50;

  // 3. Unsourced detection
  const cleanedUrl = (sourceUrl || '').trim();
  const hasValidUrl = cleanedUrl.length > 0 && 
    (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://') || 
     cleanedUrl.includes('.org') || cleanedUrl.includes('.com') || cleanedUrl.includes('.gov') || cleanedUrl.includes('.edu'));
  const unsourced = !hasValidUrl;

  // Flag tally
  let flagCount = 0;
  if (sensational) flagCount++;
  if (shouting) flagCount++;
  if (unsourced) flagCount++;

  const isHighRisk = flagCount >= 2;

  // Compute built-in Claim Analysis
  const analysis = analyzeClaimIssues(text, sourceUrl);

  return {
    sensational,
    shouting,
    unsourced,
    detectedKeywords,
    capsPercentage,
    flagCount,
    isHighRisk,
    analysis,
  };
}

/**
 * Finds all occurrences of sensational keywords to highlight in display views
 */
export function extractSensationalMatches(text: string): { start: number; end: number; word: string }[] {
  const matches: { start: number; end: number; word: string }[] = [];
  const lowerText = text.toLowerCase();

  for (const pattern of SENSATIONAL_PATTERNS) {
    let index = 0;
    while ((index = lowerText.indexOf(pattern, index)) !== -1) {
      matches.push({
        start: index,
        end: index + pattern.length,
        word: text.slice(index, index + pattern.length),
      });
      index += pattern.length;
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}
