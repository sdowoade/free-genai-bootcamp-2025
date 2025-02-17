# Language Learning Portal Backend

A Phoenix-based backend API for a language learning portal that manages vocabulary, study sessions, and learning activities.

## Prerequisites

- Elixir 1.14 or later
- Erlang/OTP 25 or later
- SQLite3

## Setup

1. Install dependencies:

```bash
mix deps.get
```

2. Create and migrate database:

```bash
mix ecto.setup
```

This will:

- Create the database
- Run all migrations
- Seed the database with initial data

## Running the Server

Start the Phoenix server:

```bash
mix phx.server
```

The API will be available at [`localhost:4000/api`](http://localhost:4000/api)

## Development

- Run tests: `mix test`
- Generate migrations: `mix ecto.gen.migration migration_name`
- Run migrations: `mix ecto.migrate`
- Roll back migrations: `mix ecto.rollback`

## Project Structure

```
lib/
  ├── lang_portal/            # Business logic and schemas
  │   ├── words/             # Word-related contexts
  │   ├── groups/            # Group-related contexts
  │   ├── study/             # Study session contexts
  │   └── repo.ex            # Database repo
  └── lang_portal_web/       # Web layer
      ├── controllers/       # API controllers
      ├── views/            # JSON view rendering
      └── router.ex         # API routing
```

## Database Schema

The application uses SQLite3 with the following main tables:

- words
- groups
- words_groups
- study_activities
- study_sessions
- word_review_items

See `priv/repo/migrations` for detailed schema information.

## Testing API Endpoints

### Database Setup

1. Reset and seed the database:

```bash
mix ecto.reset
```

This will drop the database, recreate it, run migrations, and seed it with sample data including:

- Yoruba words with translations
- Word groups (Basics, Family, Home)
- Study activities (Flashcards, Multiple Choice)
- Sample study sessions and reviews

### API Endpoints

Test the following endpoints using curl (or your preferred API client):

1. List Words:

```bash
# List all words
curl "http://localhost:4000/api/words"

# With pagination
curl "http://localhost:4000/api/words?page=1&per_page=2"
```

2. Show Word Details:

```bash
# Replace 1 with actual word ID
curl "http://localhost:4000/api/words/1"
```

3. List Groups:

```bash
# List all groups
curl "http://localhost:4000/api/groups"

# With pagination
curl "http://localhost:4000/api/groups?page=1&per_page=2"
```

4. Show Group Details:

```bash
# Replace 1 with actual group ID
curl "http://localhost:4000/api/groups/1"
```

5. List Words in Group:

```bash
# Replace 1 with actual group ID
curl "http://localhost:4000/api/groups/1/words"
```

6. List Study Activities:

```bash
curl "http://localhost:4000/api/study_activities"
```

7. Create Study Session:

```bash
# Replace group_id and study_activity_id with actual IDs
curl -X POST "http://localhost:4000/api/study_sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "study_session": {
      "group_id": 1,
      "study_activity_id": 1
    }
  }'
```

8. Record Word Review:

```bash
# Replace session_id and word_id with actual IDs
curl -X POST "http://localhost:4000/api/study_sessions/1/review" \
  -H "Content-Type: application/json" \
  -d '{
    "review": {
      "word_id": 1,
      "correct": true
    }
  }'
```

9. List Study Sessions:

```bash
# List all sessions
curl "http://localhost:4000/api/study_sessions"

# List sessions for specific group
curl "http://localhost:4000/api/groups/1/study_sessions"
```

For prettier output, pipe the curl response through jq:

```bash
curl "http://localhost:4000/api/words" | jq
```
