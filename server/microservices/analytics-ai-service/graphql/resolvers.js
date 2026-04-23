// analytics-ai-service/graphql/resolvers.js
import mongoose from 'mongoose';

import { GoogleGenAI } from '@google/genai';
import { StateGraph, START, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { DynamicTool } from '@langchain/core/tools';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

import AIInsightLog from '../models/aiInsightLog.js';
import { config } from '../config/config.js';

const privilegedRoles = ['staff', 'advocate'];
const OPEN_STATUSES = ['reported', 'under_review', 'assigned', 'in_progress'];

const requireAuth = (user) => {
  if (!user) {
    throw new Error('Authentication required.');
  }
};

const requirePrivilegedRole = (user) => {
  requireAuth(user);

  if (!privilegedRoles.includes(user.role)) {
    throw new Error('Only staff or advocate users can perform this action.');
  }
};

const formatAIInsightLog = (log) => ({
  id: log._id.toString(),
  insightType: log.insightType,
  relatedIssueId: log.relatedIssueId || '',
  requestedByUserId: log.requestedByUserId || '',
  requestedByUsername: log.requestedByUsername || '',
  prompt: log.prompt,
  responseText: log.responseText,
  metadata: JSON.stringify(log.metadata || {}),
  createdAt: log.createdAt.toISOString(),
  updatedAt: log.updatedAt.toISOString(),
});

let issueConnection = null;
let communityConnection = null;
let IssueModel = null;
let CommentModel = null;
let IssueReactionModel = null;
let VolunteerInterestModel = null;

//Manage database connections and models for issues
const getIssueConnection = async () => {
  if (issueConnection) {
    return issueConnection;
  }

  issueConnection = await mongoose.createConnection(config.issueDb).asPromise();

  const issueSchema = new mongoose.Schema(
    {
      title: String,
      description: String,
      category: String,
      aiCategory: String,
      aiSummary: String,
      priority: String,
      status: String,
      urgentAlert: Boolean,
      location: {
        address: String,
        latitude: Number,
        longitude: Number,
        neighborhood: String,
      },
      reportedBy: String,
      reportedByUsername: String,
      assignedTo: String,
      assignedToUsername: String,
      internalNotes: String,
    },
    { timestamps: true, strict: false }
  );

  IssueModel = issueConnection.models.Issue || issueConnection.model('Issue', issueSchema);
  return issueConnection;
};

//Manage database connections and models for community data, including comments, issue reactions, and volunteer interests
const getCommunityConnection = async () => {
  if (communityConnection) {
    return communityConnection;
  }

  communityConnection = await mongoose.createConnection(config.communityDb).asPromise();

  const commentSchema = new mongoose.Schema(
    {
      issueId: String,
      userId: String,
      username: String,
      role: String,
      content: String,
    },
    { timestamps: true, strict: false }
  );

  const issueReactionSchema = new mongoose.Schema(
    {
      issueId: String,
      userId: String,
      username: String,
      reactionType: String,
    },
    { timestamps: true, strict: false }
  );

  const volunteerInterestSchema = new mongoose.Schema(
    {
      issueId: String,
      userId: String,
      username: String,
      fullName: String,
      contactEmail: String,
      message: String,
      status: String,
    },
    { timestamps: true, strict: false }
  );

  CommentModel =
    communityConnection.models.Comment || communityConnection.model('Comment', commentSchema);

  IssueReactionModel =
    communityConnection.models.IssueReaction ||
    communityConnection.model('IssueReaction', issueReactionSchema);

  VolunteerInterestModel =
    communityConnection.models.VolunteerInterest ||
    communityConnection.model('VolunteerInterest', volunteerInterestSchema);

  return communityConnection;
};

const ensureAnalyticsSources = async () => {
  await Promise.all([getIssueConnection(), getCommunityConnection()]);
};

// Get a configured Gemini client or return null if API key is missing
const getGeminiClient = () => {
  if (!config.geminiApiKey) {
    return null;
  }

  return new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });
};

const extractJsonObject = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

