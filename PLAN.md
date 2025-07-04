# CI Failures Fix Plan

## Overview

This document outlines the plan to fix the failing CI tasks in the tmd_core project. The CI pipeline has multiple issues across code quality checks, static analysis, and test infrastructure.

## Current CI Status

### 1. PHP CodeSniffer (PHPCS) - FAILING

**Issues Found:**

- Trailing whitespace in V4 API controllers
- Missing newlines at end of files
- Line length violations (>180 characters)
- Header formatting issues
- Third-party library violations (TGM Plugin Activation)

**Affected Files:**

- `src/API/V4/SeriesController.php`
- `src/API/V4/TeachersController.php`
- `src/API/V4/UserInteractionsController.php`
- `src/API/V4/WordPressNativeBaseController.php`
- `src/API/V4/DjsController.php`
- `src/API/V4/CouplesController.php`
- `src/API/V4/EventsController.php`
- `src/Admin/Tools/FeatureFlagManager.php`

### 2. PHPStan Static Analysis - FAILING

**Issues Found:**

- 190 errors across multiple categories
- Type mismatches and invalid return types
- Missing/invalid class references
- Abstract method implementation issues
- Undefined function calls
- Property access on unknown classes

### 3. PHPUnit Tests - FAILING

**Issues Found:**

- Autoloading failure: `Class "TMD\Tests\API\V3\ApiTestCase" not found`
- Test infrastructure not properly configured
- WordPress test environment setup issues

### 4. Node.js Dependencies - WARNINGS

**Issues Found:**

- React version conflicts (WordPress components require React 17, project has React 18+)
- Peer dependency warnings
- Security vulnerabilities (7 moderate severity)

## Implementation Plan

### Phase 1: Quick Wins (Immediate)

**Priority: HIGH**
**Estimated Time: 1-2 hours**

1. **Fix Auto-Fixable PHPCS Issues**

   ```bash
   composer phpcbf
   ```

   - This will fix trailing whitespace, missing newlines, and basic formatting

2. **Exclude Third-Party Libraries from PHPCS**

   - Update `phpcs.xml` to exclude `libs/tgm-plugin-activation/`
   - These are external dependencies and shouldn't be subject to our coding standards

3. **Fix Manual PHPCS Issues**
   - Break long lines in `FeatureFlagManager.php`
   - Fix header formatting in `WordPressNativeBaseController.php`

### Phase 2: Test Infrastructure (High Priority)

**Priority: HIGH**
**Estimated Time: 2-3 hours**

1. **Debug Test Autoloading**

   - Investigate why `ApiTestCase` class is not found
   - Check composer autoload configuration for test namespace
   - Verify `tests/bootstrap.php` setup

2. **Fix WordPress Test Environment**

   - Ensure `install-wp-tests.sh` script works correctly
   - Verify MySQL connection in CI environment
   - Test local WordPress test setup

3. **Create PHPStan Baseline**
   ```bash
   composer phpstan-baseline
   ```
   - Generate baseline to ignore existing violations
   - Prevent new violations from being introduced

### Phase 3: Static Analysis (Medium Priority)

**Priority: MEDIUM**
**Estimated Time: 4-6 hours**

1. **Fix Critical PHPStan Issues**

   - Abstract method implementations
   - Type mismatches in API controllers
   - Invalid return types

2. **Add Missing Stubs/Mocks**

   - WordPress function stubs
   - MetaBox API stubs
   - Third-party plugin stubs

3. **Update Method Signatures**
   - Ensure child classes properly implement parent methods
   - Fix parameter type mismatches

### Phase 4: Node.js Dependencies (Low Priority)

**Priority: LOW**
**Estimated Time: 1-2 hours**

1. **Resolve React Version Conflicts**

   ```bash
   npm install react@^17.0.0 react-dom@^17.0.0 --save
   ```

2. **Fix Security Vulnerabilities**

   ```bash
   npm audit fix
   ```

3. **Update package.json**
   - Pin React versions to match WordPress requirements
   - Update peer dependencies

## Success Criteria

### Phase 1 Success

- [ ] `composer phpcs` passes with 0 errors
- [ ] All auto-fixable issues resolved
- [ ] Third-party libraries excluded from PHPCS

### Phase 2 Success

- [ ] `composer test` runs successfully
- [ ] All test classes can be autoloaded
- [ ] WordPress test environment works locally and in CI
- [ ] PHPStan baseline generated

### Phase 3 Success

- [ ] `composer phpstan` passes with baseline
- [ ] No new static analysis errors introduced
- [ ] Critical type issues resolved

### Phase 4 Success

- [ ] `npm install` completes without warnings
- [ ] No security vulnerabilities
- [ ] React version conflicts resolved

## Risk Assessment

### High Risk

- **Test autoloading issues**: May require significant investigation
- **WordPress test environment**: Complex setup that may have environment-specific issues

### Medium Risk

- **PHPStan fixes**: May require architectural changes
- **Type system updates**: Could introduce breaking changes

### Low Risk

- **PHPCS fixes**: Mostly automated and safe
- **Node.js dependencies**: Standard dependency management

## Rollback Plan

If issues arise during implementation:

1. **Immediate rollback**: `git reset --hard HEAD~1`
2. **Partial rollback**: Revert specific commits that cause issues
3. **Baseline approach**: Use PHPStan baseline to ignore problematic areas temporarily

## Testing Strategy

### Local Testing

- Run each tool individually before committing
- Test in isolated environment
- Verify no regressions in existing functionality

### CI Testing

- Push to feature branch to trigger CI
- Monitor all CI jobs
- Address failures immediately

## Documentation Updates

After successful implementation:

1. **Update CONTRIBUTING.md** with new development workflow
2. **Update README.md** with setup instructions
3. **Create troubleshooting guide** for common CI issues
4. **Document PHPStan baseline management**

## Timeline

- **Phase 1**: Day 1 (2 hours)
- **Phase 2**: Day 1-2 (4 hours)
- **Phase 3**: Day 2-3 (6 hours)
- **Phase 4**: Day 3 (2 hours)

**Total Estimated Time**: 14 hours over 3 days

## Next Steps

1. Start with Phase 1 (Quick Wins)
2. Commit changes after each phase
3. Test CI pipeline after each phase
4. Document any issues encountered
5. Update this plan based on findings

---

**Last Updated**: 2025-01-19
**Author**: Daniel de Kay
**Status**: In Progress
