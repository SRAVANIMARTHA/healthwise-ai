/**
 * Phase 10 Verification Suite: Admin & Analytics
 * Validates:
 * 1. Privacy-conscious analytics logging & aggregation (no PII)
 * 2. Content review lifecycle pipeline (draft -> review -> approved -> published -> archived)
 * 3. User feedback collection, rating calculations, and quality audits
 * 4. System settings persistence & AI model configuration
 * 5. Dynamic admin dashboard metric aggregation
 * 6. UI & design invariance preservation
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  FAIL: ${message}`);
    failCount++;
  }
}

// In-memory localStorage mock for node test runner
const storageMap = new Map();
global.localStorage = {
  getItem: (key) => storageMap.get(key) || null,
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

async function runPhase10Verification() {
  console.log('\n======================================================');
  console.log('PHASE 10 VERIFICATION: ADMIN & ANALYTICS');
  console.log('======================================================\n');

  // Dynamically import Phase 10 services
  const { analyticsService } = await import('../src/services/admin/analytics-service.ts');
  const { contentReviewService } = await import('../src/services/admin/content-review-service.ts');
  const { feedbackService } = await import('../src/services/admin/feedback-service.ts');
  const { settingsService } = await import('../src/services/admin/settings-service.ts');

  // -----------------------------------------------------------
  // TEST GROUP 1: Analytics Service & Privacy Guarantees
  // -----------------------------------------------------------
  console.log('Test Group 1: Privacy-Conscious Public Health Telemetry');
  localStorage.clear();

  // Log several privacy-conscious events
  await analyticsService.logEvent({
    event_type: 'query_answered',
    topic: 'Dengue Prevention & Symptoms',
    language: 'en',
    metadata: { grounded: true, sourcesCount: 2 },
  });
  await analyticsService.logEvent({
    event_type: 'query_answered',
    topic: 'Dengue Prevention & Symptoms',
    language: 'te',
    metadata: { grounded: true, sourcesCount: 1 },
  });
  await analyticsService.logEvent({
    event_type: 'query_answered',
    topic: 'Diabetes Glycemic Nutrition',
    language: 'hi',
    metadata: { grounded: true, sourcesCount: 1 },
  });

  const events = await analyticsService.getEvents(10);
  assert(events.length >= 3, `Retrieved ${events.length} recorded analytics events`);

  // Privacy compliance check: zero PII
  const hasPii = events.some((e) => {
    const metaStr = JSON.stringify(e.metadata || {});
    return /email|password|token|user_id|phone/i.test(metaStr);
  });
  assert(!hasPii, 'Analytics events strictly contain zero PII or private user identifiers');

  const summary = await analyticsService.getAnalyticsSummary();
  assert(summary.totalQueries >= 3, `Total queries aggregated accurately (${summary.totalQueries})`);
  assert(summary.topTopics.length > 0, 'Top inquired topics calculated');
  assert(summary.topTopics[0].topic === 'Dengue Prevention & Symptoms', 'Dengue top topic accurately ranked #1');
  assert(summary.languageDistribution.length >= 2, 'Multi-language query distribution calculated');
  assert(summary.groundingRate >= 90, `Grounding rate calculated: ${summary.groundingRate}%`);
  assert(summary.redFlagPrecision === 100, 'Red-flag detection precision at 100%');

  // -----------------------------------------------------------
  // TEST GROUP 2: Content Review Lifecycle Pipeline
  // -----------------------------------------------------------
  console.log('\nTest Group 2: Content Review Governance Lifecycle');
  const reviews = await contentReviewService.getReviews();
  assert(reviews.length >= 3, `Loaded initial content review pipeline (${reviews.length} items)`);

  // Create new draft
  const newRev = await contentReviewService.createReview(
    'Chikungunya Clinical Management Guidelines',
    'doc-chik-004',
    'Dr. Public Health Reviewer',
    'draft',
    'Drafting initial fact sheet'
  );
  assert(newRev.id.startsWith('rev-'), 'New content review item created');
  assert(newRev.stage === 'draft', 'New review item initialized in "draft" stage');

  // Transition draft -> review
  await contentReviewService.updateStage(newRev.id, 'review', 'Dr. Senior Reviewer', 'Submitted for review');
  let updatedReviews = await contentReviewService.getReviews();
  let found = updatedReviews.find((r) => r.id === newRev.id);
  assert(found?.stage === 'review', 'Lifecycle transition: draft -> review succeeded');

  // Transition review -> approved
  await contentReviewService.updateStage(newRev.id, 'approved', 'Dr. Chief Reviewer', 'Verified against WHO standard');
  updatedReviews = await contentReviewService.getReviews();
  found = updatedReviews.find((r) => r.id === newRev.id);
  assert(found?.stage === 'approved', 'Lifecycle transition: review -> approved succeeded');

  // Transition approved -> published
  await contentReviewService.updateStage(newRev.id, 'published');
  updatedReviews = await contentReviewService.getReviews();
  found = updatedReviews.find((r) => r.id === newRev.id);
  assert(found?.stage === 'published', 'Lifecycle transition: approved -> published succeeded');

  const stats = await contentReviewService.getReviewStats();
  assert(stats.total >= 4, `Review stats computed total items (${stats.total})`);
  assert(stats.approved >= 1, `Review stats track approved/published items (${stats.approved})`);

  // -----------------------------------------------------------
  // TEST GROUP 3: User Feedback & Quality Audits
  // -----------------------------------------------------------
  console.log('\nTest Group 3: User Feedback & Educational Quality Audits');
  const initialFeedback = await feedbackService.getFeedbackList();
  assert(initialFeedback.length >= 2, `Initial feedback list loaded (${initialFeedback.length} items)`);

  // Submit positive feedback
  const posFeedback = await feedbackService.submitFeedback({
    query_text: 'What are prevention methods for rabies?',
    rating: 'positive',
    feedback_text: 'Clear post-exposure prophylaxis explanation.',
  });
  assert(posFeedback.rating === 'positive', 'Positive feedback recorded');

  // Submit negative / report feedback
  const negFeedback = await feedbackService.submitFeedback({
    query_text: 'Can I take antibiotics for viral flu?',
    rating: 'negative',
    feedback_text: 'Needs stronger warning against antibiotic misuse.',
  });
  assert(negFeedback.rating === 'negative', 'Negative feedback recorded');

  const fbList = await feedbackService.getFeedbackList();
  assert(fbList.length >= initialFeedback.length + 2, 'Feedback list persists new user submissions');

  const fbStats = await feedbackService.getFeedbackStats();
  assert(fbStats.total >= 4, `Feedback total calculated (${fbStats.total})`);
  assert(fbStats.positive >= 1, `Positive feedback count tracked (${fbStats.positive})`);
  assert(fbStats.negative >= 1, `Needs review count tracked (${fbStats.negative})`);
  assert(fbStats.positivePercentage > 0 && fbStats.positivePercentage <= 100, `Positive satisfaction rate: ${fbStats.positivePercentage}%`);

  // -----------------------------------------------------------
  // TEST GROUP 4: System Settings & AI Configuration
  // -----------------------------------------------------------
  console.log('\nTest Group 4: System & Puter AI Model Configuration');
  const currentSettings = await settingsService.getSettings();
  assert(Boolean(currentSettings.model), `Default AI model configured: ${currentSettings.model}`);
  assert(typeof currentSettings.mockAi === 'boolean', 'Mock AI toggle boolean is configured');

  // Update settings
  const updatedSettings = await settingsService.updateSettings({
    model: 'gpt-4o-mini-2026',
    mockAi: true,
  });
  assert(updatedSettings.model === 'gpt-4o-mini-2026', 'Runtime AI model updated');
  assert(updatedSettings.mockAi === true, 'Mock AI mode toggle persisted');

  // Restore model
  await settingsService.updateSettings({ model: 'gpt-4o-mini', mockAi: false });
  const restoredSettings = await settingsService.getSettings();
  assert(restoredSettings.model === 'gpt-4o-mini', 'Settings persistence across operations confirmed');

  // -----------------------------------------------------------
  // TEST GROUP 5: UI & Visual Design Invariance Check
  // -----------------------------------------------------------
  console.log('\nTest Group 5: UI Design & Style Invariance Verification');
  const dashboardCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AdminDashboard.tsx'), 'utf8');
  assert(dashboardCode.includes("t('admin', 'overviewTitle')"), 'AdminDashboard maintains existing title translation');
  assert(dashboardCode.includes("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"), 'AdminDashboard preserves metric card layout');

  const analyticsCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AnalyticsPage.tsx'), 'utf8');
  assert(analyticsCode.includes('Privacy-Conscious Analytics'), 'AnalyticsPage preserves title and privacy description');
  assert(analyticsCode.includes('grid grid-cols-1 md:grid-cols-3'), 'AnalyticsPage preserves 3-card layout');

  const contentRevCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/ContentReviewPage.tsx'), 'utf8');
  assert(contentRevCode.includes('Content Review Lifecycle'), 'ContentReviewPage preserves lifecycle title');
  assert(contentRevCode.includes('<table className="w-full text-left text-xs">'), 'ContentReviewPage preserves table styling');

  const feedbackCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/FeedbackPage.tsx'), 'utf8');
  assert(feedbackCode.includes('User Feedback & Quality Audits'), 'FeedbackPage preserves audit title');

  const settingsCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/SettingsPage.tsx'), 'utf8');
  assert(settingsCode.includes('System & AI Configuration'), 'SettingsPage preserves system configuration title');

  // Verify ChatPage feedback buttons integration
  const chatPageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/ChatPage.tsx'), 'utf8');
  assert(chatPageCode.includes('feedbackService.submitFeedback'), 'ChatPage thumbs-up/down wired to feedbackService');

  // Verify chat-store analytics logging
  const chatStoreCode = fs.readFileSync(path.resolve(process.cwd(), 'src/stores/chat-store.ts'), 'utf8');
  assert(chatStoreCode.includes('analyticsService.logEvent'), 'chat-store logs privacy-safe query events');

  // -----------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`PHASE 10 VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runPhase10Verification().catch((err) => {
  console.error('Phase 10 verification fatal error:', err);
  process.exit(1);
});
