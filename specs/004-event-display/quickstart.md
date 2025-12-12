# Quickstart: Enhanced Event Display

**Feature**: Enhanced Event Display  
**Purpose**: Validate implementation against user stories  
**Execution**: Manual + automated tests

## Prerequisites

```bash
# Ensure in feature branch
git checkout 004-event-display

# Install dependencies (if new packages added)
pnpm install

# Verify all tests pass
pnpm test:run

# Verify type checking passes
pnpm type-check

# Verify code quality
pnpm check:biome
```

## User Story 1: Mobile-Friendly Event Display

**Story**: As a user viewing an event on mobile, I want to see all information clearly without horizontal scrolling.

**Steps**:

1. Start dev server: `pnpm dev`
2. Open browser DevTools, set device to "iPhone 12" (390px width)
3. Navigate to any event detail page (e.g., `/events/bosthon-tango-marathon`)
4. Verify:
   - ✅ Featured image displays prominently at top (16:9 aspect ratio)
   - ✅ Event title is readable, wraps to multiple lines if long
   - ✅ Date displays as "18-22 Sep 2025" (not raw JSON)
   - ✅ Category pill shows colored chip with icon
   - ✅ Edition shows as "13th Edition" pill
   - ✅ No horizontal scrolling required
   - ✅ All touch targets >= 44px (tabs, buttons, pills)

**Expected Result**: All information readable, no scrolling, touch-friendly

**Automated Test**:

```bash
pnpm test:run src/components/event/__tests__/EventHeroSection.test.ts
```

---

## User Story 2: Interactive Map in Venue Tab

**Story**: As a user, I want to see the venue location on an interactive map at regional zoom level.

**Steps**:

1. Navigate to event detail page
2. Click on "Venue & Location" tab
3. Wait for map to load (lazy loading)
4. Verify:
   - ✅ Map displays OpenStreetMap tiles
   - ✅ Map zoom level is 11 (regional view, not too close/far)
   - ✅ Red marker appears at venue location
   - ✅ Map is interactive (can pan, zoom, click marker)
   - ✅ Popup shows venue name and address when marker clicked
   - ✅ Map loads within 1 second of tab activation

**Expected Result**: Interactive map at zoom 11 with venue marker

**Automated Test**:

```bash
pnpm test:run src/components/event/__tests__/EventVenueMap.test.ts
```

---

## User Story 3: Category Pills Display

**Story**: As a user, I want to identify the event category and edition at a glance.

**Steps**:

1. Navigate to event detail page
2. Look at hero section below event title
3. Verify:
   - ✅ Category pill shows event type (e.g., "Tango Marathon")
   - ✅ Category pill has colored background matching category
   - ✅ Category pill has icon (event, celebration, people, etc.)
   - ✅ Edition pill shows ordinal format (e.g., "13th Edition")
   - ✅ Pills are visually distinct from surrounding content
   - ✅ Text on pills has sufficient contrast (WCAG AA)

**Expected Result**: Clearly visible category and edition pills with icons

**Automated Test**:

```bash
pnpm test:run src/composables/__tests__/useEventDisplay.test.ts
```

---

## User Story 4: Date Formatting

**Story**: As a user, I want to see event dates in easy-to-read format.

**Steps**:

1. Navigate to event detail page
2. Check date display in hero section and event info sidebar
3. Verify:
   - ✅ Dates show as "18-22 Sep 2025" (not "2025-09-18T00:00:00")
   - ✅ Format is consistent throughout page
   - ✅ Single-day events show as "18 Sep 2025" (not range)
   - ✅ Multi-month events show both months (e.g., "30 Dec 2025 - 2 Jan 2026")

**Expected Result**: Human-readable date format across all displays

**Automated Test**:

```bash
pnpm test:run src/utils/__tests__/dateFormatters.test.ts
```

---

## User Story 5: Featured Image Fallback

**Story**: As a user, I want to see an attractive image even when event has no featured image.

**Steps**:

1. Find or create test event with no featured_image
2. Navigate to that event's detail page
3. Verify:
   - ✅ Hero section displays category-specific default image
   - ✅ Marathon events show marathon default image
   - ✅ Festival events show festival default image
   - ✅ Image is high quality and appropriate aspect ratio
   - ✅ No broken image icons or blank spaces

**Expected Result**: Category-appropriate default image displays

**Automated Test**:

```bash
pnpm test:run src/utils/__tests__/categoryImages.test.ts
```

---

## User Story 6: Map Coordinates Fallback

**Story**: As a user, I want to see a map even when exact venue coordinates are missing.

**Steps**:

1. Find or create test event with venue but no coordinates
2. Navigate to event detail page
3. Click "Venue & Location" tab
4. Verify:
   - ✅ Map displays centered on city/country location
   - ✅ No venue marker appears (since coordinates unknown)
   - ✅ Map zoom level is still 11
   - ✅ Venue address text displays below/beside map
   - ✅ No error messages or broken map display

**Expected Result**: Map shows general area without specific marker

**Automated Test**:

```bash
pnpm test:run src/composables/__tests__/useMapIntegration.test.ts
```

---

## Edge Cases Validation

