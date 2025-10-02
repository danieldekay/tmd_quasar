import { describe, it, expect } from 'vitest';
import tableColumns from '../../specs/003-content-is-shown/contracts/table-columns.json';

describe('Table Columns Schema Validation', () => {
  it('should load JSON file without errors', () => {
    expect(tableColumns).toBeDefined();
    expect(typeof tableColumns).toBe('object');
  });

  it('should have all 5 content types present', () => {
    expect(tableColumns).toHaveProperty('events');
    expect(tableColumns).toHaveProperty('djs');
    expect(tableColumns).toHaveProperty('teachers');
    expect(tableColumns).toHaveProperty('couples');
    expect(tableColumns).toHaveProperty('eventSeries');
  });

  it('should have metadata fields', () => {
    expect(tableColumns).toHaveProperty('version');
    expect(tableColumns).toHaveProperty('lastUpdated');
    expect(tableColumns.version).toBe('1.0.0');
  });

  describe('Events columns', () => {
    it('should have columns array', () => {
      expect(tableColumns.events).toHaveProperty('columns');
      expect(Array.isArray(tableColumns.events.columns)).toBe(true);
    });

    it('should have exactly 7 columns', () => {
      expect(tableColumns.events.columns).toHaveLength(7);
    });

    it('should have all required fields for each column', () => {
      tableColumns.events.columns.forEach((column: any) => {
        expect(column).toHaveProperty('name');
        expect(column).toHaveProperty('label');
        expect(column).toHaveProperty('field');
        expect(column).toHaveProperty('align');
        expect(column).toHaveProperty('sortable');
        expect(column).toHaveProperty('required');
      });
    });

    it('should have correct column names', () => {
      const columnNames = tableColumns.events.columns.map((col: any) => col.name);
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('start_date');
      expect(columnNames).toContain('end_date');
      expect(columnNames).toContain('city');
      expect(columnNames).toContain('country');
      expect(columnNames).toContain('registration_start_date');
      expect(columnNames).toContain('edition');
    });

    it('should have boolean sortable flags', () => {
      tableColumns.events.columns.forEach((column: any) => {
        expect(typeof column.sortable).toBe('boolean');
      });
    });
  });

  describe('DJs columns', () => {
    it('should have columns array', () => {
      expect(tableColumns.djs).toHaveProperty('columns');
      expect(Array.isArray(tableColumns.djs.columns)).toBe(true);
    });

    it('should have exactly 6 columns', () => {
      expect(tableColumns.djs.columns).toHaveLength(6);
    });

    it('should have all required fields for each column', () => {
      tableColumns.djs.columns.forEach((column: any) => {
        expect(column).toHaveProperty('name');
        expect(column).toHaveProperty('label');
        expect(column).toHaveProperty('field');
        expect(column).toHaveProperty('align');
        expect(column).toHaveProperty('sortable');
        expect(column).toHaveProperty('required');
      });
    });

    it('should have boolean sortable flags', () => {
      tableColumns.djs.columns.forEach((column: any) => {
        expect(typeof column.sortable).toBe('boolean');
      });
    });
  });

  describe('Teachers columns', () => {
    it('should have columns array', () => {
      expect(tableColumns.teachers).toHaveProperty('columns');
      expect(Array.isArray(tableColumns.teachers.columns)).toBe(true);
    });

    it('should have exactly 6 columns', () => {
      expect(tableColumns.teachers.columns).toHaveLength(6);
    });

    it('should have all required fields for each column', () => {
      tableColumns.teachers.columns.forEach((column: any) => {
        expect(column).toHaveProperty('name');
        expect(column).toHaveProperty('label');
        expect(column).toHaveProperty('field');
        expect(column).toHaveProperty('align');
        expect(column).toHaveProperty('sortable');
        expect(column).toHaveProperty('required');
      });
    });
  });

  describe('Couples columns', () => {
    it('should have columns array', () => {
      expect(tableColumns.couples).toHaveProperty('columns');
      expect(Array.isArray(tableColumns.couples.columns)).toBe(true);
    });

    it('should have exactly 6 columns', () => {
      expect(tableColumns.couples.columns).toHaveLength(6);
    });

    it('should have all required fields for each column', () => {
      tableColumns.couples.columns.forEach((column: any) => {
        expect(column).toHaveProperty('name');
        expect(column).toHaveProperty('label');
        expect(column).toHaveProperty('field');
        expect(column).toHaveProperty('align');
        expect(column).toHaveProperty('sortable');
        expect(column).toHaveProperty('required');
      });
    });
  });

  describe('Event Series columns', () => {
    it('should have columns array', () => {
      expect(tableColumns.eventSeries).toHaveProperty('columns');
      expect(Array.isArray(tableColumns.eventSeries.columns)).toBe(true);
    });

    it('should have exactly 6 columns', () => {
      expect(tableColumns.eventSeries.columns).toHaveLength(6);
    });

    it('should have all required fields for each column', () => {
      tableColumns.eventSeries.columns.forEach((column: any) => {
        expect(column).toHaveProperty('name');
        expect(column).toHaveProperty('label');
        expect(column).toHaveProperty('field');
        expect(column).toHaveProperty('align');
        expect(column).toHaveProperty('sortable');
        expect(column).toHaveProperty('required');
      });
    });
  });

  describe('Computed fields', () => {
    it('should have computedFrom property for computed columns', () => {
      const eventsOrganizerColumn = tableColumns.events.columns.find(
        (col: any) => col.name === 'organizer_name',
      );
      if (eventsOrganizerColumn && 'computeFrom' in eventsOrganizerColumn) {
        expect(eventsOrganizerColumn).toHaveProperty('computeFrom');
      }

      const djsActionsColumn = tableColumns.djs.columns.find((col: any) => col.name === 'actions');
      if (djsActionsColumn && 'computeFrom' in djsActionsColumn) {
        expect(djsActionsColumn).toHaveProperty('computeFrom');
      }

      const couplesTeachersColumn = tableColumns.couples.columns.find(
        (col: any) => col.name === 'teachers',
      );
      if (couplesTeachersColumn && 'relationship' in couplesTeachersColumn) {
        expect(couplesTeachersColumn).toHaveProperty('relationship');
      }

      const seriesLocationColumn = tableColumns.eventSeries.columns.find(
        (col: any) => col.name === 'location',
      );
      if (seriesLocationColumn && 'computeFrom' in seriesLocationColumn) {
        expect(seriesLocationColumn).toHaveProperty('computeFrom');
      }
    });
  });

  describe('Data consistency', () => {
    it('should have consistent align values', () => {
      const validAligns = ['left', 'center', 'right'];

      [
        tableColumns.events.columns,
        tableColumns.djs.columns,
        tableColumns.teachers.columns,
        tableColumns.couples.columns,
        tableColumns.eventSeries.columns,
      ].forEach((columns: any[]) => {
        columns.forEach((column: any) => {
          expect(validAligns).toContain(column.align);
        });
      });
    });

    it('should have consistent field types', () => {
      [
        tableColumns.events.columns,
        tableColumns.djs.columns,
        tableColumns.teachers.columns,
        tableColumns.couples.columns,
        tableColumns.eventSeries.columns,
      ].forEach((columns: any[]) => {
        columns.forEach((column: any) => {
          expect(typeof column.name).toBe('string');
          expect(typeof column.label).toBe('string');
          expect(typeof column.field).toBe('string');
          expect(typeof column.align).toBe('string');
          expect(typeof column.sortable).toBe('boolean');
          expect(typeof column.required).toBe('boolean');
        });
      });
    });
  });
});
