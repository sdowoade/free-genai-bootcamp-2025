defmodule LangPortal.Repo.Migrations.CreateInitialTables do
  use Ecto.Migration

  def change do
    create table(:words) do
      add :yoruba, :string, null: false
      add :english, :string, null: false
      add :parts, :map, null: false

      timestamps()
    end

    create table(:groups) do
      add :name, :string, null: false
      add :word_count, :integer, default: 0

      timestamps()
    end

    create table(:words_groups) do
      add :word_id, references(:words, on_delete: :delete_all), null: false
      add :group_id, references(:groups, on_delete: :delete_all), null: false

      timestamps()
    end

    create table(:study_activities) do
      add :name, :string, null: false
      add :url, :string, null: false

      timestamps()
    end

    create table(:study_sessions) do
      add :group_id, references(:groups, on_delete: :nilify_all), null: false
      add :study_activity_id, references(:study_activities, on_delete: :nilify_all), null: false

      timestamps()
    end

    create table(:word_review_items) do
      add :word_id, references(:words, on_delete: :nilify_all), null: false
      add :study_session_id, references(:study_sessions, on_delete: :delete_all), null: false
      add :correct, :boolean, null: false

      timestamps()
    end

    # Create indexes
    create index(:words_groups, [:word_id])
    create index(:words_groups, [:group_id])
    create unique_index(:words_groups, [:word_id, :group_id])

    create index(:study_sessions, [:group_id])
    create index(:study_sessions, [:study_activity_id])

    create index(:word_review_items, [:word_id])
    create index(:word_review_items, [:study_session_id])
  end
end