### Edge Case 1: Very Long Event Names

**Test**: Event with 80+ character name

**Verify**:

- ✅ Text wraps to multiple lines in hero section
- ✅ Line height prevents text overlap
- ✅ Gradient overlay ensures readability
- ✅ No text overflow or clipping

### Edge Case 2: Small Mobile Screens (<360px)

**Test**: DevTools set to 320px width (iPhone SE)

**Verify**:

- ✅ All content stacks vertically
- ✅ Pills wrap to multiple rows if needed
- ✅ No horizontal scrolling
- ✅ Touch targets remain >= 44px

### Edge Case 3: Multiple Venue Locations

**Test**: Event with 2+ venue objects

**Verify**:

- ✅ Map shows all markers with numbered pins
- ✅ Clicking markers shows individual venue info
- ✅ Map zooms to fit all markers
- ✅ Address list shows all venues

### Edge Case 4: Missing Category/Edition

**Test**: Event with no category or edition metadata

**Verify**:

- ✅ Missing category pill is hidden (not shown as "Unknown")
- ✅ Missing edition pill is hidden
- ✅ Hero section still looks complete with remaining info
- ✅ No error messages

---

## Performance Validation

### Lighthouse Mobile Score

```bash
# Build production version
pnpm build

# Serve production build
pnpm preview

# Run Lighthouse in Chrome DevTools
# Target: Mobile Performance >= 80
```

**Check**:

- ✅ Performance score >= 80
- ✅ First Contentful Paint < 2s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1

### Network Throttling (3G)

**Test**:

1. DevTools → Network → Throttle to "Fast 3G"
2. Navigate to event page
3. Verify:
   - ✅ Featured image loads within 2 seconds
   - ✅ Map (when tab activated) loads within 1 second
   - ✅ Page is usable before all images load
   - ✅ Loading spinners show during async operations

---

## Accessibility Validation

### Keyboard Navigation

**Test**:

1. Use only Tab, Enter, Arrow keys (no mouse)
2. Navigate through event page
3. Verify:
   - ✅ Can tab to all tabs (Overview, Details, DJs, Venue, Contact)
   - ✅ Can activate tabs with Enter/Space
   - ✅ Can navigate map with arrow keys (if map focused)
   - ✅ Focus indicators visible on all interactive elements

### Screen Reader

**Test** (VoiceOver on Mac, NVDA on Windows):

1. Activate screen reader
2. Navigate event page
3. Verify:
   - ✅ Hero image has descriptive alt text
   - ✅ Pills announce category/edition info
   - ✅ Date announces human-readable format
   - ✅ Map has ARIA labels
   - ✅ Tab panels announce content on activation

### Color Contrast

**Tool**: Browser extension (e.g., axe DevTools)

**Verify**:

- ✅ All category pill colors meet WCAG AA (4.5:1 contrast)
- ✅ Text on gradient overlay readable
- ✅ No color-only information (icons + text)

---

## Integration Test

**Execute full end-to-end test**:

```bash
pnpm test:run tests/integration/__tests__/event-display.test.ts
```

**This test validates**:

- All 6 user stories automated
- Edge cases handled correctly
- Performance targets met (simulated)
- Accessibility attributes present

---

## Regression Check

**Ensure existing features still work**:

1. **Event List Page**: Still loads and displays events
2. **Event Search**: Filtering and sorting unchanged
3. **Event Series**: Related events still linked
4. **DJs Tab**: DJ information displays correctly
5. **Contact Tab**: Links and contact info work

**Quick Regression Test**:

```bash
# Run all existing event-related tests
pnpm test:run src/pages/__tests__/EventDetails.test.ts
pnpm test:run src/pages/__tests__/EventList.test.ts
```

---

## Pre-Deployment Checklist

- [ ] All automated tests pass (`pnpm test:run`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Code quality passes (`pnpm check:biome`)
- [ ] All 6 user stories validated manually
- [ ] Lighthouse mobile score >= 80
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: Screen reader announces content
- [ ] Edge cases tested (long names, small screens, missing data)
- [ ] Regression tests pass
- [ ] Category default images added to `/src/assets/images/category-defaults/`
- [ ] Leaflet CSS imported in app (if not already)
- [ ] No console errors or warnings

---

## Success Criteria

✅ **Feature Complete** when:

1. All user stories validate successfully
2. All automated tests pass (100% of test suites)
3. Lighthouse mobile performance score >= 80
4. WCAG 2.1 AA accessibility compliance verified
5. No regressions in existing event display functionality
6. Code review approved
7. Pre-deployment checklist completed

---

## Rollback Plan

If issues discovered post-deployment:

1. **Minor Issues** (styling, text): Hotfix on feature branch
2. **Major Issues** (broken maps, crashes):
   ```bash
   git revert [merge-commit-hash]
   git push origin develop
   ```
3. **Re-test** with quickstart before re-deploying

---

## Next Steps After Validation

1. Merge feature branch to develop: `git merge 004-event-display`
2. Deploy to staging environment
3. Final QA testing in staging
4. Deploy to production
5. Monitor user feedback and analytics
6. Document any lessons learned in `/specs/004-event-display/RETROSPECTIVE.md`
