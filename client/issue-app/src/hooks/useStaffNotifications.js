import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_ISSUES } from '../graphql/queries/staffQueries'

const SEEN_KEY_PREFIX = 'civiccase_staff_notif_seen_'

function readSeenIds(userId) {
  if (!userId) return new Set()
  try {
    const raw = localStorage.getItem(`${SEEN_KEY_PREFIX}${userId}`)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed) : new Set()
  } catch {
    return new Set()
  }
}

function writeSeenIds(userId, ids) {
  if (!userId) return
  try {
    localStorage.setItem(`${SEEN_KEY_PREFIX}${userId}`, JSON.stringify([...ids]))
  } catch {
    // storage failures are non-fatal for this UX
  }
}

function buildMessage(issue) {
  const where = issue.location?.neighborhood || issue.location?.address || ''
  const suffix = where ? ` in ${where}` : ''
  return `New issue reported: "${issue.title}"${suffix}.`
}

export default function useStaffNotifications({ userId, enabled } = {}) {
  const [seenIds, setSeenIds] = useState(() => readSeenIds(userId))

  useEffect(() => {
    setSeenIds(readSeenIds(userId))
  }, [userId])

  const { data, loading, error, refetch } = useQuery(ALL_ISSUES, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
    skip: !enabled || !userId,
    notifyOnNetworkStatusChange: true,
  })

  const issues = useMemo(() => data?.allIssues ?? [], [data])

  const notifications = useMemo(() => {
    return issues
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((issue) => ({
        id: issue.id,
        userId: userId || '',
        issueId: issue.id,
        message: buildMessage(issue),
        type: issue.urgentAlert ? 'urgent_alert' : 'general',
        isRead: seenIds.has(issue.id),
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt || issue.createdAt,
        reporter: issue.reportedByUsername,
        category: issue.category,
        priority: issue.priority,
      }))
  }, [issues, seenIds, userId])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  )

  const markAsRead = useCallback(
    (id) => {
      setSeenIds((prev) => {
        if (prev.has(id)) return prev
        const next = new Set(prev)
        next.add(id)
        writeSeenIds(userId, next)
        return next
      })
    },
    [userId],
  )

  const markAllAsRead = useCallback(() => {
    setSeenIds((prev) => {
      const next = new Set(prev)
      notifications.forEach((n) => next.add(n.id))
      writeSeenIds(userId, next)
      return next
    })
  }, [userId, notifications])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    error,
    refetch,
  }
}
