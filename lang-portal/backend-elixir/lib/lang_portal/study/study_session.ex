defmodule LangPortal.Study.StudySession do
  use Ecto.Schema
  import Ecto.Changeset

  schema "study_sessions" do
    belongs_to :group, LangPortal.Groups.Group
    belongs_to :study_activity, LangPortal.Study.StudyActivity
    has_many :word_review_items, LangPortal.Study.WordReviewItem

    timestamps()
  end

  def changeset(study_session, attrs) do
    study_session
    |> cast(attrs, [:group_id, :study_activity_id])
    |> validate_required([:group_id, :study_activity_id])
    |> foreign_key_constraint(:group_id)
    |> foreign_key_constraint(:study_activity_id)
  end
end
