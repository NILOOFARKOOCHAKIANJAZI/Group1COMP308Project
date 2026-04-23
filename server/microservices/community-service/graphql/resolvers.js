// community-service/graphql/resolvers.js
import Comment from '../models/comment.js';
import IssueReaction from '../models/issueReaction.js';
import VolunteerInterest from '../models/volunteerInterest.js';

const privilegedRoles = ['staff', 'advocate'];

const requireAuth = (user) => {
  if (!user) {
    throw new Error('Authentication required.');
  }
};

// Only allow users with privileged roles (staff or advocate) to access certain actions
const requirePrivilegedRole = (user) => {
  requireAuth(user);

  if (!privilegedRoles.includes(user.role)) {
    throw new Error('Only staff or advocate users can perform this action.');
  }
};

const formatComment = (comment) => ({
  id: comment._id.toString(),
  issueId: comment.issueId,
  userId: comment.userId,
  username: comment.username,
  role: comment.role,
  content: comment.content,
  createdAt: comment.createdAt.toISOString(),
  updatedAt: comment.updatedAt.toISOString(),
});

const formatReaction = (reaction) => ({
  id: reaction._id.toString(),
  issueId: reaction.issueId,
  userId: reaction.userId,
  username: reaction.username,
  reactionType: reaction.reactionType,
  createdAt: reaction.createdAt.toISOString(),
  updatedAt: reaction.updatedAt.toISOString(),
});

const formatVolunteerInterest = (volunteerInterest) => ({
  id: volunteerInterest._id.toString(),
  issueId: volunteerInterest.issueId,
  userId: volunteerInterest.userId,
  username: volunteerInterest.username,
  fullName: volunteerInterest.fullName || '',
  contactEmail: volunteerInterest.contactEmail || '',
  message: volunteerInterest.message || '',
  status: volunteerInterest.status,
  createdAt: volunteerInterest.createdAt.toISOString(),
  updatedAt: volunteerInterest.updatedAt.toISOString(),
});

