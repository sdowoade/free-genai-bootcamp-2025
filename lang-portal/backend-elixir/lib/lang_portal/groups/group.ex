defmodule LangPortal.Groups.Group do
  use Ecto.Schema
  import Ecto.Changeset

  schema "groups" do
    field :name, :string
    field :word_count, :integer, default: 0

    many_to_many :words, LangPortal.Words.Word, join_through: "words_groups"
    has_many :study_sessions, LangPortal.Study.StudySession

    timestamps()
  end

  def changeset(group, attrs) do
    group
    |> cast(attrs, [:name, :word_count])
    |> validate_required([:name])
    |> validate_number(:word_count, greater_than_or_equal_to: 0)
  end
end
