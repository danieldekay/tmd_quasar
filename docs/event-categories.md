# Event Category Color Coding

The TMD Quasar app uses a comprehensive color coding system for event categories to help users quickly identify different types of tango events.

## Color Scheme

### Marathon Events

- **Marathon** - Red (`red-7`) with running icon
- **Tango Marathon** - Red (`red-7`) with running icon
- **Milonga Marathon** - Dark Red (`red-8`) with running icon

### Festival Events

- **Festival** - Purple (`purple-6`) with celebration icon
- **Tango Festival** - Purple (`purple-6`) with celebration icon
- **Music Festival** - Dark Purple (`purple-7`) with music note icon

### Encuentro Events

- **Encuentro** - Blue (`blue-6`) with groups icon
- **Tango Encuentro** - Blue (`blue-6`) with groups icon
- **Milonga Encuentro** - Dark Blue (`blue-7`) with groups icon

### Weekend Events

- **Weekend** - Green (`green-6`) with weekend icon
- **Tango Weekend** - Green (`green-6`) with weekend icon
- **Milonga Weekend** - Dark Green (`green-7`) with weekend icon

### Educational Events

- **Workshop** - Orange (`orange-6`) with school icon
- **Masterclass** - Dark Orange (`orange-7`) with star icon
- **Seminar** - Light Orange (`orange-5`) with psychology icon

### Competition Events

- **Competition** - Amber (`amber-7`) with trophy icon
- **Championship** - Dark Amber (`amber-8`) with trophy icon
- **Contest** - Light Amber (`amber-6`) with trophy icon

### Social Events

- **Milonga** - Teal (`teal-6`) with music note icon
- **Practica** - Light Teal (`teal-5`) with fitness icon
- **Social** - Dark Teal (`teal-7`) with people icon

### Special Occasions

- **New Year** - Indigo (`indigo-6`) with celebration icon
- **Christmas** - Red (`red-6`) with celebration icon
- **Valentine** - Pink (`pink-6`) with heart icon
- **Anniversary** - Deep Purple (`deep-purple-6`) with cake icon

### Default

- **Other/Unknown** - Grey (`grey-6`) with event icon

## Implementation

The color coding is implemented in `src/composables/useFormatters.ts` using the `getCategoryColor()` and `getEventCategoryColor()` functions. The system:

1. **Exact Match**: First tries to match the category name exactly
2. **Partial Match**: Falls back to partial matching for compound categories
3. **Default**: Uses grey color for unknown categories

## Usage

The colored category chips appear in:

- Event list cards (mobile view)
- Event list table (desktop view)
- Event detail pages
- Event hero sections

Each chip includes:

- Color-coded background
- Appropriate text color (white/black for contrast)
- Relevant icon
- Category name
