// analytics-ai-service/graphql/resolvers.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicTool } from "@langchain/core/tools";
import { HumanMessage, AIMessage,SystemMessage } from "@langchain/core/messages";

import AIInsightLog from '../models/aiInsightLog.js';
import { config } from '../config/config.js';

const privilegedRoles = ['staff', 'advocate'];

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

// Define Tools 
const issueSearchTool = new DynamicTool({
  name: "search_community_issues",
  //wanna search more please change the description and increase the limit in the query
  description: "Searches for local issues by title or status. Input should be a search string.",
  func: async (query) => {
    await ensureAnalyticsSources();
    // Use MongoDB text search or regex to find specific issues
    const issues = await IssueModel.find({ 
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { status: { $regex: query, $options: 'i' } },
      ]
    }).limit(10).lean();
    // return JSON.stringify(issues);
    

    if (issues.length === 0) {
      return `No issues found matching the query: "${query}". Try searching with different keywords or check for typos.`;
    }

    const list = issues.map(i => 
      `- id: ${i._id}  [${i.category.toUpperCase()}] ${i.title} in ${i.location?.neighborhood || 'Unknown'} is currently ${i.status.toUpperCase()}.`
    ).join('\n');

    return `the following issues match your search query:\n${list}`;
  },
});

const findVolunteerNeedIssueTool = new DynamicTool({
  name: "find_issues_without_volunteers",
  description: "Finds community issues with zero volunteers. Can filter by title.",
  func: async (query) => {
    await ensureAnalyticsSources();

    const issuesWithVolunteers = await VolunteerInterestModel.distinct('issueId');

    //Start with the basic "No Volunteer" and "Open Status" filters
    let filter = {
      _id: { $nin: issuesWithVolunteers },
      status: { $in: ['reported', 'under_review', 'assigned', 'in_progress'] }
    };

    //Add the Title search ONLY if a query is provided
    if (query && query.trim() !== "") {
      filter.title = { $regex: query, $options: 'i' };
    }

    //Now run the query with the complete filter
    const issuesWithoutVolunteers = await IssueModel.find(filter)
      .limit(10)
      .lean();

    if (issuesWithoutVolunteers.length === 0) {
      return query 
        ? `No issues needing volunteers found matching "${query}".`
        : "All current open issues already have volunteers!";
    }

    const list = issuesWithoutVolunteers.map(i => 
      `- id: ${i._id} [${i.category.toUpperCase()}] ${i.title} in ${i.location?.neighborhood || 'Unknown'}`
    ).join('\n');

    return `The following issues have NO volunteers and match your request:\n${list}`;
  },
});

const model = new ChatGoogleGenerativeAI({
  //for somehow, i need to hardcoded the model here instead of using config.geminiModel
//gemini-3.1-flash-lite-preview
// IF THE MODEL DOESN'T WORK, TRY SWITCHING TO "gemini-2.5-flash" OR "gemini-3.1-flash-lite-preview"
  model: 'gemini-2.5-flash',
  apiKey: config.geminiApiKey,
});

const tools = [issueSearchTool,findVolunteerNeedIssueTool];
const toolNode = new ToolNode(tools);
const modelWithTools = model.bindTools(tools);

//Define the Logic Flow (The State Machine)
function shouldContinue(state) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
}

async function callModel(state) {
  const response = await modelWithTools.invoke(state.messages);
  return { messages: [response] };
}

//Compile the Graph
const workflow = new StateGraph({
  channels: { messages: { value: (x, y) => x.concat(y), default: () => [] } }
})
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const agentApp = workflow.compile(
  {
      recursionLimit: 5
  }
);

const resolvers = {
  JSONString: {
    __serialize(value) {
      return typeof value === 'string' ? value : JSON.stringify(value);
    },
  },

  Query: {
    dashboardStats: async (_, __, { user }) => {
      requirePrivilegedRole(user);

      await ensureAnalyticsSources();

      const [totalIssues, openIssues, urgentIssues, resolvedIssues, totalComments, totalUpvotes, totalVolunteerInterests] =
        await Promise.all([
          IssueModel.countDocuments({}),
          IssueModel.countDocuments({
            status: { $in: ['reported', 'under_review', 'assigned', 'in_progress'] },
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

    issuesByCategory: async (_, __, { user }) => {
      requirePrivilegedRole(user);

      await ensureAnalyticsSources();

      const results = await IssueModel.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ['$category', 'other'],
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

    recentAiInsightLogs: async (_, { limit = 10 }, { user }) => {
      requirePrivilegedRole(user);

      const logs = await AIInsightLog.find({})
        .sort({ createdAt: -1 })
        .limit(Math.max(1, Math.min(limit, 50)));

      return logs.map(formatAIInsightLog);
    },

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

        const rawText = await generateTextWithGemini(
          prompt,
          JSON.stringify(fallback)
        );

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

      chatbotQuery: async (_, { question }, { user }) => {
        try {
          requireAuth(user);
          

          // const formattedMessages = question.map(msg => {
          //   return msg.role === 'user' 
          //     ? new HumanMessage(msg.content) 
          //     : new AIMessage(msg.content);
          // });
          const systemMessage = new SystemMessage(
            "You are a helpful Community Assistant. Use the issueSearchTool to search for issues by title or status" +
            "and use findVolunteerNeedIssueTool to find volunteer opportunities. Always be polite and concise."
          );

          const formattedMessages = [
            systemMessage, 
            ...question.map(msg => msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content))
          ];
          const input = {
            messages: formattedMessages
          };
          
          const response = await agentApp.invoke(input);
          
          // const answer = response.messages[response.messages.length - 1].content;
          const lastMessage = response.messages[response.messages.length - 1];
          let answer = "";
          // console.log("Raw model response:", response);
          if (typeof lastMessage.content === 'string') {
            answer = lastMessage.content;
          } else if (Array.isArray(lastMessage.content)) {
            answer = lastMessage.content.map(part => part.text || "").join("\n");
          }

          // Final fallback if the AI was silent
          if (!answer || answer.trim() === "") {
            answer = "I've processed that request. Is there anything else you'd like to know?";
          }
          return {
            success: true,
            message: 'Chatbot response generated successfully.',
            text: answer,
          };
        } catch (error) {
          console.error('chatbotQuery error:', error.message);
          return {
            success: false,
            message: error.message,
            text: null,
          };
        }
      },
  },
};

export default resolvers;