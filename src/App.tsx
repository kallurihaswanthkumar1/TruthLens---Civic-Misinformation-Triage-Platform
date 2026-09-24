import React, { useState, useEffect } from 'react';
import { 
  Claim, 
  ActiveView, 
  Platform, 
  Category, 
  ClaimStatus,
  TeamComment
} from './types';
import { INITIAL_CLAIMS } from './data/seedClaims';
import { calculateRiskFlags } from './utils/triageEngine';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { PublicFeedView } from './components/PublicFeedView';
import { NewsroomTriageView } from './components/NewsroomTriageView';
import { SubmitClaimView } from './components/SubmitClaimView';
import { ClaimDetailView } from './components/ClaimDetailView';
import { PlatformGuideView } from './components/PlatformGuideView';
import { MobileNav } from './components/MobileNav';

const STORAGE_KEY = 'truthlens_civic_platform_v9';

export function App() {
  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse local claims', e);
    }
    return INITIAL_CLAIMS;
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
    } catch (e) {
      console.warn('Failed to store claims', e);
    }
  }, [claims]);

  // Pending high-risk count for notification badge
  const pendingHighRiskCount = claims.filter(
    (c) => c.status === 'Unverified' && c.flags.isHighRisk
  ).length;

  const handleSelectClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitClaim = (claimData: {
    text: string;
    platform: Platform;
    category: Category;
    sourceUrl?: string;
    submitterName?: string;
  }) => {
    const flags = calculateRiskFlags(claimData.text, claimData.sourceUrl);
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      text: claimData.text,
      platform: claimData.platform,
      category: claimData.category,
      sourceUrl: claimData.sourceUrl,
      submittedAt: new Date().toISOString(),
      submitterName: claimData.submitterName || 'Citizen Contributor',
      flags,
      status: 'Unverified',
      thumbnailTheme: claimData.category.toLowerCase().includes('health') 
        ? 'health' 
        : claimData.category.toLowerCase().includes('finance') 
        ? 'finance' 
        : claimData.category.toLowerCase().includes('politic') 
        ? 'politics' 
        : 'generic',
      evidenceAnalysis: [
        'Initial intake heuristic scan completed',
        flags.unsourced ? 'No external primary citation provided' : 'Source reference URL registered for fact-check routing',
        flags.sensational ? 'High-urgency virality trigger terms detected' : 'Standard conversational phrasing observed',
      ],
      editHistory: [],
    };

    setClaims((prev) => [newClaim, ...prev]);
  };

  const handleUpdateClaimVerdict = (
    claimId: string,
    status: ClaimStatus,
    note: string
  ) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status,
            reviewerNote: note,
            reviewerName: 'Editorial Desk (Civic Verification Unit)',
            reviewedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // If currently viewing this claim in detail, update selectedClaim as well
    if (selectedClaim && selectedClaim.id === claimId) {
      setSelectedClaim((prev) =>
        prev
          ? {
              ...prev,
              status,
              reviewerNote: note,
              reviewerName: 'Editorial Desk (Civic Verification Unit)',
              reviewedAt: new Date().toISOString(),
            }
          : null
      );
    }
  };

  const handleTriageThisClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setActiveView('triage');
  };

  const handleBulkUpdateClaimStatus = (
    claimIds: string[],
    status: ClaimStatus,
    note?: string
  ) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (claimIds.includes(c.id)) {
          return {
            ...c,
            status,
            reviewerNote:
              note ||
              `Bulk updated to "${status}" via Executive Dashboard batch triage.`,
            reviewerName: 'Newsroom Operations Desk (Bulk Action)',
            reviewedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // Keep selectedClaim in sync if affected
    if (selectedClaim && claimIds.includes(selectedClaim.id)) {
      setSelectedClaim((prev) =>
        prev
          ? {
              ...prev,
              status,
              reviewerNote:
                note ||
                `Bulk updated to "${status}" via Executive Dashboard batch triage.`,
              reviewerName: 'Newsroom Operations Desk (Bulk Action)',
              reviewedAt: new Date().toISOString(),
            }
          : null
      );
    }
  };

  const handleRefresh = () => {
    // Re-trigger visual feedback
  };

  const handleAddTeamComment = (
    claimId: string,
    commentData: Omit<TeamComment, 'id' | 'createdAt'>
  ) => {
    const newComment: TeamComment = {
      ...commentData,
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            teamComments: [...(c.teamComments || []), newComment],
          };
        }
        return c;
      })
    );

    if (selectedClaim && selectedClaim.id === claimId) {
      setSelectedClaim((prev) =>
        prev
          ? {
              ...prev,
              teamComments: [...(prev.teamComments || []), newComment],
            }
          : null
      );
    }
  };

  const handleTogglePinComment = (claimId: string, commentId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            teamComments: (c.teamComments || []).map((cmt) =>
              cmt.id === commentId ? { ...cmt, pinned: !cmt.pinned } : cmt
            ),
          };
        }
        return c;
      })
    );

    if (selectedClaim && selectedClaim.id === claimId) {
      setSelectedClaim((prev) =>
        prev
          ? {
              ...prev,
              teamComments: (prev.teamComments || []).map((cmt) =>
                cmt.id === commentId ? { ...cmt, pinned: !cmt.pinned } : cmt
              ),
            }
          : null
      );
    }
  };

  const handleDeleteTeamComment = (claimId: string, commentId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            teamComments: (c.teamComments || []).filter((cmt) => cmt.id !== commentId),
          };
        }
        return c;
      })
    );

    if (selectedClaim && selectedClaim.id === claimId) {
      setSelectedClaim((prev) =>
        prev
          ? {
              ...prev,
              teamComments: (prev.teamComments || []).filter((cmt) => cmt.id !== commentId),
            }
          : null
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* Fixed Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingCount={pendingHighRiskCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header Bar */}
        <TopBar
          activeView={activeView}
          setActiveView={(v) => {
            setActiveView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* View Routing */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              claims={claims}
              setActiveView={setActiveView}
              onSelectClaim={handleSelectClaim}
              onBulkUpdateClaimStatus={handleBulkUpdateClaimStatus}
            />
          )}

          {activeView === 'feed' && (
            <PublicFeedView
              claims={claims}
              onSelectClaim={handleSelectClaim}
              onRefresh={handleRefresh}
            />
          )}

          {activeView === 'triage' && (
            <NewsroomTriageView
              claims={claims}
              onUpdateClaimVerdict={handleUpdateClaimVerdict}
            />
          )}

          {activeView === 'submit' && (
            <SubmitClaimView
              onSubmit={handleSubmitClaim}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'detail' && selectedClaim && (
            <ClaimDetailView
              claim={selectedClaim}
              onBack={() => setActiveView('feed')}
              setActiveView={setActiveView}
              onTriageThisClaim={handleTriageThisClaim}
              onAddTeamComment={handleAddTeamComment}
              onTogglePinComment={handleTogglePinComment}
              onDeleteTeamComment={handleDeleteTeamComment}
            />
          )}

          {activeView === 'guide' && (
            <PlatformGuideView setActiveView={setActiveView} />
          )}
        </main>
      </div>

      {/* Mobile Drawer and Bottom Navigation Bar */}
      <MobileNav
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingCount={pendingHighRiskCount}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}

export default App;