// Fallback classification logic based on keyword matching for common issues
const fallbackClassification = (title, description) => {
  const combined = `${title} ${description}`.toLowerCase();

  if (combined.includes('pothole')) {
    return {
      category: 'pothole',
      priority: 'high',
      summary: 'Road damage reported that may affect vehicles and pedestrian safety.',
    };
  }

  if (combined.includes('streetlight') || combined.includes('light')) {
    return {
      category: 'broken_streetlight',
      priority: 'high',
      summary: 'Lighting-related issue reported with possible nighttime safety impact.',
    };
  }

  if (combined.includes('flood') || combined.includes('water')) {
    return {
      category: 'flooding',
      priority: 'critical',
      summary: 'Water or flooding issue reported that may affect access and safety.',
    };
  }

  if (combined.includes('sidewalk')) {
    return {
      category: 'sidewalk_damage',
      priority: 'medium',
      summary: 'Sidewalk damage reported that may affect accessibility and pedestrian movement.',
    };
  }

  if (combined.includes('signal') || combined.includes('traffic')) {
    return {
      category: 'traffic_signal',
      priority: 'high',
      summary: 'Traffic-related public safety issue reported.',
    };
  }

  return {
    category: 'other',
    priority: 'medium',
    summary: 'Community issue reported and categorized for municipal review.',
  };
};

// Function to log AI insights to the database for auditing and analysis
const logInsight = async ({
  insightType,
  relatedIssueId = '',
  requestedByUserId = '',
  requestedByUsername = '',
  prompt,
  responseText,
  metadata = {},
}) => {
  const log = new AIInsightLog({
    insightType,
    relatedIssueId,
    requestedByUserId,
    requestedByUsername,
    prompt,
    responseText,
    metadata,
  });

  await log.save();
  return log;
};

// Generate text using Gemini with error handling and fallback
const generateTextWithGemini = async (prompt, fallbackText) => {
  const client = getGeminiClient();

  if (!client) {
    return fallbackText;
  }

  try {
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
    });

    //preventing errors if response.text is not a string or is missing
    const text = typeof response?.text === 'string' ? response.text.trim() : '';

    return text || fallbackText;
  } catch (error) {
    console.error('Gemini generateContent error:', error.message);
    return fallbackText;
  }
};

const getIssueDocuments = async () => {
  await ensureAnalyticsSources();
  return IssueModel.find({}).sort({ createdAt: -1 }).lean();
};

const getCommunityDocuments = async () => {
  await ensureAnalyticsSources();

  const [comments, reactions, volunteerInterests] = await Promise.all([
    CommentModel.find({}).lean(),
    IssueReactionModel.find({}).lean(),
    VolunteerInterestModel.find({}).lean(),
  ]);

  return { comments, reactions, volunteerInterests };
};

// Build a text dataset for the issue trend analysis prompt
const buildIssueDatasetText = (issues, comments, reactions, volunteerInterests) => {
  return issues
    .slice(0, 50)
    .map((issue) => {
      const issueComments = comments.filter((comment) => comment.issueId === issue._id.toString());
      const issueUpvotes = reactions.filter(
        (reaction) =>
          reaction.issueId === issue._id.toString() && reaction.reactionType === 'upvote'
      );
      const issueVolunteers = volunteerInterests.filter(
        (volunteer) => volunteer.issueId === issue._id.toString()
      );

      return [
        `Issue ID: ${issue._id.toString()}`,
        `Title: ${issue.title || ''}`,
        `Description: ${issue.description || ''}`,
        `Category: ${issue.category || issue.aiCategory || 'other'}`,
        `Priority: ${issue.priority || 'medium'}`,
        `Status: ${issue.status || 'reported'}`,
        `Urgent: ${Boolean(issue.urgentAlert)}`,
        `Neighborhood: ${issue.location?.neighborhood || 'Unknown'}`,
        `Comments: ${issueComments.length}`,
        `Upvotes: ${issueUpvotes.length}`,
        `Volunteer Interests: ${issueVolunteers.length}`,
      ].join(' | ');
    })
    .join('\n');
};

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatIssueLine = (issue) => {
  const category = issue.category || issue.aiCategory || 'other';
  const neighborhood = issue.location?.neighborhood || 'Unknown';
  const status = issue.status || 'reported';
  const priority = issue.priority || 'medium';
  const urgentTag = issue.urgentAlert ? ' | URGENT' : '';

  return `- id: ${issue._id} [${String(category).toUpperCase()}] ${issue.title || 'Untitled issue'} in ${neighborhood} is currently ${String(
    status
  ).toUpperCase()} | priority: ${String(priority).toUpperCase()}${urgentTag}`;
};

