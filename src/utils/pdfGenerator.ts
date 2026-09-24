import { jsPDF } from 'jspdf';
import { Claim } from '../types';

export interface PdfExportOptions {
  title?: string;
  scopeLabel?: string;
  generatedBy?: string;
  filterDescription?: string;
  customNote?: string;
  includeExecutiveSummary?: boolean;
  includeAnalysis?: boolean;
  includeRiskFlags?: boolean;
  includeReviewerNotes?: boolean;
  includeEvidence?: boolean;
}

/**
 * Generates and triggers download of a PDF summary report for selected claims or filtered results.
 */
export async function generateClaimsPdfReport(
  claims: Claim[],
  options: PdfExportOptions = {}
): Promise<string> {
  const {
    title = 'TruthLens Misinformation & Claim Verification Summary Report',
    scopeLabel = `${claims.length} Claim${claims.length === 1 ? '' : 's'} Included`,
    generatedBy = 'TruthLens Civic Verification Desk',
    filterDescription,
    customNote,
    includeExecutiveSummary = true,
    includeAnalysis = true,
    includeRiskFlags = true,
    includeReviewerNotes = true,
    includeEvidence = true,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  const bottomMargin = 22; // reserved for footer

  let currentY = 16;

  // Helper to check page break
  const ensureSpace = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = 18;
    }
  };

  // ==========================================
  // 1. HEADER BANNER
  // ==========================================
  // Header background block
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent line
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 38, pageWidth, 1.5, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text('TRUTHLENS • CIVIC FACT-CHECKING & CLAIM TRIAGE DESK', marginX, 10);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(title, contentWidth - 40);
  doc.text(titleLines, marginX, 18);

  // Generation timestamp on top right
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Generated: ${dateFormatted}`, pageWidth - marginX, 12, { align: 'right' });
  doc.text(`Scope: ${scopeLabel}`, pageWidth - marginX, 18, { align: 'right' });
  doc.text(`Reporter: ${generatedBy}`, pageWidth - marginX, 24, { align: 'right' });

  currentY = 46;

  // Filter description note if provided
  if (filterDescription) {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, currentY, contentWidth, 9, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('ACTIVE FILTER / SEARCH CRITERIA:', marginX + 3, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const filterTextLines = doc.splitTextToSize(filterDescription, contentWidth - 65);
    doc.text(filterTextLines[0] || '', marginX + 56, currentY + 5.5);

    currentY += 13;
  }

  // Optional custom user note
  if (customNote && customNote.trim()) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(marginX, currentY, contentWidth, 10, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text('MEMORANDUM / NOTE:', marginX + 3, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    const noteLines = doc.splitTextToSize(customNote.trim(), contentWidth - 40);
    doc.text(noteLines[0] || '', marginX + 37, currentY + 6);

    currentY += 14;
  }

  // ==========================================
  // 2. EXECUTIVE METRICS SUMMARY
  // ==========================================
  if (includeExecutiveSummary && claims.length > 0) {
    ensureSpace(38);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Executive Verification Summary', marginX, currentY);
    currentY += 4.5;

    // Calculate metrics
    const totalCount = claims.length;
    const verifiedTrueCount = claims.filter((c) => c.status === 'Verified True').length;
    const verifiedFalseCount = claims.filter((c) => c.status === 'Verified False').length;
    const misleadingCount = claims.filter((c) => c.status === 'Misleading').length;
    const unverifiedCount = claims.filter((c) => c.status === 'Unverified').length;
    const highRiskCount = claims.filter((c) => c.flags.isHighRisk).length;

    // Stat boxes row (5 boxes)
    const boxGap = 2.5;
    const numBoxes = 5;
    const boxWidth = (contentWidth - boxGap * (numBoxes - 1)) / numBoxes;
    const boxHeight = 18;

    const stats = [
      {
        label: 'Total Sample',
        val: totalCount.toString(),
        sub: 'Claims in report',
        bg: [241, 245, 249],
        border: [203, 213, 225],
        text: [15, 23, 42],
      },
      {
        label: 'High Risk',
        val: highRiskCount.toString(),
        sub: `${Math.round((highRiskCount / totalCount) * 100)}% of sample`,
        bg: [254, 226, 226],
        border: [248, 113, 113],
        text: [185, 28, 28],
      },
      {
        label: 'Verified True',
        val: verifiedTrueCount.toString(),
        sub: `${Math.round((verifiedTrueCount / totalCount) * 100)}% verified`,
        bg: [209, 250, 229],
        border: [52, 211, 153],
        text: [4, 120, 87],
      },
      {
        label: 'False / Misleading',
        val: (verifiedFalseCount + misleadingCount).toString(),
        sub: `${verifiedFalseCount} False | ${misleadingCount} Debunked`,
        bg: [255, 237, 213],
        border: [251, 146, 60],
        text: [194, 65, 12],
      },
      {
        label: 'Pending Triage',
        val: unverifiedCount.toString(),
        sub: `${Math.round((unverifiedCount / totalCount) * 100)}% unverified`,
        bg: [224, 242, 254],
        border: [56, 189, 248],
        text: [3, 105, 161],
      },
    ];

    stats.forEach((item, idx) => {
      const boxX = marginX + idx * (boxWidth + boxGap);
      doc.setFillColor(item.bg[0], item.bg[1], item.bg[2]);
      doc.setDrawColor(item.border[0], item.border[1], item.border[2]);
      doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(item.label, boxX + 2.5, currentY + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(item.text[0], item.text[1], item.text[2]);
      doc.text(item.val, boxX + 2.5, currentY + 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.sub, boxX + 2.5, currentY + 15.5);
    });

    currentY += boxHeight + 7;
  }

  // ==========================================
  // 3. DETAILED CLAIMS DOSSIER
  // ==========================================
  ensureSpace(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Individual Claim Records (${claims.length} Records)`, marginX, currentY);
  currentY += 5;

  if (claims.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No claims matched the specified criteria for this report.', marginX, currentY);
    currentY += 10;
  }

  // Iterate over each claim
  claims.forEach((claim, index) => {
    // Estimate height needed for this claim block
    const textLines = doc.splitTextToSize(`"${claim.text}"`, contentWidth - 10);
    const estimatedHeight = 35 + textLines.length * 4.5 + (includeAnalysis ? 28 : 0) + (claim.reviewerNote ? 12 : 0);

    ensureSpace(Math.min(estimatedHeight, 80));

    const itemStartY = currentY;

    // Card background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(marginX, itemStartY, contentWidth, 6, 1.5, 1.5, 'F');

    // Header bar inside claim card
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(marginX, itemStartY, contentWidth, 7, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(marginX, itemStartY + 7, marginX + contentWidth, itemStartY + 7);

    // Number & platform & category
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`#${index + 1}. [${claim.platform.toUpperCase()}] • ${claim.category}`, marginX + 3, itemStartY + 4.8);

    // Submission date
    const subDate = new Date(claim.submittedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Submitted: ${subDate}`, marginX + 110, itemStartY + 4.8);

    // Status Badge
    let statusBg = [224, 242, 254];
    let statusText = [3, 105, 161];
    let statusLabel = claim.status.toUpperCase();

    if (claim.status === 'Verified True') {
      statusBg = [209, 250, 229];
      statusText = [4, 120, 87];
      statusLabel = 'VERIFIED TRUE';
    } else if (claim.status === 'Verified False') {
      statusBg = [254, 226, 226];
      statusText = [185, 28, 28];
      statusLabel = 'VERIFIED FALSE';
    } else if (claim.status === 'Misleading') {
      statusBg = [254, 243, 199];
      statusText = [180, 83, 9];
      statusLabel = 'MISLEADING';
    }

    const badgeWidth = 26;
    const badgeX = marginX + contentWidth - badgeWidth - 2;
    doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
    doc.roundedRect(badgeX, itemStartY + 1.2, badgeWidth, 4.6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(statusText[0], statusText[1], statusText[2]);
    doc.text(statusLabel, badgeX + badgeWidth / 2, itemStartY + 4.4, { align: 'center' });

    let entryY = itemStartY + 11;

    // Claim Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Claim Statement:', marginX + 3, entryY);
    entryY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(textLines, marginX + 3, entryY);
    entryY += textLines.length * 4.2 + 2;

    // Source URL
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Source URL:', marginX + 3, entryY);

    doc.setFont('helvetica', 'normal');
    if (claim.sourceUrl && claim.sourceUrl.trim()) {
      doc.setTextColor(37, 99, 235);
      const urlText = doc.splitTextToSize(claim.sourceUrl, contentWidth - 30);
      doc.text(urlText[0] || claim.sourceUrl, marginX + 22, entryY);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('No source link provided (Flagged as Unsourced)', marginX + 22, entryY);
    }
    entryY += 5;

    // Risk Flags Summary
    if (includeRiskFlags) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Risk Evaluation:', marginX + 3, entryY);

      let flagSummary = [];
      if (claim.flags.sensational) {
        flagSummary.push('Sensational Wording (' + (claim.flags.detectedKeywords?.join(', ') || 'Trigger words') + ')');
      }
      if (claim.flags.shouting) {
        flagSummary.push(`Excessive CAPS (${claim.flags.capsPercentage}%)`);
      }
      if (claim.flags.unsourced) {
        flagSummary.push('Missing Primary Source');
      }

      const flagsText = flagSummary.length > 0 ? flagSummary.join(' • ') : 'No high-risk viral triggers detected';

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(claim.flags.isHighRisk ? 185 : 71, claim.flags.isHighRisk ? 28 : 85, claim.flags.isHighRisk ? 28 : 105);
      doc.text(
        `${claim.flags.isHighRisk ? 'HIGH RISK QUEUE (2+ flags) — ' : ''}${flagsText}`,
        marginX + 28,
        entryY
      );
      entryY += 5.5;
    }

    // Built-in Claim Analysis (Possible Issues & Suggested Verification Steps)
    if (includeAnalysis && claim.analysis) {
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(226, 232, 240);
      const analysisBoxY = entryY;
      const issues = claim.analysis.possibleIssues;

      // Draw light box for Claim Analysis
      doc.roundedRect(marginX + 2, analysisBoxY, contentWidth - 4, 19, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text('Claim Analysis (Inbuilt Heuristic & Decision Framework):', marginX + 4, analysisBoxY + 4);

      // Issues detected list
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);

      const issueItems: string[] = [];
      if (issues.absoluteStatement) {
        issueItems.push(`Absolute statement [${issues.absoluteTerms.join(', ') || 'detected'}]`);
      }
      if (issues.emotionalWording) {
        issueItems.push(`Emotional wording [${issues.emotionalTerms.join(', ') || 'detected'}]`);
      }
      if (issues.missingSource) {
        issueItems.push('Missing source');
      }
      const issuesStr = issueItems.length > 0 ? issueItems.join(' • ') : 'None detected';

      doc.text(`• Possible issues detected: ${issuesStr}`, marginX + 5, analysisBoxY + 8);

      // Suggested Verification Steps
      doc.text(
        '• Suggested verification steps: Check original source • Compare with reliable sources • Check date • Look for context',
        marginX + 5,
        analysisBoxY + 12
      );

      // AI Decision Notice
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(194, 65, 12); // amber-700
      doc.text('• AI does not make the final decision. Human review required.', marginX + 5, analysisBoxY + 16);

      entryY += 21.5;
    }

    // Reviewer Note & Verdict if available
    if (includeReviewerNotes && claim.reviewerNote) {
      doc.setFillColor(254, 252, 232); // yellow-50
      doc.setDrawColor(254, 240, 138); // yellow-200
      doc.roundedRect(marginX + 2, entryY, contentWidth - 4, 8.5, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(161, 98, 7);
      doc.text('Reviewer Note / Triage Finding:', marginX + 4, entryY + 4);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(113, 63, 18);
      const noteCut = doc.splitTextToSize(claim.reviewerNote, contentWidth - 55);
      doc.text(noteCut[0] || claim.reviewerNote, marginX + 45, entryY + 4);

      if (claim.reviewerName) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(161, 98, 7);
        doc.text(`By: ${claim.reviewerName}`, marginX + 4, entryY + 7);
      }

      entryY += 10.5;
    }

    // Evidence points if available
    if (includeEvidence && claim.evidenceAnalysis && claim.evidenceAnalysis.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('Evidence & Triage Context:', marginX + 3, entryY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      const evidenceSummary = claim.evidenceAnalysis.slice(0, 2).join(' | ');
      const evText = doc.splitTextToSize(evidenceSummary, contentWidth - 45);
      doc.text(evText[0] || evidenceSummary, marginX + 38, entryY);

      entryY += 4.5;
    }

    // Border around whole item
    const finalCardHeight = entryY - itemStartY + 2;
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, itemStartY, contentWidth, finalCardHeight, 1.5, 1.5, 'D');

    currentY = itemStartY + finalCardHeight + 4;
  });

  // ==========================================
  // 4. INSTITUTIONAL FOOTER & PAGE NUMBERING
  // ==========================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top rule on footer
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    // Left disclaimer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'TruthLens Civic Verification Desk • AI does not make the final decision. Human review mandated.',
      marginX,
      pageHeight - 7.5
    );

    // Right page number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 7.5, { align: 'right' });
  }

  // Generate safe filename
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30);
  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${cleanTitle}-${timestampStr}.pdf`;

  // Trigger browser download
  doc.save(filename);

  return filename;
}
