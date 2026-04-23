import { useQuery } from '@apollo/client/react'
import { URGENT_ISSUES } from '../../graphql/queries/staffQueries'
import IssueTable from '../../components/staff/IssueTable'

export default function UrgentIssuesPage() {
  const { data, loading, error } = useQuery(URGENT_ISSUES, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 10000,
  })

  const urgent = data?.urgentIssues ?? []

  return (
    <div>
      <header className="staff-page-header">
        <div className="staff-page-header__title-group">
          <span className="staff-page-header__eyebrow">Priority queue</span>
          <h1 className="staff-page-header__title">Urgent issues</h1>
          <p className="staff-page-header__subtitle">
            Issues flagged as urgent by staff, awaiting rapid triage and resolution.
          </p>
        </div>
      </header>

      {loading && !data && <div className="staff-loading">Loading urgent issues</div>}

      {error && (
        <div className="staff-message staff-message--error">
          Failed to load urgent issues. {error.message}
        </div>
      )}

      {!loading && !error && urgent.length === 0 && (
        <div className="staff-empty">
          <span className="staff-empty__title">Nothing urgent right now</span>
          Flag any issue from its detail page when it needs priority handling.
        </div>
      )}

      {urgent.length > 0 && <IssueTable issues={urgent} />}
    </div>
  )
}