const extractKeyword = (query) => {
  const raw = String(query || '').toLowerCase().trim();

  if (!raw) {
    return '';
  }

  const cleaned = raw
    .replace(/[^\w\s-]/g, ' ')
    .replace(
      /\b(show|find|search|list|get|me|the|all|any|for|with|without|issues?|issue|open|closed|resolved|currently|please|about|need|needs|volunteers?|volunteer|community|local)\b/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || raw;
};

// Define Tools for the AI agent to interact with the issue data by searching, filtering, and summarizing issues based on natural language queries and criteria
const issueSearchTool = new DynamicTool({
  name: 'search_community_issues',
  description:
    'Searches for local issues by keyword across title, description, category, AI category, neighborhood, priority, and status. Input should be a natural-language civic issue query.',
  func: async (query) => {
    await ensureAnalyticsSources();

    const rawQuery = String(query || '').trim();
    const keyword = extractKeyword(rawQuery);
    const searchTerm = keyword || rawQuery;

    let filter = {};

    if (searchTerm) {
      const safeRegex = new RegExp(escapeRegex(searchTerm), 'i');
      filter = {
        $or: [
          { title: safeRegex },
          { description: safeRegex },
          { category: safeRegex },
          { aiCategory: safeRegex },
          { status: safeRegex },
          { priority: safeRegex },
          { 'location.neighborhood': safeRegex },
        ],
      };
    }

    const issues = await IssueModel.find(filter).sort({ createdAt: -1 }).limit(10).lean();

    if (issues.length === 0) {
      return rawQuery
        ? `No issues found matching "${rawQuery}". Try a simpler keyword such as "flooding", "pothole", "garbage", or a neighborhood name.`
        : 'No issues were found in the current dataset.';
    }

    const list = issues.map(formatIssueLine).join('\n');

    return searchTerm
      ? `The following issues match "${searchTerm}":\n${list}`
      : `Here are the most recent issues:\n${list}`;
  },
});

// Tool to find open issues that currently have no volunteers with search query across title, description, category, AI category, and neighborhood to help identify issues that may need volunteer support but are being overlooked
const findVolunteerNeedIssueTool = new DynamicTool({
  name: 'find_issues_without_volunteers',
  description:
    'Finds open community issues with zero volunteers. Can filter by keyword across title, description, category, AI category, or neighborhood.',
  func: async (query) => {
    await ensureAnalyticsSources();

    const issuesWithVolunteers = await VolunteerInterestModel.distinct('issueId');
    const rawQuery = String(query || '').trim();
    const keyword = extractKeyword(rawQuery);
    const searchTerm = keyword || rawQuery;

    const filter = {
      _id: { $nin: issuesWithVolunteers },
      status: { $in: OPEN_STATUSES },
    };

    if (searchTerm) {
      const safeRegex = new RegExp(escapeRegex(searchTerm), 'i');
      filter.$or = [
        { title: safeRegex },
        { description: safeRegex },
        { category: safeRegex },
        { aiCategory: safeRegex },
        { 'location.neighborhood': safeRegex },
      ];
    }

    const issuesWithoutVolunteers = await IssueModel.find(filter)
      .sort({ urgentAlert: -1, createdAt: -1 })
      .limit(10)
      .lean();

    if (issuesWithoutVolunteers.length === 0) {
      return searchTerm
        ? `No open issues needing volunteers were found for "${searchTerm}".`
        : 'All current open issues already have volunteers.';
    }

    const list = issuesWithoutVolunteers.map(formatIssueLine).join('\n');

    return searchTerm
      ? `The following open issues have no volunteers and match "${searchTerm}":\n${list}`
      : `The following open issues currently have no volunteers:\n${list}`;
  },
});

// Additional tools for issue counts
const totalIssueCountTool = new DynamicTool({
  name: 'get_total_issue_count',
  description: 'Returns the total number of issues in the system.',
  func: async () => {
    await ensureAnalyticsSources();

    const totalIssues = await IssueModel.countDocuments({});
    return `There are ${totalIssues} total issues in the system.`;
  },
});

// Additional tools for issueS  thats are open
const openIssueCountTool = new DynamicTool({
  name: 'get_open_issue_count',
  description: 'Returns the total number of open issues in the system.',
  func: async () => {
    await ensureAnalyticsSources();

    const openIssues = await IssueModel.countDocuments({
      status: { $in: OPEN_STATUSES },
    });

    return `There are ${openIssues} open issues in the system. Open issues are defined as: ${OPEN_STATUSES.join(
      ', '
    )}.`;
  },
});

// Additional tool for issue counts that are resolved
const resolvedIssueCountTool = new DynamicTool({
  name: 'get_resolved_issue_count',
  description: 'Returns the total number of resolved issues in the system.',
  func: async () => {
    await ensureAnalyticsSources();

    const resolvedIssues = await IssueModel.countDocuments({ status: 'resolved' });
    return `There are ${resolvedIssues} resolved issues in the system.`;
  },
});

// Tool to get a summary of urgent issues
const urgentIssueSummaryTool = new DynamicTool({
  name: 'get_urgent_issue_summary',
  description:
    'Returns a summary of urgent issues, including count and up to 10 urgent issues sorted by newest first.',
  func: async () => {
    await ensureAnalyticsSources();

    const urgentIssues = await IssueModel.find({ urgentAlert: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (urgentIssues.length === 0) {
      return 'There are currently no urgent issues flagged in the system.';
    }

    const list = urgentIssues.map(formatIssueLine).join('\n');
    return `There are ${urgentIssues.length} urgent issues in the current result set. Here are the urgent issues:\n${list}`;
  },
});

// Tool to get issue thats group by category
const issuesByCategoryTool = new DynamicTool({
  name: 'get_issues_by_category',
  description:
    'Returns issue counts grouped by category so the assistant can identify the most common issue categories.',
  func: async () => {
    await ensureAnalyticsSources();

    const results = await IssueModel.aggregate([
      {
        $group: {
          _id: {
            $ifNull: ['$category', { $ifNull: ['$aiCategory', 'other'] }],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 10 },
    ]);

    if (!results.length) {
      return 'No issue category data is available.';
    }

    const lines = results.map((item) => `- ${item._id || 'other'}: ${item.count}`).join('\n');
    return `Top issue categories:\n${lines}`;
  },
});

// Tool to get issues grouped by neighborhood
const issuesByNeighborhoodTool = new DynamicTool({
  name: 'get_issues_by_neighborhood',
  description:
    'Returns issue counts grouped by neighborhood so the assistant can identify hotspots and neighborhoods needing attention.',
  func: async () => {
    await ensureAnalyticsSources();

    const results = await IssueModel.aggregate([
      {
        $group: {
          _id: {
            $ifNull: ['$location.neighborhood', 'Unknown'],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 10 },
    ]);

    if (!results.length) {
      return 'No neighborhood issue data is available.';
    }

    const lines = results.map((item) => `- ${item._id || 'Unknown'}: ${item.count}`).join('\n');
    return `Neighborhood issue totals:\n${lines}`;
  },
});

// Tool to get a dashboard summary of key metrics including total issues, open issues, resolved issues, urgent issues, comments, upvotes, and volunteer interests
const dashboardSummaryTool = new DynamicTool({
  name: 'get_dashboard_summary',
  description:
    'Returns a compact dashboard summary including total issues, open issues, resolved issues, urgent issues, comments, upvotes, and volunteer interests.',
  func: async () => {
    await ensureAnalyticsSources();

    const [
      totalIssues,
      openIssues,
      resolvedIssues,
      urgentIssues,
      totalComments,
      totalUpvotes,
      totalVolunteerInterests,
    ] = await Promise.all([
      IssueModel.countDocuments({}),
      IssueModel.countDocuments({ status: { $in: OPEN_STATUSES } }),
      IssueModel.countDocuments({ status: 'resolved' }),
      IssueModel.countDocuments({ urgentAlert: true }),
      CommentModel.countDocuments({}),
      IssueReactionModel.countDocuments({ reactionType: 'upvote' }),
      VolunteerInterestModel.countDocuments({}),
    ]);

    return [
      'Dashboard summary:',
      `- Total issues: ${totalIssues}`,
      `- Open issues: ${openIssues}`,
      `- Resolved issues: ${resolvedIssues}`,
      `- Urgent issues: ${urgentIssues}`,
      `- Comments: ${totalComments}`,
      `- Upvotes: ${totalUpvotes}`,
      `- Volunteer interests: ${totalVolunteerInterests}`,
    ].join('\n');
  },
});

const model = new ChatGoogleGenerativeAI({
  model: config.geminiModel || 'gemini-1.5-flash',
  apiKey: config.geminiApiKey,
});

// Combine all tools into a ToolNode for the agent to use
const tools = [
  issueSearchTool,
  findVolunteerNeedIssueTool,
  totalIssueCountTool,
  openIssueCountTool,
  resolvedIssueCountTool,
  urgentIssueSummaryTool,
  issuesByCategoryTool,
  issuesByNeighborhoodTool,
  dashboardSummaryTool,
];

const toolNode = new ToolNode(tools);
const modelWithTools = model.bindTools(tools);

// Define the Logic Flow (The State Machine)
function shouldContinue(state) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return 'tools';
  }
  return END;
}

async function callModel(state) {
  const response = await modelWithTools.invoke(state.messages);
  return { messages: [response] };
}

// Compile the Graph
const workflow = new StateGraph({
  channels: { messages: { value: (x, y) => x.concat(y), default: () => [] } },
})
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent');

// Compile the agent application with a recursion limit to prevent infinite loops
const agentApp = workflow.compile({
  recursionLimit: 5,
});

const resolvers = {
  JSONString: {
    __serialize(value) {
      return typeof value === 'string' ? value : JSON.stringify(value);
    },
  },

  Query: {
    // Dashboard stats for admin dashboard
    dashboardStats: async (_, __, { user }) => {
      requirePrivilegedRole(user);

      await ensureAnalyticsSources();

      const [
        totalIssues,
        openIssues,
        urgentIssues,
        resolvedIssues,
        totalComments,
        totalUpvotes,
        totalVolunteerInterests,
      ] = await Promise.all([
        IssueModel.countDocuments({}),
        IssueModel.countDocuments({
          status: { $in: OPEN_STATUSES },
        }),
        IssueModel.countDocuments({ urgentAlert: true }),
        IssueModel.countDocuments({ status: 'resolved' }),
        CommentModel.countDocuments({}),
        IssueReactionModel.countDocuments({ reactionType: 'upvote' }),
        VolunteerInterestModel.countDocuments({}),
      ]);

      return {
        totalIssues,
        openIssues,
        urgentIssues,
        resolvedIssues,
        totalComments,
        totalUpvotes,
        totalVolunteerInterests,
      };
    },

    // Search issues By Category
    issuesByCategory: async (_, __, { user }) => {
      requirePrivilegedRole(user);

      await ensureAnalyticsSources();

      const results = await IssueModel.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ['$category', { $ifNull: ['$aiCategory', 'other'] }],
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
      ]);

      return results.map((item) => ({
        category: item._id || 'other',
        count: item.count,
      }));
    },

    neighborhoodHotspots: async (_, __, { user }) => {
      requirePrivilegedRole(user);

      await ensureAnalyticsSources();

      const results = await IssueModel.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ['$location.neighborhood', 'Unknown'],
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 10 },
      ]);

      return results.map((item) => ({
        neighborhood: item._id || 'Unknown',
        count: item.count,
      }));
    },

    // Retrieve recent AI insight logs 
    recentAiInsightLogs: async (_, { limit = 10 }, { user }) => {
      requirePrivilegedRole(user);

      const logs = await AIInsightLog.find({})
        .sort({ createdAt: -1 })
        .limit(Math.max(1, Math.min(limit, 50)));

      return logs.map(formatAIInsightLog);
    },

    // Using AI with a natural language query for classifying an issue
    classifyIssue: async (_, { title, description }, { user }) => {
      try {
        requireAuth(user);

        const fallback = fallbackClassification(title, description);

        const prompt = `
You are an AI civic issue classifier.
Classify the issue into exactly one of these categories:
pothole, broken_streetlight, flooding, sidewalk_damage, garbage, graffiti, traffic_signal, safety_hazard, other

Also choose exactly one priority:
low, medium, high, critical

Return ONLY valid JSON in this exact shape:
{
  "category": "...",
  "priority": "...",
  "summary": "..."
}

Issue title: ${title}
Issue description: ${description}
`.trim();

        const rawText = await generateTextWithGemini(prompt, JSON.stringify(fallback));

        const parsed = extractJsonObject(rawText) || fallback;

        const result = {
          category: parsed.category || fallback.category,
          priority: parsed.priority || fallback.priority,
          summary: parsed.summary || fallback.summary,
        };

        await logInsight({
          insightType: 'classification',
          requestedByUserId: user.userId,
          requestedByUsername: user.username,
          prompt,
          responseText: JSON.stringify(result),
          metadata: result,
        });

        return {
          success: true,
          message: 'Issue classified successfully.',
          category: result.category,
          priority: result.priority,
          summary: result.summary,
        };
      } catch (error) {
        console.error('classifyIssue error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to classify issue.',
          category: null,
          priority: null,
          summary: null,
        };
      }
    },

    // Using AI to generate a concise summary of an issue with community context
    summarizeIssue: async (_, { issueId = '', title, description, comments = [] }, { user }) => {
      try {
        requireAuth(user);

        const commentsText =
          comments.length > 0
            ? comments.map((comment, index) => `${index + 1}. ${comment}`).join('\n')
            : 'No comments provided.';

        const fallbackSummary = `Summary: ${title} — ${description.slice(0, 180)}${
          description.length > 180 ? '...' : ''
        }`;

        const prompt = `
You are an AI assistant for a municipal issue tracking platform.
Write one concise professional summary for the issue below.
Mention the main problem, its likely impact, and whether public attention appears high based on comments.

Issue title: ${title}
Issue description: ${description}
Community comments:
${commentsText}
`.trim();

        const text = await generateTextWithGemini(prompt, fallbackSummary);

        await logInsight({
          insightType: 'summary',
          relatedIssueId: issueId,
          requestedByUserId: user.userId,
          requestedByUsername: user.username,
          prompt,
          responseText: text,
          metadata: {
            commentsCount: comments.length,
          },
        });

        return {
          success: true,
          message: 'Issue summary generated successfully.',
          text,
        };
      } catch (error) {
        console.error('summarizeIssue error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to summarize issue.',
          text: null,
        };
      }
    },

    // Using AI to generate insights on trends across the issue dataset for municipal management
    trendInsights: async (_, __, { user }) => {
      try {
        requirePrivilegedRole(user);

        const issues = await getIssueDocuments();
        const { comments, reactions, volunteerInterests } = await getCommunityDocuments();

        const datasetText = buildIssueDatasetText(
          issues,
          comments,
          reactions,
          volunteerInterests
        );

        const fallbackText = `There are ${issues.length} total issues in the system. The main trend summary should focus on frequent categories, urgent issues, and neighborhoods with repeated reports.`;

        const prompt = `
You are an analytics assistant for a municipal issue tracker.
Using the issue dataset below, produce a short management insight report with:
1. top recurring issue patterns
2. urgent/public-safety concerns
3. neighborhoods needing attention
4. one practical municipal recommendation

Do not fabricate exact counts unless they are clearly supported by the dataset. If uncertain, use approximate language such as "several", "multiple", or "frequent".

Dataset:
${datasetText || 'No issue data available.'}
`.trim();

        const text = await generateTextWithGemini(prompt, fallbackText);

        await logInsight({
          insightType: 'trend',
          requestedByUserId: user.userId,
          requestedByUsername: user.username,
          prompt,
          responseText: text,
          metadata: {
            issueCount: issues.length,
            commentCount: comments.length,
            upvoteCount: reactions.length,
            volunteerCount: volunteerInterests.length,
          },
        });

        return {
          success: true,
          message: 'Trend insights generated successfully.',
          text,
        };
      } catch (error) {
        console.error('trendInsights error:', error.message);

        return {
          success: false,
          message: error.message || 'Failed to generate trend insights.',
          text: null,
        };
      }
    },

    // Using AI as a chatbot to answer natural language questions with defined tools
    chatbotQuery: async (_, { question }, { user }) => {
      try {
        requireAuth(user);

        if (!Array.isArray(question) || question.length === 0) {
          return {
            success: false,
            message: 'At least one message is required.',
            text: null,
          };
        }

        const sanitizedMessages = question
          .filter(
            (message) =>
              message &&
              typeof message.content === 'string' &&
              typeof message.role === 'string'
          )
          .map((message) => ({
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: message.content.trim(),
          }))
          .filter((message) => message.content.length > 0);

        if (sanitizedMessages.length === 0) {
          return {
            success: false,
            message: 'No valid chat messages were provided.',
            text: null,
          };
        }

        const systemMessage = new SystemMessage(
          'You are a civic analytics assistant for the CivicCase municipal issue tracker. ' +
            'You can help with issue counts, open and resolved issues, urgent issues, category trends, neighborhood hotspots, volunteer gaps, dashboard-style summaries, and searches for specific community issues. ' +
            'Use the available tools whenever a question depends on current issue data or exact counts. ' +
            'Answer clearly, professionally, and concisely for civic operations and community support. ' +
            'Do not fabricate exact counts unless they are supported by tool results. ' +
            'If a question is unrelated to civic issues, municipal operations, community support, or the available issue dataset, politely say that you are limited to CivicCase civic issue assistance and invite the user to ask about community issues or analytics.'
        );

        const formattedMessages = [
          systemMessage,
          ...sanitizedMessages.map((message) =>
            message.role === 'assistant'
              ? new AIMessage(message.content)
              : new HumanMessage(message.content)
          ),
        ];

        const response = await agentApp.invoke({
          messages: formattedMessages,
        });

        const lastMessage = response.messages[response.messages.length - 1];
        let answer = '';

        if (typeof lastMessage?.content === 'string') {
          answer = lastMessage.content;
        } else if (Array.isArray(lastMessage?.content)) {
          answer = lastMessage.content.map((part) => part?.text || '').join('\n').trim();
        }

        if (!answer) {
          answer = "I've processed that request. Is there anything else you'd like to know?";
        }

        await logInsight({
          insightType: 'chatbot',
          requestedByUserId: user.userId,
          requestedByUsername: user.username,
          prompt: JSON.stringify(sanitizedMessages),
          responseText: answer,
          metadata: {
            messageCount: sanitizedMessages.length,
          },
        });

        return {
          success: true,
          message: 'Chatbot response generated successfully.',
          text: answer,
        };
      } catch (error) {
        console.error('chatbotQuery error:', error.message);

        const normalizedMessage = String(error?.message || '');

        if (
          normalizedMessage.toLowerCase().includes('quota') ||
          normalizedMessage.includes('429')
        ) {
          return {
            success: false,
            message:
              'The AI service is temporarily unavailable because the request quota has been reached. Please retry shortly.',
            text: null,
          };
        }

        return {
          success: false,
          message: error.message || 'Failed to generate chatbot response.',
          text: null,
        };
      }
    },
  },
};

export default resolvers;