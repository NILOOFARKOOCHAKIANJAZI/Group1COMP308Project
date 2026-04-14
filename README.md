

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
git clone <YOUR_GITHUB_REPOSITORY_URL>
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


