import { STATUS_OPTIONS, PRIORITY_OPTIONS, CATEGORY_OPTIONS, formatLabel } from '../../utils/issueEnums'

// for staff members to filter the list of issues based on search text, status, priority, and category.
export default function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  onReset,
  total,
  visible,
}) {
  const hasFilters =
    search || (status && status !== 'all') || (priority && priority !== 'all') || (category && category !== 'all')

  return (
    <div className="staff-filter-bar">
      <input
        type="search"
        className="staff-filter-bar__input"
        placeholder="Search title, description, reporter..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search issues"
      />

      <select
        className="staff-filter-bar__select"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>

      <select
        className="staff-filter-bar__select"
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value)}
        aria-label="Filter by priority"
      >
        <option value="all">All priorities</option>
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>

      <select
        className="staff-filter-bar__select"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="staff-filter-bar__reset"
        onClick={onReset}
        disabled={!hasFilters}
      >
        Clear filters
      </button>

      <div className="staff-filter-bar__count">
        Showing <strong>{visible}</strong> of <strong>{total}</strong> issues
      </div>
    </div>
  )
}