const resolvers = {
  Query: {
    commentsByIssue: async (_, { issueId }) => {
      const comments = await Comment.find({ issueId }).sort({ createdAt: 1 });
      return comments.map(formatComment);
    },

    upvotesByIssue: async (_, { issueId }) => {
      const reactions = await IssueReaction.find({
        issueId,
        reactionType: 'upvote',
      }).sort({ createdAt: -1 });

      return reactions.map(formatReaction);
    },

    // Only privileged users can see volunteer interests for an issue by issue ID
    volunteerInterestsByIssue: async (_, { issueId }, { user }) => {
      requirePrivilegedRole(user);

      const volunteerInterests = await VolunteerInterest.find({ issueId }).sort({ createdAt: -1 });
      return volunteerInterests.map(formatVolunteerInterest);
    },

    // Authenticated users can see their own volunteer interests across all issues
    myVolunteerInterests: async (_, __, { user }) => {
      requireAuth(user);

      const volunteerInterests = await VolunteerInterest.find({ userId: user.userId }).sort({
        createdAt: -1,
      });

      return volunteerInterests.map(formatVolunteerInterest);
    },

    // Get a summary of community engagement for an issue, including total comments, upvotes, and volunteers
    communitySummary: async (_, { issueId }) => {
      const [totalComments, totalUpvotes, totalVolunteers] = await Promise.all([
        Comment.countDocuments({ issueId }),
        IssueReaction.countDocuments({ issueId, reactionType: 'upvote' }),
        VolunteerInterest.countDocuments({ issueId }),
      ]);

      return {
        issueId,
        totalComments,
        totalUpvotes,
        totalVolunteers,
      };
    },
  },

  Mutation: {
    addComment: async (_, { issueId, content }, { user }) => {
      try {
        requireAuth(user);

        const newComment = new Comment({
          issueId,
          userId: user.userId,
          username: user.username,
          role: user.role,
          content: content.trim(),
        });

        await newComment.save();

        return {
          success: true,
          message: 'Comment added successfully.',
          comment: formatComment(newComment),
        };
      } catch (error) {
        console.error('addComment error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to add comment.',
          comment: null,
        };
      }
    },

    // Only allow comment deletion by the comment author or privileged users
    deleteComment: async (_, { commentId }, { user }) => {
      try {
        requireAuth(user);

        const comment = await Comment.findById(commentId);
        if (!comment) {
          return {
            success: false,
            message: 'Comment not found.',
            comment: null,
          };
        }

        const canDelete =
          comment.userId === user.userId || privilegedRoles.includes(user.role);

        if (!canDelete) {
          return {
            success: false,
            message: 'You do not have permission to delete this comment.',
            comment: null,
          };
        }

        await Comment.findByIdAndDelete(commentId);

        return {
          success: true,
          message: 'Comment deleted successfully.',
          comment: formatComment(comment),
        };
      } catch (error) {
        console.error('deleteComment error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to delete comment.',
          comment: null,
        };
      }
    },

    // Authenticated users can upvote an issue, but only once per issue
    addUpvote: async (_, { issueId }, { user }) => {
      try {
        requireAuth(user);

        const existingReaction = await IssueReaction.findOne({
          issueId,
          userId: user.userId,
          reactionType: 'upvote',
        });

        if (existingReaction) {
          return {
            success: false,
            message: 'You have already upvoted this issue.',
            reaction: null,
          };
        }

        const newReaction = new IssueReaction({
          issueId,
          userId: user.userId,
          username: user.username,
          reactionType: 'upvote',
        });

        await newReaction.save();

        return {
          success: true,
          message: 'Upvote added successfully.',
          reaction: formatReaction(newReaction),
        };
      } catch (error) {
        console.error('addUpvote error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to add upvote.',
          reaction: null,
        };
      }
    },

    // users can remove their upvote from an issue
    removeUpvote: async (_, { issueId }, { user }) => {
      try {
        requireAuth(user);

        const reaction = await IssueReaction.findOne({
          issueId,
          userId: user.userId,
          reactionType: 'upvote',
        });

        if (!reaction) {
          return {
            success: false,
            message: 'Upvote not found for this user and issue.',
            reaction: null,
          };
        }

        await IssueReaction.findByIdAndDelete(reaction._id);

        return {
          success: true,
          message: 'Upvote removed successfully.',
          reaction: formatReaction(reaction),
        };
      } catch (error) {
        console.error('removeUpvote error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to remove upvote.',
          reaction: null,
        };
      }
    },

    // Authenticated users can express volunteer interest in an issue
    expressVolunteerInterest: async (_, { input }, { user }) => {
      try {
        requireAuth(user);

        const existingInterest = await VolunteerInterest.findOne({
          issueId: input.issueId,
          userId: user.userId,
        });

        if (existingInterest) {
          return {
            success: false,
            message: 'You have already expressed volunteer interest for this issue.',
            volunteerInterest: null,
          };
        }

        const newVolunteerInterest = new VolunteerInterest({
          issueId: input.issueId,
          userId: user.userId,
          username: user.username,
          fullName: input.fullName || '',
          contactEmail: input.contactEmail || user.email || '',
          message: input.message || '',
          status: 'interested',
        });

        await newVolunteerInterest.save();

        return {
          success: true,
          message: 'Volunteer interest submitted successfully.',
          volunteerInterest: formatVolunteerInterest(newVolunteerInterest),
        };
      } catch (error) {
        console.error('expressVolunteerInterest error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to submit volunteer interest.',
          volunteerInterest: null,
        };
      }
    },

    // Only privileged users can update the status of volunteer interests
    updateVolunteerInterestStatus: async (_, { volunteerInterestId, status }, { user }) => {
      try {
        requirePrivilegedRole(user);

        const volunteerInterest = await VolunteerInterest.findById(volunteerInterestId);
        if (!volunteerInterest) {
          return {
            success: false,
            message: 'Volunteer interest record not found.',
            volunteerInterest: null,
          };
        }

        volunteerInterest.status = status;
        await volunteerInterest.save();

        return {
          success: true,
          message: 'Volunteer interest status updated successfully.',
          volunteerInterest: formatVolunteerInterest(volunteerInterest),
        };
      } catch (error) {
        console.error('updateVolunteerInterestStatus error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to update volunteer interest status.',
          volunteerInterest: null,
        };
      }
    },
  },
};

export default resolvers;