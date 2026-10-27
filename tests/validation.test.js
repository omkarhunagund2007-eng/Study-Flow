import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDurations, validateSubject, validateTask } from '../src/utils/validation.js';

const subjects = [
  { id: 's1', name: 'Math', color: '#6366f1' },
  { id: 's2', name: 'Physics', color: '#0d9488' },
];
const goodTask = { title: 'Read chapter 4', description: '', subjectId: 's1', deadline: '2026-11-01', priority: 'high' };

test('a complete task is valid and its text is trimmed', () => {
  const { errors, values } = validateTask({ ...goodTask, title: '  Read chapter 4  ' }, { subjects });
  assert.deepEqual(errors, {});
  assert.equal(values.title, 'Read chapter 4');
});

test('title is required, even if it is only spaces', () => {
  assert.ok(validateTask({ ...goodTask, title: '' }, { subjects }).errors.title);
  assert.ok(validateTask({ ...goodTask, title: '    ' }, { subjects }).errors.title);
});

test('title and description length limits are enforced', () => {
  assert.ok(validateTask({ ...goodTask, title: 'a'.repeat(101) }, { subjects }).errors.title);
  assert.equal(validateTask({ ...goodTask, title: 'a'.repeat(100) }, { subjects }).errors.title, undefined);
  assert.ok(validateTask({ ...goodTask, description: 'a'.repeat(501) }, { subjects }).errors.description);
});

test('deadline must be present and a real date', () => {
  assert.ok(validateTask({ ...goodTask, deadline: '' }, { subjects }).errors.deadline);
  assert.ok(validateTask({ ...goodTask, deadline: '2026-02-30' }, { subjects }).errors.deadline);
  assert.ok(validateTask({ ...goodTask, deadline: 'tomorrow' }, { subjects }).errors.deadline);
});

test('priority must be high, medium or low', () => {
  assert.ok(validateTask({ ...goodTask, priority: 'urgent' }, { subjects }).errors.priority);
  assert.ok(validateTask({ ...goodTask, priority: undefined }, { subjects }).errors.priority);
});

test('subject is optional, but must exist when given', () => {
  const none = validateTask({ ...goodTask, subjectId: '' }, { subjects });
  assert.deepEqual(none.errors, {});
  assert.equal(none.values.subjectId, null);
  assert.ok(validateTask({ ...goodTask, subjectId: 'missing' }, { subjects }).errors.subjectId);
});

test('subject names are trimmed, required and limited to 30 characters', () => {
  assert.ok(validateSubject({ name: '   ', color: '#6366f1' }).errors.name);
  assert.ok(validateSubject({ name: 'x'.repeat(31), color: '#6366f1' }).errors.name);
  assert.equal(validateSubject({ name: '  Linear   Algebra ', color: '#6366f1' }).values.name, 'Linear Algebra');
});

test('duplicate subject names are rejected regardless of case or extra spaces', () => {
  assert.ok(validateSubject({ name: 'math', color: '#6366f1' }, { subjects }).errors.name);
  assert.ok(validateSubject({ name: ' PHYSICS ', color: '#6366f1' }, { subjects }).errors.name);
  assert.deepEqual(validateSubject({ name: 'Chemistry', color: '#6366f1' }, { subjects }).errors, {});
});

test('a subject may keep its own name while being edited', () => {
  assert.deepEqual(validateSubject({ name: 'Math', color: '#2f80ed' }, { subjects, editingId: 's1' }).errors, {});
  assert.ok(validateSubject({ name: 'Physics', color: '#2f80ed' }, { subjects, editingId: 's1' }).errors.name);
});

test('subject color must come from the palette', () => {
  assert.ok(validateSubject({ name: 'Art', color: '#123456' }).errors.color);
});

test('durations accept whole numbers inside the allowed ranges (text input too)', () => {
  const { errors, values } = validateDurations({ focus: '30', short: '10', long: 20 });
  assert.deepEqual(errors, {});
  assert.deepEqual(values, { focus: 30, short: 10, long: 20 });
});

test('durations reject empty, decimal, text, zero and too-large values', () => {
  assert.ok(validateDurations({ focus: '', short: '5', long: '15' }).errors.focus);
  assert.ok(validateDurations({ focus: '2.5', short: '5', long: '15' }).errors.focus);
  assert.ok(validateDurations({ focus: 'abc', short: '5', long: '15' }).errors.focus);
  assert.ok(validateDurations({ focus: '0', short: '5', long: '15' }).errors.focus);
  assert.ok(validateDurations({ focus: '181', short: '5', long: '15' }).errors.focus);
  assert.ok(validateDurations({ focus: '25', short: '61', long: '15' }).errors.short);
  assert.ok(validateDurations({ focus: '25', short: '5', long: '-3' }).errors.long);
});
