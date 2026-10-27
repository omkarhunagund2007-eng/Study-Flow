import { PRIORITIES } from '../utils/constants.js';
import Icon from './Icon.jsx';

/**
 * Search box + dropdown filters + sorting. It is a "controlled" component:
 * it owns no state. The values come in as `filters`, and every change is
 * reported with onChange({ key: newValue }).
 */
export default function TaskFilters({ filters, subjects, onChange, onClear, canClear }) {
  return (
    <form className="filters card" role="search" aria-label="Search and filter tasks" onSubmit={(event) => event.preventDefault()}>
      <div className="field filters__search">
        <label htmlFor="task-search">Search by title</label>
        <div className="input-with-icon">
          <Icon name="search" size={18} />
          <input
            id="task-search"
            type="search"
            value={filters.search}
            placeholder="Search tasks"
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="filter-subject">Subject</label>
        <select id="filter-subject" value={filters.subject} onChange={(event) => onChange({ subject: event.target.value })}>
          <option value="all">All subjects</option>
          <option value="none">No subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-priority">Priority</label>
        <select id="filter-priority" value={filters.priority} onChange={(event) => onChange({ priority: event.target.value })}>
          <option value="all">All priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-status">Status</label>
        <select id="filter-status" value={filters.status} onChange={(event) => onChange({ status: event.target.value })}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-deadline">Deadline</label>
        <select id="filter-deadline" value={filters.deadline} onChange={(event) => onChange({ deadline: event.target.value })}>
          <option value="all">Any deadline</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="week">Next 7 days</option>
          <option value="later">More than 7 days away</option>
        </select>
      </div>

      <div className="field filters__sort">
        <label htmlFor="filter-sort">Sort by</label>
        <select id="filter-sort" value={filters.sort} onChange={(event) => onChange({ sort: event.target.value })}>
          <option value="deadline-asc">Earliest deadline first</option>
          <option value="deadline-desc">Latest deadline first</option>
        </select>
      </div>

      {canClear && (
        <div className="filters__clear">
          <button type="button" className="btn btn--ghost" onClick={onClear}>
            <Icon name="x" size={16} />
            <span>Clear filters</span>
          </button>
        </div>
      )}
    </form>
  );
}
