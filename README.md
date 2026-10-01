# Lumen: Personalized News Aggregator

A full-stack final-year project. Lumen recommends news using **content similarity (TF-IDF + cosine)**, **reading behaviour** and **user interests**, and explains every recommendation.

**Stack:** React (Vite) · Node.js + Express · MongoDB (Mongoose) · custom NLP engine (no external ML libraries)

## Pages (14)
| Page | Route | Purpose |
|---|---|---|
| Landing | `/` | Interactive demo: change interests, watch ranking change |
| How it works | `/how-it-works` | Algorithm explained (useful for viva/report) |
| Sign in / Register | `/login`, `/register` | JWT authentication, demo logins |
| Onboarding | `/onboarding` | Pick interests (cold-start seeding) |
| For you | `/feed` | Personalised feed with match %, reasons, "Not interested" |
| Explore | `/explore` | Search, category filter, sort, load more |
| Trending | `/trending` | Time-decayed popularity ranking |
| Article | `/article/:id` | Summary, keywords, tone, reading progress, similar stories |
| Saved | `/saved` | Reading list |
| History | `/history` | Grouped by day, shows read vs skimmed |
| Insights | `/insights` | Streak, minutes, activity chart, interest profile, tone mix |
| Settings | `/settings` | Name, topics, theme, reset personalization |
| Admin | `/admin` | Stats, add story, delete, **RSS import** |
| 404 | `*` | Friendly not-found page |

## Run it (VS Code)
Prerequisites: Node.js 18+, MongoDB running locally (or an Atlas URI).

```bash
# Terminal 1: API
cd server
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run seed                # 32 sample stories + demo users
npm run dev                 # http://localhost:5000

# Terminal 2: client
cd client
npm install
npm run dev                 # http://localhost:5173
```
Logins: `demo@lumen.dev / demo123` (reader) and `admin@lumen.dev / admin123` (admin).
Run the NLP/recommender tests (no database needed): `cd server && npm test`.

## Project structure
```
server/
  nlp/index.js            tokenizer, stemmer, TF-IDF terms, keywords, summary, sentiment
  recommender/engine.js   index, profile update, ranking, similarity (pure functions)
  recommender/store.js    in-memory TF-IDF index cache
  recommender/signals.js  interaction weights
  models/                 User, Article, Interaction
  routes/                 auth, articles, recommend, me, admin
  seed.js, test/          sample data, unit tests
client/src/
  pages/  components/  ctx.jsx (auth, theme, toasts)  styles.css
```

## Recommendation algorithm
```
score = 0.40 * cosine(userProfile, articleVector)
      + 0.30 * categoryAffinity
      + 0.20 * exp(-ageDays / 6)
      + 0.10 * log(1 + views + 3*likes + 2*saves) / max
```
- Article vectors: `(1 + log tf) * idf`, L2-normalised.
- User profile: weighted sum of vectors from interactions (open +1, read 20s+ +2, like/save +3, not interested −3) with 3% decay per update.
- Already-opened stories ×0.35; hidden stories removed.
- Match % = score relative to the best candidate. Reasons come from category and keyword overlap.

## API summary
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/auth/register`, `/login` | returns JWT |
| GET/PATCH | `/api/auth/me` | profile, interests, theme |
| GET | `/api/recommendations?category=` | ranked feed + profile terms |
| GET | `/api/articles?q=&category=&sort=&page=` | search and browse |
| GET | `/api/articles/trending`, `/:id` | article includes similar stories |
| POST | `/api/articles/:id/view`, `/read`, `/like`, `/save`, `/dislike` | behaviour tracking |
| GET/DELETE | `/api/me/saved`, `/history`, `/insights` | personal data |
| GET/POST/DELETE | `/api/admin/*` | stats, articles, RSS ingest (admin only) |

## Database (MongoDB)
- **users**: name, email, password (bcrypt), role, interests, profile (term→weight), categoryScores, liked/saved/disliked
- **articles**: title, content, excerpt, summary[], keywords[], terms{}, sentiment, readingTime, category, source, url, counters
- **interactions**: user, article, type, dwell seconds, read flag, timestamps

## Possible viva questions
- *Why TF-IDF and cosine?* Simple, explainable and fast; each score can be traced to words.
- *Cold start?* Onboarding interests seed the profile; fresh and popular stories fill the gap.
- *Filter bubble?* Freshness and popularity terms, plus Explore and Trending, expose new topics. A diversity re-rank is a good extension.
- *Scalability?* The in-memory index suits thousands of articles; use a vector DB or ANN search beyond that.

## Future work
Sentence embeddings (BERT), collaborative filtering, scheduled RSS ingestion, email digests, A/B tests of the weights, evaluation with precision@k on held-out interactions.

*Sample articles are fictional and written for demonstration.*
