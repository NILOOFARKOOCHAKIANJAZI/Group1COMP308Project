const PRIVILEGED_ROLES = ['staff', 'advocate']

export function isPrivileged(user) {
  return PRIVILEGED_ROLES.includes(user?.role)
}

export function getInitials(source) {
  if (!source) return '?'
  const parts = String(source).trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function roleClass(prefix, role) {
  const normalized = ['resident', 'staff', 'advocate'].includes(role) ? role : 'resident'
  return `${prefix}--${normalized}`
}

export function statusClass(prefix, status) {
  const normalized = ['interested', 'contacted', 'matched', 'closed'].includes(status)
    ? status
    : 'interested'
  return `${prefix}--${normalized}`
}

export function formatRelativeOrDate(isoString) {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`
    if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`
    if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

export function formatDateTime(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}
