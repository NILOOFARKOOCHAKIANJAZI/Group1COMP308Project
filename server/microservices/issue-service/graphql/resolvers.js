// issue-service/graphql/resolvers.js
import Issue from '../models/issue.js';
import Notification from '../models/notification.js';

const staffRoles = ['staff', 'advocate'];

const formatIssue = (issue) => ({
  id: issue._id.toString(),
  title: issue.title,
  description: issue.description,
  category: issue.category,
  aiCategory: issue.aiCategory || '',
  aiSummary: issue.aiSummary || '',
  priority: issue.priority,
  status: issue.status,
  photoUrl: issue.photoUrl || '',
  location: {
    address: issue.location?.address || '',
    latitude: issue.location?.latitude ?? null,
    longitude: issue.location?.longitude ?? null,
    neighborhood: issue.location?.neighborhood || '',
  },
  reportedBy: issue.reportedBy,
  reportedByUsername: issue.reportedByUsername,
  assignedTo: issue.assignedTo || '',
  assignedToUsername: issue.assignedToUsername || '',
  urgentAlert: issue.urgentAlert,
  internalNotes: issue.internalNotes || '',
  createdAt: issue.createdAt.toISOString(),
  updatedAt: issue.updatedAt.toISOString(),
});

const formatNotification = (notification) => ({
  id: notification._id.toString(),
  userId: notification.userId,
  issueId: notification.issueId,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  createdAt: notification.createdAt.toISOString(),
  updatedAt: notification.updatedAt.toISOString(),
});

const requireAuth = (user) => {
  if (!user) {
    throw new Error('Authentication required.');
  }
};

// Only allow staff or advocate users to perform certain actions
const requireStaffOrAdvocate = (user) => {
  requireAuth(user);

  if (!staffRoles.includes(user.role)) {
    throw new Error('Only staff or advocate users can perform this action.');
  }
};

const createNotification = async ({ userId, issueId, message, type }) => {
  const notification = new Notification({
    userId,
    issueId,
    message,
    type,
  });

  await notification.save();
  return notification;
};

