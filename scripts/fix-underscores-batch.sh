#!/bin/bash

# Fix Underscore Prefixes - Batch Script
# Removes underscore prefixes from template-referenced variables in Vue components
#
# This script fixes the systematic bug where ESLint cannot detect template usage
# in Vue SFC files, causing developers to add _ prefixes that break functionality.
#
# Usage: ./scripts/fix-underscores-batch.sh

set -e

echo "🔍 Scanning for underscore-prefixed variables in Vue components..."

# Count files with underscore-prefixed variables
FILE_COUNT=$(grep -rl "const _[a-zA-Z]" src/pages/*.vue | wc -l | tr -d ' ')
echo "📊 Found $FILE_COUNT Vue component files with underscore-prefixed variables"

# Create backup
BACKUP_DIR="backups/underscore-fix-$(date +%Y%m%d-%H%M%S)"
echo "💾 Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# Files to fix
FILES=(
  "src/pages/DashboardPage.vue"
  "src/pages/EventDetails.vue"
  "src/pages/EventList.vue"
  "src/pages/EventSeriesDetails.vue"
  "src/pages/DJsPage.vue"
  "src/pages/CouplesPage.vue"
  "src/pages/CoupleDetails.vue"
  "src/pages/CalendarTest.vue"
  "src/pages/TeachersPage.vue"
  "src/pages/EventSeriesPage.vue"
  "src/pages/ProfilePage.vue"
  "src/pages/LoginPage.vue"
  "src/pages/FavoritesPage.vue"
)

echo ""
echo "📝 Processing files..."
echo ""

FIXED_COUNT=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Backup original
    cp "$file" "$BACKUP_DIR/$(basename $file)"
    
    # Count underscore variables before
    BEFORE=$(grep -o "const _[a-zA-Z]" "$file" | wc -l | tr -d ' ')
    
    if [ "$BEFORE" -gt 0 ]; then
      # Fix underscore prefixes
      # Pattern 1: const _variableName = ...
      sed -i '' -E 's/const _([a-zA-Z][a-zA-Z0-9]*)/const \1/g' "$file"
      
      # Pattern 2: function _functionName(...) or const _functionName = (...) =>
      # Already handled by pattern 1
      
      # Count underscore variables after
      AFTER=$(grep -o "const _[a-zA-Z]" "$file" | wc -l | tr -d ' ')
      
      REMOVED=$((BEFORE - AFTER))
      echo "  ✅ Removed $REMOVED underscore prefixes ($BEFORE → $AFTER)"
      FIXED_COUNT=$((FIXED_COUNT + 1))
    else
      echo "  ⏭️  No underscore prefixes found"
    fi
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ Batch fix complete!"
echo "📊 Fixed $FIXED_COUNT files"
echo "💾 Backups saved in: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Run: pnpm type-check (validate changes)"
echo "2. Test the application manually"
echo "3. Commit changes if validation passes"
echo "4. Delete backup if everything works: rm -rf $BACKUP_DIR"
