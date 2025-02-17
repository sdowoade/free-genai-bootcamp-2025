defmodule LangPortal.Groups.WordsGroups do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  schema "words_groups" do
    belongs_to :word, LangPortal.Words.Word
    belongs_to :group, LangPortal.Groups.Group

    timestamps()
  end

  def changeset(words_groups, attrs) do
    words_groups
    |> cast(attrs, [:word_id, :group_id])
    |> validate_required([:word_id, :group_id])
  end
end
