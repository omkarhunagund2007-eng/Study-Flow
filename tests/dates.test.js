import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  daysBetween,
  describeDeadline,
  isValidDateKey,
  lastNDays,
  toDateKey,
} from '../src/utils/dates.js';

test('toDateKey uses the local calendar day and pads numbers', () => {
  assert.equal(toDateKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(toDateKey(new Date(2026, 9, 27, 0, 0)), '2026-10-27');
});

test('isValidDateKey accepts real dates, including leap days', () => {
  assert.equal(isValidDateKey('2026-10-27'), true);
  assert.equal(isValidDateKey('2028-02-29'), true);
});

test('isValidDateKey rejects impossible, malformed and out-of-range dates', () => {
  for (const bad of ['2026-02-30', '2026-02-29', '2026-13-01', '2026-00-10', '2026-1-1', '', null, undefined, 20261027, '1999-12-31', '2101-01-01', '2026-10-27T10:00']) {
    assert.equal(isValidDateKey(bad), false, `expected ${String(bad)} to be invalid`);
  }
});

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
});

test('addDays and daysBetween are not confused by daylight-saving changes', () => {
  assert.equal(addDays('2026-03-08', 1), '2026-03-09');
  assert.equal(addDays('2026-11-01', 1), '2026-11-02');
  assert.equal(daysBetween('2026-03-07', '2026-03-10'), 3);
  assert.equal(daysBetween('2026-10-31', '2026-11-03'), 3);
});

test('daysBetween is negative when the second date is earlier', () => {
  assert.equal(daysBetween('2026-10-27', '2026-10-25'), -2);
  assert.equal(daysBetween('2026-10-27', '2026-10-27'), 0);
});

test('lastNDays returns n keys, oldest first, ending on the given day', () => {
  assert.deepEqual(lastNDays(7, '2026-10-27'), [
    '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27',
  ]);
  assert.deepEqual(lastNDays(3, '2026-01-01'), ['2025-12-30', '2025-12-31', '2026-01-01']);
});

test('describeDeadline words match the distance from today', () => {
  const today = '2026-10-27';
  assert.equal(describeDeadline('2026-10-27', today), 'Due today');
  assert.equal(describeDeadline('2026-10-28', today), 'Due tomorrow');
  assert.equal(describeDeadline('2026-10-30', today), 'Due in 3 days');
  assert.equal(describeDeadline('2026-10-26', today), 'Overdue by 1 day');
  assert.equal(describeDeadline('2026-10-20', today), 'Overdue by 7 days');
});
