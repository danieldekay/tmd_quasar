# Sass Deprecation Warnings - Fix Notes

## Issue
Sass is deprecating `darken()` and `lighten()` functions in favor of the new color module syntax.

## Affected Files
1. `src/css/_page.scss` - Line 11
2. `src/css/_cards.scss` - Line 54

## Current Code vs New Code

### _page.scss (Line 11)

**Current (deprecated)**:
```scss
background: linear-gradient(135deg, darken(#1e2024, 5%) 0%, darken(#303a42, 5%) 100%);
```

**Option 1 - color.scale() (recommended)**:
```scss
@use 'sass:color';

background: linear-gradient(
  135deg, 
  color.scale(#1e2024, $lightness: -5%) 0%, 
  color.scale(#303a42, $lightness: -5%) 100%
);
```

**Option 2 - color.adjust()**:
```scss
@use 'sass:color';

background: linear-gradient(
  135deg, 
  color.adjust(#1e2024, $lightness: -5%) 0%, 
  color.adjust(#303a42, $lightness: -5%) 100%
);
```

### _cards.scss (Line 54)

**Current (deprecated)**:
```scss
background: linear-gradient(145deg, lighten($grey-6, 5%) 0%, darken($grey-6, 5%) 100%);
```

**New (recommended)**:
```scss
@use 'sass:color';

background: linear-gradient(
  145deg, 
  color.scale($grey-6, $lightness: 5%) 0%, 
  color.scale($grey-6, $lightness: -5%) 100%
);
```

## Migration Strategy

### Immediate (Non-Critical)
These warnings don't break functionality. They're just deprecation notices.

### Before Next Major Release
Update all instances before Sass removes these functions entirely.

### Global Search and Replace
```bash
# Find all instances
grep -r "darken(" src/css/
grep -r "lighten(" src/css/

# Count occurrences
grep -r "darken(" src/css/ | wc -l
grep -r "lighten(" src/css/ | wc -l
```

## Quick Fix Script (Optional)

If there are many instances, consider a script:

```javascript
// scripts/fix-sass-deprecations.js
const fs = require('fs');
const glob = require('glob');

glob('src/css/**/*.scss', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add @use at top if not present
    if (!content.includes('@use "sass:color"')) {
      content = '@use "sass:color";\n\n' + content;
    }
    
    // Replace darken() calls
    content = content.replace(
      /darken\(([^,]+),\s*(\d+)%\)/g,
      'color.scale($1, $lightness: -$2%)'
    );
    
    // Replace lighten() calls
    content = content.replace(
      /lighten\(([^,]+),\s*(\d+)%\)/g,
      'color.scale($1, $lightness: $2%)'
    );
    
    fs.writeFileSync(file, content);
  });
});
```

## Priority
🟡 **Medium** - Fix before next major update, but not urgent

## Notes
- The new `color.scale()` function is more predictable than darken/lighten
- `color.scale()` uses percentages relative to the available range
- `color.adjust()` uses absolute adjustments
- Both require `@use 'sass:color';` at the top of the file
