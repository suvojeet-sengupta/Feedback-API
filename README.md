# 📱 App Feedback API

A production-ready **NestJS** REST API for collecting feedback from your Android (or any) apps, with real-time **Telegram bot notifications** and built-in analytics.

## ✨ Features

- **Submit Feedback** — Ratings (1-5), categories, messages, device info
- **Telegram Notifications** — Instant alerts to your Telegram bot on new feedback
- **Analytics Dashboard** — Rating distribution, category trends, per-app stats
- **API Key Auth** — Optional API key protection for your endpoints
- **Swagger Docs** — Auto-generated interactive API documentation
- **Pagination & Filters** — Sort, search, and filter feedback by any field
- **Status Management** — Track feedback lifecycle (new → reviewed → resolved)
- **Device Metadata** — Capture device model, OS version, screen resolution, etc.
- **SQLite Storage** — Zero-config database, works out of the box
- **Clean Architecture** — Modular NestJS structure with DTOs, guards, interceptors

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your Telegram bot token and chat ID
```

### 3. Start the server

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 4. Open Swagger Docs

Visit [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🔧 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `API_KEY` | API key for auth (empty = disabled) | `` |
| `DB_PATH` | SQLite database path | `./data/feedback.sqlite` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather | — |
| `TELEGRAM_CHAT_ID` | Target chat/group ID | — |
| `TELEGRAM_ENABLED` | Enable Telegram notifications | `true` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |

---

## 📡 API Endpoints

### Submit Feedback
```http
POST /api/feedback
Content-Type: application/json
X-API-Key: your-api-key

{
  "appName": "MyApp",
  "appVersion": "2.1.0",
  "appPackage": "com.example.myapp",
  "rating": 4,
  "category": "feature",
  "message": "Love the new dark mode! Maybe add more themes?",
  "userName": "John",
  "userEmail": "john@example.com",
  "deviceModel": "Pixel 8 Pro",
  "deviceBrand": "Google",
  "osVersion": "Android 15",
  "sdkVersion": "35",
  "screenResolution": "1080x2400",
  "locale": "en_US",
  "timezone": "America/New_York",
  "networkType": "wifi",
  "metadata": { "screen": "settings", "theme": "dark" },
  "tags": ["ui", "theme"]
}
```

### List Feedback (with filters)
```http
GET /api/feedback?page=1&limit=20&appName=MyApp&category=bug&status=new&minRating=3&search=crash&sortBy=rating&sortOrder=DESC
```

### Get Feedback by ID
```http
GET /api/feedback/:id
```

### Update Status
```http
PATCH /api/feedback/:id/status
Content-Type: application/json

{
  "status": "reviewed",
  "note": "Looking into this"
}
```

### Delete Feedback
```http
DELETE /api/feedback/:id
```

### Get Statistics
```http
GET /api/feedback/stats?appName=MyApp
```

### Get App Names
```http
GET /api/feedback/apps
```

---

## 📱 Android Integration Example

### Kotlin (Retrofit)

```kotlin
// FeedbackApi.kt
interface FeedbackApi {
    @POST("api/feedback")
    suspend fun submitFeedback(
        @Header("X-API-Key") apiKey: String,
        @Body feedback: FeedbackRequest
    ): Response<FeedbackResponse>
}

// FeedbackRequest.kt
data class FeedbackRequest(
    val appName: String,
    val appVersion: String,
    val rating: Int,
    val category: String,
    val message: String,
    val userName: String? = null,
    val userEmail: String? = null,
    val deviceModel: String = Build.MODEL,
    val deviceBrand: String = Build.BRAND,
    val osVersion: String = "Android ${Build.VERSION.RELEASE}",
    val sdkVersion: String = Build.VERSION.SDK_INT.toString(),
    val screenResolution: String? = null,
    val locale: String = Locale.getDefault().toString(),
    val timezone: String = TimeZone.getDefault().id,
    val metadata: Map<String, Any>? = null,
    val tags: List<String>? = null
)
```

### Java (OkHttp)

```java
OkHttpClient client = new OkHttpClient();

JSONObject json = new JSONObject();
json.put("appName", "MyApp");
json.put("rating", 5);
json.put("category", "general");
json.put("message", "Great app!");
json.put("deviceModel", Build.MODEL);
json.put("osVersion", "Android " + Build.VERSION.RELEASE);

Request request = new Request.Builder()
    .url("https://your-api.com/api/feedback")
    .addHeader("X-API-Key", "your-key")
    .addHeader("Content-Type", "application/json")
    .post(RequestBody.create(json.toString(), MediaType.parse("application/json")))
    .build();

client.newCall(request).enqueue(new Callback() { ... });
```

### cURL
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "appName": "MyApp",
    "rating": 5,
    "message": "Works perfectly!",
    "category": "general"
  }'
```

---

## 🤖 Telegram Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot`
2. Copy the bot token → paste into `TELEGRAM_BOT_TOKEN`
3. Message [@userinfobot](https://t.me/userinfobot) → copy your chat ID
4. Paste into `TELEGRAM_CHAT_ID`
5. Set `TELEGRAM_ENABLED=true`

You'll receive real-time notifications like:

```
📱 New Feedback Received

App: MyApp (v2.1.0)
Rating: ⭐⭐⭐⭐☆ (4/5)
Category: ✨ feature
Status: 🆕 new

💬 Message:
Love the new dark mode! Maybe add more themes?

👤 User: John (john@example.com)
📲 Device: Google · Pixel 8 Pro · Android 15

🏷 Tags: #ui #theme
```

---

## 🏗️ Project Structure

```
src/
├── main.ts                          # App bootstrap, Swagger, CORS
├── app.module.ts                    # Root module
├── config/
│   └── configuration.ts            # Environment config
├── common/
│   ├── guards/
│   │   └── api-key.guard.ts        # API key authentication
│   ├── filters/
│   │   └── http-exception.filter.ts # Global error handler
│   └── interceptors/
│       └── transform.interceptor.ts # Response wrapper
├── feedback/
│   ├── feedback.module.ts
│   ├── feedback.controller.ts       # REST endpoints
│   ├── feedback.service.ts          # Business logic
│   ├── dto/
│   │   ├── create-feedback.dto.ts   # Input validation
│   │   ├── query-feedback.dto.ts    # Query params
│   │   └── update-feedback-status.dto.ts
│   └── entities/
│       └── feedback.entity.ts       # Database schema
└── telegram/
    ├── telegram.module.ts
    └── telegram.service.ts          # Telegram Bot API
```

---

## 📄 License

MIT
