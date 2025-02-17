# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias LangPortal.Repo
alias LangPortal.Words.Word
alias LangPortal.Groups.Group
alias LangPortal.Study.{StudyActivity, StudySession, WordReviewItem}

# Create Words
words = [
  %{
    yoruba: "ọmọ",
    english: "child",
    parts: %{
      "use_case" => "formal",
      "gender" => "neutral",
      "number" => "singular",
      "tone" => "toned"
    }
  },
  %{
    yoruba: "ilé",
    english: "house",
    parts: %{
      "use_case" => "formal",
      "gender" => "neutral",
      "number" => "singular",
      "tone" => "toned"
    }
  },
  %{
    yoruba: "oúnjẹ",
    english: "food",
    parts: %{
      "use_case" => "formal",
      "gender" => "neutral",
      "number" => "singular",
      "tone" => "toned"
    }
  }
]

created_words = Enum.map(words, fn word_attrs ->
  %Word{}
  |> Word.changeset(word_attrs)
  |> Repo.insert!()
end)

# Create Groups
groups = [
  %{name: "Basics", word_count: 2},
  %{name: "Family", word_count: 1},
  %{name: "Home", word_count: 1}
]

created_groups = Enum.map(groups, fn group_attrs ->
  %Group{}
  |> Group.changeset(group_attrs)
  |> Repo.insert!()
end)

# Associate Words with Groups
[basics, family, home] = created_groups
[child, house, food] = created_words

# Create associations through the join table directly
now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

Repo.insert_all("words_groups", [
  %{
    word_id: child.id,
    group_id: basics.id,
    inserted_at: now,
    updated_at: now
  },
  %{
    word_id: food.id,
    group_id: basics.id,
    inserted_at: now,
    updated_at: now
  },
  %{
    word_id: child.id,
    group_id: family.id,
    inserted_at: now,
    updated_at: now
  },
  %{
    word_id: house.id,
    group_id: home.id,
    inserted_at: now,
    updated_at: now
  }
])

# Create Study Activities
activities = [
  %{
    name: "Flashcards",
    url: "https://example.com/flashcards"
  },
  %{
    name: "Multiple Choice",
    url: "https://example.com/quiz"
  }
]

created_activities = Enum.map(activities, fn activity_attrs ->
  %StudyActivity{}
  |> StudyActivity.changeset(activity_attrs)
  |> Repo.insert!()
end)

# Create Study Sessions
[flashcards, quiz] = created_activities

session1 = %StudySession{}
|> StudySession.changeset(%{
  group_id: basics.id,
  study_activity_id: flashcards.id
})
|> Repo.insert!()

  session2 = %StudySession{}
  |> StudySession.changeset(%{
    group_id: family.id,
    study_activity_id: quiz.id
  })
  |> Repo.insert!()

  # Create Word Review Items
  [
    %{word_id: child.id, study_session_id: session1.id, correct: true},
    %{word_id: food.id, study_session_id: session1.id, correct: false},
    %{word_id: child.id, study_session_id: session2.id, correct: true}
  ]
  |> Enum.each(fn review_attrs ->
    %WordReviewItem{}
    |> WordReviewItem.changeset(review_attrs)
    |> Repo.insert!()
  end)

  # Create some test groups
  group1 = Repo.insert!(%Group{name: "Group 1", word_count: 0})
  group2 = Repo.insert!(%Group{name: "Group 2", word_count: 0})

  IO.puts "Database seeded successfully!"
