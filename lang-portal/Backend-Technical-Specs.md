# Backend Elixir Technical Specs

## Business Goal:

A language learning school wants to build a prototype of learning portal which will act as three things:

- Inventory of possible vocabulary that can be learned
- Act as a record store, providing correct and wrong score on practice vocabulary
- A unified launchpad to launch different learning apps

## Technical Requirements

- The backend will be built using Elixir and Phoenix Framework
- It will be built using Elixir and Phoenix Framework best practices
- The database will be SQLite3 with Ecto as the ORM
- Write migrations for the database
- Write seeds for the database
- Write tests for the API
- The API will be built using the Phoenix Framework and will be RESTful
- The API will always return JSON
- There will no authentication or authorization since this is a prototype
- It will be a single user application

## Database Schema

Our database will be a single sqlite database

With the following tables:

- words - stored vocabulary words
  - id integer (Primary Key): Unique identifier for each word
  - yoruba string (Required): Yoruba word
  - english string (Required): English translation of the word
  - parts json (Required, format: {"use_case": "{formal|informal}", "gender": "{male|female}", "number": "{singular|plural}", "tone": "{toneless|toned}"}): Word components stored in JSON format
- words_groups - join table enabling many-to-many relationship between words and groups.
  - id integer (Primary Key): Unique identifier for each word group
  - word_id integer (Required): Foreign key reference to the word
  - group_id integer (Required): Foreign key reference to the group
- groups - Manages collections of words
  - id integer (Primary Key): Unique identifier for each group
  - name string (Required): Name of the group
  - word_count integer (Default: 0): Number of words in the group
- study_activities - different types of study activities available.
  - id integer (Primary Key): Unique identifier for each study activity
  - name string (Required): Name of the study activity
  - url string (Required): The full URL of the study activity
- study_sessions - records of study sessions grouping word_review_items
  - id integer (Primary Key): Unique identifier for each study session
  - group_id integer (Required): Foreign key reference to the group
  - created_at datetime (Default: Current Time): Timestamp of when the study session was created
  - study_activity_id integer (Required): Foreign key reference to the study activity
- word_review_items - Tracks individual word reviews within study sessions.
  - id integer (Primary Key): Unique identifier for each word review
  - word_id integer (Required): Foreign key reference to the word
  - study_session_id integer (Required): Foreign key reference to the study session
  - correct boolean (Required): Indicates if the word was reviewed correctly
  - created_at datetime (Default: Current Time): Timestamp of when the word review was created

## API Endpoints

### GET /api/study_activities/:id

#### JSON Response

```json
{
  "id": "{{study_activity_id}}",
  "name": "{{study_activity_name}}",
  "description": "{{study_activity_description}}"
}
```

### GET /api/study_activities/:id/study_sessions

- pagination with 100 items per page

```json
{
  "items": [
    {
      "id": "{{study_session_id}}",
      "activity_name": "{{study_activity_name}}",
      "group_name": "{{group_name}}",
      "start_time": "{{start_time}}",
      "end_time": "{{end_time}}",
      "review_items_count": "{{review_items_count}}"
    }
  ],
  "pagination": {
    "current_page": "{{current_page}}",
    "total_pages": "{{total_pages}}",
    "total_items": "{{total_items}}",
    "items_per_page": "{{items_per_page}}"
  }
}
```

### GET /api/words

- pagination with 100 items per page

#### JSON Response

```json
{
  "items": [
    {
      "yoruba": "{{yoruba_word}}",
      "english": "{{english_word}}",
      "parts": "{{parts}}",
      "correct_count": "{{correct_count}}",
      "wrong_count": "{{wrong_count}}"
    }
  ],
  "pagination": {
    "current_page": "{{current_page}}",
    "total_pages": "{{total_pages}}",
    "total_items": "{{total_items}}",
    "items_per_page": "{{items_per_page}}"
  }
}
```

### GET /api/words/:id

#### JSON Response

```json
{
  "yoruba": "{{yoruba_word}}",
  "english": "{{english_word}}",
  "stats": {
    "correct_count": "{{correct_count}}",
    "wrong_count": "{{wrong_count}}"
  },
  "groups": [
    {
      "id": "{{group_id}}",
      "name": "{{group_name}}"
    }
  ]
}
```

### GET /api/groups

- pagination with 100 items per page

#### JSON Response

