import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_ISSUES } from '../../graphql/queries/staffQueries'
import StatsStrip from '../../components/staff/StatsStrip'
import FilterBar from '../../components/staff/FilterBar'
import IssueTable from '../../components/staff/IssueTable'

const PRIORITY_RANK = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function getPriorityRank(priority) {
  const rank = PRIORITY_RANK[priority]
  return rank == null ? 99 : rank
}

function triageCompare(a, b) {
  if (Boolean(a.urgentAlert) !== Boolean(b.urgentAlert)) {
    return a.urgentAlert ? -1 : 1
  }

  const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority)
  if (priorityDiff !== 0) return priorityDiff

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export default function AllIssuesPage() {
  const { data, loading, error } = useQuery(ALL_ISSUES, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
  })

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [category, setCategory] = useState('all')

  const allIssues = data?.allIssues ?? []

  const filteredIssues = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = allIssues.filter((issue) => {
      if (status !== 'all' && issue.status !== status) return false
      if (priority !== 'all' && issue.priority !== priority) return false
      if (category !== 'all' && issue.category !== category) return false

      if (normalizedSearch) {
        const haystack = [
          issue.title,
          issue.description,
          issue.reportedByUsername,
          issue.assignedToUsername,
          issue.location?.address,
          issue.location?.neighborhood,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(normalizedSearch)) return false
      }

      return true
    })

    return [...filtered].sort(triageCompare)
  }, [allIssues, search, status, priority, category])

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setPriority('all')
    setCategory('all')
  }

  return (
    <div>
      <header className="staff-page-header">
        <div className="staff-page-header__title-group">
          <span className="staff-page-header__eyebrow">Operations</span>
          <h1 className="staff-page-header__title">Issue management dashboard</h1>
          <p className="staff-page-header__subtitle">
            Sorted by triage order: urgent first, then highest priority, then newest. Monitor, assign, and resolve community-reported issues across the city.
          </p>
        </div>
      </header>

      <StatsStrip issues={allIssues} />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        category={category}
        onCategoryChange={setCategory}
        onReset={handleReset}
        total={allIssues.length}
        visible={filteredIssues.length}
      />

      {loading && !data && <div className="staff-loading">Loading issues</div>}

      {error && (
        <div className="staff-message staff-message--error">
          Failed to load issues. {error.message}
        </div>
      )}

      {!loading && !error && allIssues.length === 0 && (
        <div className="staff-empty">
          <span className="staff-empty__title">No issues yet</span>
          Once residents start reporting issues they will appear here for triage.
        </div>
      )}

      {allIssues.length > 0 && <IssueTable issues={filteredIssues} />}
    </div>
  )
}
