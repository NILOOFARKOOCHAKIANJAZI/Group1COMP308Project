

````md
# ⚙️ Setup Guide — CivicCase Backend

---

## 🔐 Important Notes Before Setup

### 1. Shared JWT Secret

All backend microservices must use the **same exact `JWT_SECRET`**.

This is required because:
- `auth-service` signs the JWT
- other services verify the same JWT


---

### 2. Gemini API Key

The `analytics-ai-service` requires a valid Gemini API key.

Use:

```env
GEMINI_API_KEY=your_actual_key_here
````

---

### 3. Environment Files

Each microservice has its own `.env` file.

👉 Every teammate must create their own local `.env` files before running the project.

---

# 🧾 Environment Configuration

---

## 1) auth-service/.env

Create this file:

```env
NODE_ENV=development

AUTH_PORT=4001
AUTH_MONGO_URI=mongodb://127.0.0.1:27017/civiccase_auth_db

JWT_SECRET=your_shared_jwt_secret_here

CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com
```

---

## 2) issue-service/.env

```env
NODE_ENV=development

ISSUE_PORT=4002
ISSUE_MONGO_URI=mongodb://127.0.0.1:27017/civiccase_issue_db

JWT_SECRET=your_shared_jwt_secret_here

CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com
```

---

## 3) community-service/.env

```env
NODE_ENV=development

COMMUNITY_PORT=4003
COMMUNITY_MONGO_URI=mongodb://127.0.0.1:27017/civiccase_community_db

JWT_SECRET=your_shared_jwt_secret_here

CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com
```

---

## 4) analytics-ai-service/.env

```env
NODE_ENV=development

ANALYTICS_AI_PORT=4004
ANALYTICS_AI_MONGO_URI=mongodb://127.0.0.1:27017/civiccase_analytics_ai_db

ISSUE_MONGO_URI=mongodb://127.0.0.1:27017/civiccase_issue_db
COMMUNITY_MONGO_URI=mongodb://127.0.0.1:27017/civiccase_community_db

JWT_SECRET=your_shared_jwt_secret_here

GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com
```

---

## 5) server/.env

```env
NODE_ENV=development

GATEWAY_PORT=4000

AUTH_SERVICE_URL=http://localhost:4001/graphql
ISSUE_SERVICE_URL=http://localhost:4002/graphql
COMMUNITY_SERVICE_URL=http://localhost:4003/graphql
ANALYTICS_AI_SERVICE_URL=http://localhost:4004/graphql

CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com
```

---

# 🚀 Installation Guide (From Scratch)

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/NILOOFARKOOCHAKIANJAZI/Group1COMP308Project.git
cd Group1COMP308Project
```

---

## Step 2 — Create `.env` Files

Create `.env` files inside:

* `auth-service`
* `issue-service`
* `community-service`
* `analytics-ai-service`
* `server`

Use the templates provided above.

✔ Make sure:

* All services use the **same `JWT_SECRET`**
* `analytics-ai-service` has a valid **Gemini API key**

---

## Step 3 — Install Dependencies

Run these commands one by one:

### auth-service

```bash
cd auth-service
npm install
cd ..
```

### issue-service

```bash
cd issue-service
npm install
cd ..
```

### community-service

```bash
cd community-service
npm install
cd ..
```

### analytics-ai-service

```bash
cd analytics-ai-service
npm install
cd ..
```

### server (gateway)

```bash
cd server
npm install
cd ..
```

---

# ▶️ Running the Project

---

## Step 1 — Start MongoDB

Make sure MongoDB is running locally.

Default connection:

```text
mongodb://127.0.0.1:27017/
```

---

## Step 2 — Start All Services

Open **separate terminals** for each service.

---

### Terminal 1 — auth-service

```bash
cd auth-service
npm run dev
```

Expected:

```
http://localhost:4001/graphql
```

---

### Terminal 2 — issue-service

```bash
cd issue-service
npm run dev
```

Expected:

```
http://localhost:4002/graphql
```

---

### Terminal 3 — community-service

```bash
cd community-service
npm run dev
```

Expected:

```
http://localhost:4003/graphql
```

---

### Terminal 4 — analytics-ai-service

```bash
cd analytics-ai-service
npm run dev
```

Expected:

```
http://localhost:4004/graphql
```

---

### Terminal 5 — Gateway (server)

```bash
cd server
npm run dev
```

Expected:

```
http://localhost:4000/graphql
```

---

# 🌐 Main Endpoints

## Individual Microservices

