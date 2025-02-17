defmodule LangPortal.Study.WordReviewItem do
  use Ecto.Schema
  import Ecto.Changeset

  schema "word_review_items" do
    field :correct, :boolean
    belongs_to :word, LangPortal.Words.Word
    belongs_to :study_session, LangPortal.Study.StudySession

    timestamps()
  end

  def changeset(word_review_item, attrs) do
    word_review_item
    |> cast(attrs, [:word_id, :study_session_id, :correct])
    |> validate_required([:word_id, :study_session_id, :correct])
    |> foreign_key_constraint(:word_id)
    |> foreign_key_constraint(:study_session_id)
  end
end
