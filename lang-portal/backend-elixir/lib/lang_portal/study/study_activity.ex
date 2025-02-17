defmodule LangPortal.Study.StudyActivity do
  use Ecto.Schema
  import Ecto.Changeset

  schema "study_activities" do
    field :name, :string
    field :url, :string

    has_many :study_sessions, LangPortal.Study.StudySession

    timestamps()
  end

  def changeset(study_activity, attrs) do
    study_activity
    |> cast(attrs, [:name, :url])
    |> validate_required([:name, :url])
    |> validate_url(:url)
  end

  defp validate_url(changeset, field) do
    validate_change(changeset, field, fn _, url ->
      case URI.parse(url) do
        %URI{scheme: scheme, host: host} when not is_nil(scheme) and not is_nil(host) ->
          []
        _ ->
          [{field, "must be a valid URL"}]
      end
    end)
  end
end