```json
{
  "items": [
    {
      "id": "{{group_id}}",
      "name": "{{group_name}}",
      "word_count": "{{word_count}}"
    }
  ],
  "pagination": {
    "current_page": "{{current_page}}",
    "total_pages": "{{total_pages}}",
    "total_items": "{{total_items}}",
    "items_per_page": "{{items_per_page}}"
  }
}
```

### GET /api/groups/:id

#### JSON Response

```json
{
  "id": "{{group_id}}",
  "name": "{{group_name}}",
  "stats": {
    "total_word_count": "{{total_word_count}}"
  }
}
```

### GET /api/groups/:id/words

#### JSON Response

```json
{
  "items": [
    {
      "yoruba": "{{yoruba_word}}",
      "english": "{{english_word}}",
      "correct_count": "{{correct_count}}",
      "wrong_count": "{{wrong_count}}"
    }
  ],
  "pagination": {
    "current_page": "{{current_page}}",
    "total_pages": "{{total_pages}}",
    "total_items": "{{total_items}}",
    "items_per_page": "{{items_per_page}}"
  }
}
```

### GET /api/groups/:id/study_sessions

#### JSON Response

```json
{
  "items": [
    {
      "id": "{{study_session_id}}",
      "activity_name": "{{activity_name}}",
      "group_name": "{{group_name}}",
      "start_time": "{{start_time}}",
      "end_time": "{{end_time}}",
      "review_items_count": "{{review_items_count}}"
    }
  ],
  "pagination": {
    "current_page": "{{current_page}}",
    "total_pages": "{{total_pages}}",
    "total_items": "{{total_items}}",
    "items_per_page": "{{items_per_page}}"
  }
}
```

### GET /api/study_sessions

- pagination with 100 items per page

#### JSON Response

```json
{
  "items": [
    {
      "id": "{{study_session_id}}",
      "activity_name": "{{activity_name}}",
      "group_name": "{{group_name}}",
      "start_time": "{{start_time}}",
      "end_time": "{{end_time}}",
      "review_items_count": "{{review_items_count}}"
    }
  ],
  "pagination": {
    "current_page": "{{current_page}}",
    "total_pages": "{{total_pages}}",
    "total_items": "{{total_items}}",
    "items_per_page": "{{items_per_page}}"
  }
}
```

### GET /api/study_sessions/:id

#### JSON Response

```json
{
  "id": "{{study_session_id}}",
  "activity_name": "{{activity_name}}",
  "group_name": "{{group_name}}",
  "start_time": "{{start_time}}",
  "end_time": "{{end_time}}",
  "review_items_count": "{{review_items_count}}"
}
```

### GET /api/study_sessions

- pagination with 100 items per page

#### JSON Response

```json
{
  "items": [
    {
      "yoruba": "{{yoruba}}",
      "english": "{{english}}",
      "correct_count": "{{correct_count}}",
      "wrong_count": "{{wrong_count}}"
    }
  ],
  "pagination": {
    "current_page": "{{current_page}}",
    "total_pages": "{{total_pages}}",
    "total_items": "{{total_items}}",
    "items_per_page": "{{items_per_page}}"
  }
}
```

### POST /api/study_sessions

#### Request Body

```json
{
  "group_id": "{{group_id}}",
  "study_activity_id": "{{study_activity_id}}"
}
```

#### JSON Response

```json
{
  "id": "{{study_session_id}}",
  "activity_name": "{{activity_name}}",
  "group_name": "{{group_name}}",
  "start_time": "{{start_time}}",
  "end_time": "{{end_time}}",
  "review_items_count": "{{review_items_count}}"
}
```

### POST /api/study_sessions/:id/review

- This endpoint will be used to record the result of a word review

#### Request Body

```json
{
  "word_id": "{{word_id}}",
  "correct": "{{correct}}"
}
```

#### JSON Response

```json
{
  "id": "{{word_review_item_id}}",
  "word_id": "{{word_id}}",
  "correct": "{{correct}}"
}
```

### SQLite Compatibility
- GROUP BY queries should avoid redundant grouping
- Use explicit 1/0 for boolean comparisons in fragments
- Example:
  ```elixir
  fragment("SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END)")
  ```

### Factory Guidelines
- Use foreign keys (`_id`) instead of associations in factories
- Example:
  ```elixir
  def study_session_factory do
    %StudySession{
      group_id: insert(:group).id,
      study_activity_id: insert(:study_activity).id
    }
  end
  ```
- Avoid mixing association and foreign key settings