* Auth Service → [http://localhost:4001/graphql](http://localhost:4001/graphql)
* Issue Service → [http://localhost:4002/graphql](http://localhost:4002/graphql)
* Community Service → [http://localhost:4003/graphql](http://localhost:4003/graphql)
* Analytics AI Service → [http://localhost:4004/graphql](http://localhost:4004/graphql)

---

## Unified Gateway

* Gateway → [http://localhost:4000/graphql](http://localhost:4000/graphql)


---

```

# Backend Features by Microservice

This section lists the current backend capabilities implemented in each microservice.

---

## 1) auth-service

The `auth-service` is responsible for authentication and user identity management.

### Features
- User registration
- User login
- User logout
- Get current logged-in user
- JWT token generation
- JWT token verification
- Role-based user support:
  - `resident`
  - `staff`
  - `advocate`
- Password hashing with `bcrypt`
- Login using username or email
- Cookie-based authentication support
- Bearer token authentication support

### Main GraphQL Operations

#### Queries
- `currentUser`

#### Mutations
- `register`
- `login`
- `logout`

---

## 2) issue-service

The `issue-service` is responsible for issue reporting, tracking, assignment, urgent alerts, and resident notifications.

### Features
- Report a new issue
- Store issue details in MongoDB
- Track issue lifecycle
- View resident's own issues
- View all issues for staff and advocates
- View a specific issue by ID
- Assign issue to staff
- Update issue status
- Mark issue as urgent
- Remove urgent flag
- Automatically create notifications when:
  - issue is reported
  - issue is assigned
  - issue status changes
  - issue is marked urgent
- View resident notifications
- Mark notification as read

### Issue Data Supported
- Title
- Description
- Category
- AI category
- AI summary
- Priority
- Status
- Photo URL
- Address
- Latitude / Longitude
- Neighborhood
- Reporter info
- Assigned staff info
- Internal notes
- Urgent alert flag

### Supported Issue Status Values
- `reported`
- `under_review`
- `assigned`
- `in_progress`
- `resolved`
- `closed`

### Main GraphQL Operations

#### Queries
- `myIssues`
- `allIssues`
- `issueById`
- `urgentIssues`
- `notifications`

#### Mutations
- `reportIssue`
- `updateIssueStatus`
- `assignIssue`
- `markUrgent`
- `markNotificationAsRead`

---

## 3) community-service

The `community-service` is responsible for community engagement features such as comments, upvotes, volunteer interest, and community summaries.

### Features
- Add comment to an issue
- View comments for an issue
- Delete own comment
- Staff/advocate can delete comments if needed
- Add upvote to an issue
- Remove upvote from an issue
- Prevent duplicate upvotes by the same user on the same issue
- Express volunteer interest for an issue
- Prevent duplicate volunteer interest by the same user on the same issue
- View current user's volunteer interests
- Staff/advocate can view volunteer interests by issue
- Staff/advocate can update volunteer interest status
- Community summary counts for each issue:
  - total comments
  - total upvotes
  - total volunteer interests

### Supported Volunteer Status Values
- `interested`
- `contacted`
- `matched`
- `closed`

### Main GraphQL Operations

#### Queries
- `commentsByIssue`
- `upvotesByIssue`
- `volunteerInterestsByIssue`
- `myVolunteerInterests`
- `communitySummary`

#### Mutations
- `addComment`
- `deleteComment`
- `addUpvote`
- `removeUpvote`
- `expressVolunteerInterest`
- `updateVolunteerInterestStatus`

---

## 4) analytics-ai-service

The `analytics-ai-service` is responsible for AI-powered features and management analytics.

### Features
- AI issue classification using Gemini
- AI-generated issue summary
- AI-generated trend insights
- AI chatbot question answering
- Dashboard statistics
- Category breakdown analytics
- Neighborhood hotspot analytics
- Save AI activity logs in MongoDB
- Read issue data from issue database
- Read community data from community database
- Provide management insights for staff and advocates

### AI Capabilities
- Classify issue into a civic issue category
- Suggest issue priority
- Generate short summary for issue description
- Summarize issue discussion/comments
- Generate trend analysis across issues
- Answer natural language chatbot questions based on current issue/community dataset

### Analytics Capabilities
- Total issues count
- Open issues count
- Urgent issues count
- Resolved issues count
- Total comments count
- Total upvotes count
- Total volunteer interests count
- Issue count by category
- Neighborhood hotspots by issue frequency

### AI Log Types
- `classification`
- `summary`
- `trend`
- `chatbot`

### Main GraphQL Operations

#### Queries
- `dashboardStats`
- `issuesByCategory`
- `neighborhoodHotspots`
- `recentAiInsightLogs`
- `classifyIssue`
- `summarizeIssue`
- `trendInsights`
- `chatbotQuery`

---

## 5) server gateway

The `server` folder contains the Apollo Gateway, which acts as the unified GraphQL entry point for all backend services.

### Features
- Single GraphQL entry point for the whole backend
- Connects all microservices into one backend API
- Forwards authentication headers to subgraphs
- Forwards cookies to subgraphs
- Forwards auth cookie responses back to client
- Supports full-system testing through one endpoint
- Makes frontend integration easier by exposing one GraphQL URL

### Connected Services
- `auth-service`
- `issue-service`
- `community-service`
- `analytics-ai-service`

### Main Gateway Endpoint
- `http://localhost:4000/graphql`

---

# Current Backend Role Permissions Summary

## Resident
A resident can:
- register
- login
- logout
- get current user
- report issue
- view own issues
- view own notifications
- mark own notifications as read
- add comments
- delete own comments
- add upvote
- remove upvote
- express volunteer interest
- view own volunteer interests
- use AI classification
- use AI summarize issue
- use chatbot

## Staff
A staff user can:
- do everything a logged-in user can do, where allowed
- view all issues
- view urgent issues
- assign issues
- update issue status
- mark issues urgent
- view volunteer interests by issue
- update volunteer interest status
- access dashboard stats
- access issue category analytics
- access neighborhood hotspots
- access trend insights
- view AI logs

## Advocate
An advocate can:
- do everything a logged-in user can do, where allowed
- view all issues
- view urgent issues
- view volunteer interests by issue
- update volunteer interest status
- access dashboard stats
- access issue category analytics
- access neighborhood hotspots
- access trend insights
- view AI logs

