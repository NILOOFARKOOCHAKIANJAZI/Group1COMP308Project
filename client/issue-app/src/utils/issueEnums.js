export const STATUS_OPTIONS = [
  'reported',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
]

export const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical']

export const CATEGORY_OPTIONS = [
  'pothole',
  'broken_streetlight',
  'flooding',
  'sidewalk_damage',
  'garbage',
  'graffiti',
  'traffic_signal',
  'safety_hazard',
  'other',
]

export function formatLabel(value) {
  if (!value) return ''
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function statusToneClass(status) {
  const map = {
    reported: 'tone-blue',
    under_review: 'tone-indigo',
    assigned: 'tone-purple',
    in_progress: 'tone-amber',
    resolved: 'tone-green',
    closed: 'tone-slate',
  }
  return map[status] || 'tone-slate'
}

export function priorityToneClass(priority) {
  const map = {
    low: 'tone-slate',
    medium: 'tone-blue',
    high: 'tone-amber',
    critical: 'tone-red',
  }
  return map[priority] || 'tone-slate'
}
