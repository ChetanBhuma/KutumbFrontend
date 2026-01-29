#!/bin/bash

# Codebase Cleanup Script
# Created: 2025-12-18
# Purpose: Remove unnecessary files and clean up the project structure

set -e

echo "🧹 Starting codebase cleanup..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Create backup directory
echo "📦 Creating backup directory..."
mkdir -p .cleanup_backup
BACKUP_DIR=".cleanup_backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 1. Remove log files
echo "🗑️  Removing log files..."
rm -f backend-dev.log
rm -f frontend-dev.log  
rm -f postgres.log
rm -f redis.log
rm -f backend/postgres.log
rm -f backend/redis.log
rm -rf logs/
rm -rf backend/logs/

# 2. Remove temporary files
echo "🗑️  Removing temporary files..."
rm -f .temp_label_import.txt
rm -f extracted_text.txt
rm -f backend/test_output.txt

# 3. Archive then remove old documentation (backend)
echo "📚 Backing up and removing old backend docs..."
cd backend
mv -f ANALYSIS-SUMMARY.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f .build-summary.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f BUILD-SUCCESS.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f BUSINESS-LOGIC-ANALYSIS.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f CITIZEN-PORTAL-ANALYSIS.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f COMPLETION-REPORT.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f FINAL-IMPLEMENTATION-REPORT.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f FIXES-SUMMARY.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f IMPLEMENTATION-COMPLETE.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f IMPLEMENTATION-GUIDE.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f ISSUE-CITIZEN-ID-400.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f OWASP_COMPLIANCE.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f QUICK-REFERENCE.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f QUICK-START.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f SECURITY_CONFIG.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f SYSTEM-ACCESS.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f TASK-VERIFICATION-REPORT.md "$BACKUP_DIR/" 2>/dev/null || true
cd ..

# 4. Archive then remove old documentation (root)
echo "📚 Backing up and removing old root docs..."
mv -f ADMIN-LOGIN-ANALYSIS.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f ADMIN_LOGIN_DOCUMENTATION.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f ANALYSIS_INDEX.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f BUSINESS_LOGIC_ANALYSIS.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f CITIZEN_PORTAL_DEVELOPMENT.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f CODE_ANALYSIS_REPORT.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f COMPLETE-SYSTEM-ACCESS.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f COMPLETE_ANALYSIS_SUMMARY.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f EMERGENCY_SOS_IMPLEMENTATION.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f ERROR_FIX_MASTER_DATA.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f FLOW_DOCUMENTATION.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f LOGIN_FIX_SUMMARY.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f MINOR_ISSUES_FIXED.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f MODERATE_ISSUES_FIXED.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f PERFORMANCE.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f PHASE_7_*.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f ROLE_BASED_REDIRECT.md "$BACKUP_DIR/" 2>/dev/null || true
mv -f WORKFLOW_DOCUMENTATION.md "$BACKUP_DIR/" 2>/dev/null || true

# 5. Remove debug/one-time scripts
echo "🗑️  Removing debug scripts..."
rm -f backend/scripts/check-citizen-9000.ts
rm -f backend/scripts/check-duplicates.ts
rm -f backend/scripts/check_citizens.ts
rm -f backend/scripts/fix-data-consistency.ts
rm -f backend/scripts/seed-simple.ts
rm -f backend/scripts/verify-citizens-module.ts
rm -f backend/scripts/verify-flow.ts
rm -f extract_rtf.py
rm -f verify_auth_error.sh

# 6. Remove .DS_Store files
echo "🗑️  Removing .DS_Store files..."
find . -name ".DS_Store" -type f -delete

# 7. Remove build artifacts (ensure they're in .gitignore first)
echo "🗑️  Removing build artifacts..."
rm -f tsconfig.tsbuildinfo

# 8. Remove duplicate config
echo "🗑️  Removing duplicate configs..."
rm -f next.config.mjs
rm -f pnpm-lock.yaml

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "  - Removed log files"
echo "  - Removed temporary files"
echo "  - Archived old documentation to: $BACKUP_DIR"
echo "  - Removed debug scripts"
echo "  - Removed build artifacts"
echo ""
echo "⚠️  Important: Update .gitignore to prevent these files from being tracked"
echo ""
echo "💡 Next steps:"
echo "  1. Review backup at: $BACKUP_DIR"
echo "  2. Update .gitignore (run: ./scripts/update-gitignore.sh)"
echo "  3. Commit changes"