const resolvers = {
  Query: {
    // Get issues reported by the authenticated user with userId from JWT token
    myIssues: async (_, __, { user }) => {
      requireAuth(user);

      const issues = await Issue.find({ reportedBy: user.userId }).sort({ createdAt: -1 });
      return issues.map(formatIssue);
    },

    allIssues: async (_, __, { user }) => {
      requireStaffOrAdvocate(user);

      const issues = await Issue.find({}).sort({ createdAt: -1 });
      return issues.map(formatIssue);
    },

    // Get issue by ID with access control based on user role and ownership
    issueById: async (_, { id }, { user }) => {
      requireAuth(user);

      const issue = await Issue.findById(id);
      if (!issue) {
        throw new Error('Issue not found.');
      }

      const canAccess =
        issue.reportedBy === user.userId || staffRoles.includes(user.role);

      if (!canAccess) {
        throw new Error('You do not have permission to view this issue.');
      }

      return formatIssue(issue);
    },

    // Get urgent issues for staff and advocate users
    urgentIssues: async (_, __, { user }) => {
      requireStaffOrAdvocate(user);

      const issues = await Issue.find({ urgentAlert: true }).sort({ updatedAt: -1 });
      return issues.map(formatIssue);
    },

    notifications: async (_, __, { user }) => {
      requireAuth(user);

      const notifications = await Notification.find({ userId: user.userId }).sort({ createdAt: -1 });
      return notifications.map(formatNotification);
    },
  },

  Mutation: {
    // Report a new issue with the user's information from JWT token
    reportIssue: async (_, { input }, { user }) => {
      try {
        requireAuth(user);

        const newIssue = new Issue({
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category || 'other',
          aiCategory: input.aiCategory || '',
          aiSummary: input.aiSummary || '',
          priority: input.priority || 'medium',
          photoUrl: input.photoUrl || '',
          location: {
            address: input.location?.address || '',
            latitude: input.location?.latitude ?? null,
            longitude: input.location?.longitude ?? null,
            neighborhood: input.location?.neighborhood || '',
          },
          reportedBy: user.userId,
          reportedByUsername: user.username,
          status: 'reported',
        });

        await newIssue.save();

        await createNotification({
          userId: user.userId,
          issueId: newIssue._id.toString(),
          message: `Your issue "${newIssue.title}" has been submitted successfully.`,
          type: 'general',
        });

        return {
          success: true,
          message: 'Issue reported successfully.',
          issue: formatIssue(newIssue),
        };
      } catch (error) {
        console.error('reportIssue error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to report issue.',
          issue: null,
        };
      }
    },

    // Update issue status with access control
    updateIssueStatus: async (_, { issueId, status, internalNotes }, { user }) => {
      try {
        requireStaffOrAdvocate(user);

        const issue = await Issue.findById(issueId);
        if (!issue) {
          return {
            success: false,
            message: 'Issue not found.',
            issue: null,
          };
        }

        issue.status = status;
        if (typeof internalNotes === 'string') {
          issue.internalNotes = internalNotes.trim();
        }

        await issue.save();

        await createNotification({
          userId: issue.reportedBy,
          issueId: issue._id.toString(),
          message: `The status of your issue "${issue.title}" has been updated to "${issue.status}".`,
          type: 'status_update',
        });

        return {
          success: true,
          message: 'Issue status updated successfully.',
          issue: formatIssue(issue),
        };
      } catch (error) {
        console.error('updateIssueStatus error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to update issue status.',
          issue: null,
        };
      }
    },

    // Assign issue to other user with access control
    assignIssue: async (_, { issueId, assignedTo, assignedToUsername }, { user }) => {
      try {
        requireStaffOrAdvocate(user);

        const issue = await Issue.findById(issueId);
        if (!issue) {
          return {
            success: false,
            message: 'Issue not found.',
            issue: null,
          };
        }

        issue.assignedTo = assignedTo;
        issue.assignedToUsername = assignedToUsername;
        issue.status = 'assigned';

        await issue.save();

        await createNotification({
          userId: issue.reportedBy,
          issueId: issue._id.toString(),
          message: `Your issue "${issue.title}" has been assigned to municipal staff.`,
          type: 'assignment',
        });

        return {
          success: true,
          message: 'Issue assigned successfully.',
          issue: formatIssue(issue),
        };
      } catch (error) {
        console.error('assignIssue error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to assign issue.',
          issue: null,
        };
      }
    },

    // Mark issue as urgent and create notification for the reporter
    markUrgent: async (_, { issueId, urgentAlert }, { user }) => {
      try {
        requireStaffOrAdvocate(user);

        const issue = await Issue.findById(issueId);
        if (!issue) {
          return {
            success: false,
            message: 'Issue not found.',
            issue: null,
          };
        }

        issue.urgentAlert = urgentAlert;
        await issue.save();

        if (urgentAlert) {
          await createNotification({
            userId: issue.reportedBy,
            issueId: issue._id.toString(),
            message: `Urgent alert: Your issue "${issue.title}" has been marked as urgent by city staff.`,
            type: 'urgent_alert',
          });
        }

        return {
          success: true,
          message: urgentAlert
            ? 'Issue marked as urgent successfully.'
            : 'Urgent alert removed successfully.',
          issue: formatIssue(issue),
        };
      } catch (error) {
        console.error('markUrgent error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to update urgent alert.',
          issue: null,
        };
      }
    },

    // Mark notification as read  and ensure users can only modify their own notifications
    markNotificationAsRead: async (_, { notificationId }, { user }) => {
      try {
        requireAuth(user);

        const notification = await Notification.findById(notificationId);
        if (!notification) {
          return {
            success: false,
            message: 'Notification not found.',
            notification: null,
          };
        }

        if (notification.userId !== user.userId) {
          return {
            success: false,
            message: 'You do not have permission to modify this notification.',
            notification: null,
          };
        }

        notification.isRead = true;
        await notification.save();

        return {
          success: true,
          message: 'Notification marked as read.',
          notification: formatNotification(notification),
        };
      } catch (error) {
        console.error('markNotificationAsRead error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to update notification.',
          notification: null,
        };
      }
    },
  },
};

export default resolvers;