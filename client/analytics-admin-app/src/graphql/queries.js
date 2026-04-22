import { gql } from '@apollo/client'

export const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalIssues
      openIssues
      urgentIssues
      resolvedIssues
      totalComments
      totalUpvotes
      totalVolunteerInterests
    }
  }
`

export const ISSUES_BY_CATEGORY_QUERY = gql`
  query IssuesByCategory {
    issuesByCategory {
      category
      count
    }
  }
`

export const NEIGHBORHOOD_HOTSPOTS_QUERY = gql`
  query NeighborhoodHotspots {
    neighborhoodHotspots {
      neighborhood
      count
    }
  }
`

export const RECENT_AI_INSIGHT_LOGS_QUERY = gql`
  query RecentAiInsightLogs($limit: Int) {
    recentAiInsightLogs(limit: $limit) {
      id
      insightType
      relatedIssueId
      requestedByUserId
      requestedByUsername
      prompt
      responseText
      metadata
      createdAt
      updatedAt
    }
  }
`

export const TREND_INSIGHTS_QUERY = gql`
  query TrendInsights {
    trendInsights {
      success
      message
      text
    }
  }
`

export const CHATBOT_QUERY = gql`
  query Chatbot($question: [MessageInput!]!) {
    chatbotQuery(question: $question) {
      text
      success
      message
    }
  }
`

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      fullName
      username
      email
      role
      createdAt
      updatedAt
    }
  }
`