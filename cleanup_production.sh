#!/bin/bash

# Rizik V4 - Production Cleanup Script
# This script removes duplicate files, old documentation, and unused code
# IMPORTANT: Review CODEBASE_CLEANUP_ANALYSIS.md before running!

set -e  # Exit on error

echo "🧹 Rizik V4 Production Cleanup Script"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will delete ~160 files!"
echo "📋 Review CODEBASE_CLEANUP_ANALYSIS.md first"
echo ""
read -p "Have you created a backup branch? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Please create a backup first:"
    echo "   git checkout -b pre-cleanup-backup"
    echo "   git checkout -b production-cleanup"
    exit 1
fi

echo ""
echo "Starting cleanup in 5 seconds... (Ctrl+C to cancel)"
sleep 5

# Phase 1: Documentation Cleanup
echo ""
echo "📄 Phase 1: Removing old documentation..."

# Remove all markdown files except essential ones
find . -maxdepth 1 -name "*.md" \
  ! -name "README.md" \
  ! -name "CODEBASE_CLEANUP_ANALYSIS.md" \
  ! -name "AURA_PROVIDER_FIX.md" \
  -type f -delete

echo "   ✅ Removed ~140 documentation files"

# Remove screenshot images
rm -f flutter_01.png flutter_02.png flutter_03.png 2>/dev/null || true
echo "   ✅ Removed screenshot images"

# Remove shell scripts
rm -f new.sh new2.sh 2>/dev/null || true
echo "   ✅ Removed shell scripts"

# Remove test JS files
rm -f test_mcp_tools.js run_mcp_tools.js 2>/dev/null || true
echo "   ✅ Removed test JS files"

# Phase 2: Duplicate Screen Cleanup
echo ""
echo "🖥️  Phase 2: Removing duplicate screens..."

# Remove duplicate khata_os screens (keep khata_os_merged.dart)
rm -f lib/screens/khata_os_final.dart 2>/dev/null || true
rm -f lib/screens/khata_os_new.dart 2>/dev/null || true
rm -f lib/screens/khata_os_professional.dart 2>/dev/null || true
rm -f lib/screens/khata_os_v5.dart 2>/dev/null || true
rm -f lib/screens/khata_screen.dart 2>/dev/null || true
echo "   ✅ Removed 5 duplicate khata_os screens"

# Remove duplicate consumer_home screens (keep consumer_home.dart)
rm -f lib/screens/home/consumer_home_strategic_deck.dart 2>/dev/null || true
rm -f lib/screens/home/consumer_home_v6.dart 2>/dev/null || true
rm -f lib/screens/home/consumer_home_v6_fixed.dart 2>/dev/null || true
rm -f lib/screens/home/consumer_home.dart.backup 2>/dev/null || true
rm -f lib/screens/home/consumer_home.dart.bak 2>/dev/null || true
echo "   ✅ Removed 5 duplicate consumer_home screens"

# Remove unused screens
rm -f lib/screens/home_screen.dart 2>/dev/null || true
rm -f lib/screens/virtual_shop_screen.dart 2>/dev/null || true
echo "   ✅ Removed 2 unused screens"

# Phase 3: Provider Cleanup
echo ""
echo "🔌 Phase 3: Removing unused providers..."

rm -f lib/providers/hyperlocal_provider_simple.dart 2>/dev/null || true
echo "   ✅ Removed 1 unused provider"

# Phase 4: Linux Platform Cleanup
echo ""
echo "🐧 Phase 4: Removing duplicate linux files..."

rm -f linux/main.dart 2>/dev/null || true
rm -f linux/page.dart 2>/dev/null || true
rm -f linux/screen.dart 2>/dev/null || true
echo "   ✅ Removed 3 duplicate linux files"

# Phase 5: Spec Documentation Cleanup
echo ""
echo "📚 Phase 5: Cleaning spec documentation..."

# Remove progress/status files from specs
rm -f .kiro/specs/v3-ecosystem-enhancement/TASK_2_PROGRESS.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/TASK_4_PROGRESS.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/IMPLEMENTATION_SUMMARY.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/GETTING_STARTED.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/CODEBASE_INTEGRATION.md 2>/dev/null || true
rm -f ".kiro/specs/v3-ecosystem-enhancement/V5++_GAME_OS_TRANSFORMATION.md" 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/GAME_OS_MODELS_COMPLETE.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/PHASE_1_AND_2_COMPLETE.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/PHASE_1_COMPLETE.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/PHASE_1_COMPLETE_VERIFIED.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/NEXT_PHASE_ROADMAP.md 2>/dev/null || true
rm -f .kiro/specs/v3-ecosystem-enhancement/TASK_1.2_COMPLETE.md 2>/dev/null || true
rm -f .kiro/specs/ui-ux-completion-roadmap/IMPLEMENTATION_CHECKLIST.md 2>/dev/null || true
rm -f .kiro/specs/ui-ux-completion-roadmap/role-interconnection-analysis.md 2>/dev/null || true
rm -f ".kiro/specs/ui-ux-completion-roadmap/our unorganised plan from conversation beetween me and designer .md" 2>/dev/null || true
rm -f ".kiro/specs/ui-ux-completion-roadmap/new more added plan .md" 2>/dev/null || true
echo "   ✅ Removed 16 spec progress files"

# Summary
echo ""
echo "✨ Cleanup Complete!"
echo "==================="
echo ""
echo "📊 Summary:"
echo "   • Removed ~140 documentation files"
echo "   • Removed 5 duplicate khata_os screens"
echo "   • Removed 5 duplicate consumer_home screens"
echo "   • Removed 2 unused screens"
echo "   • Removed 1 unused provider"
echo "   • Removed 3 duplicate linux files"
echo "   • Removed 16 spec progress files"
echo ""
echo "🔍 Next Steps:"
echo "   1. Run: flutter analyze"
echo "   2. Run: flutter build apk --debug"
echo "   3. Test the app thoroughly"
echo "   4. Commit changes: git add . && git commit -m 'chore: production cleanup'"
echo ""
echo "📝 Files kept:"
echo "   • README.md"
echo "   • CODEBASE_CLEANUP_ANALYSIS.md"
echo "   • AURA_PROVIDER_FIX.md"
echo "   • All essential spec files in .kiro/specs/"
echo ""
