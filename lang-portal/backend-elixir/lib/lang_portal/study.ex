defmodule LangPortal.Study do
  import Ecto.Query
  alias LangPortal.Repo
  alias LangPortal.Study.{StudyActivity, StudySession, WordReviewItem}

  def list_study_activities(params \\ %{}) do
    page = get_in(params, ["page"]) || "1"
    per_page = get_in(params, ["per_page"]) || "100"

    query = from sa in StudyActivity

    total_count = Repo.aggregate(query, :count, :id)

    activities = query
    |> paginate(page, per_page)
    |> Repo.all()

    %{
      entries: activities,
      page_number: String.to_integer(page),
      page_size: String.to_integer(per_page),
      total_entries: total_count,
      total_pages: ceil(total_count / String.to_integer(per_page))
    }
  end

  def list_study_sessions(params \\ %{}) do
    page = get_in(params, ["page"]) || "1"
    per_page = get_in(params, ["per_page"]) || "100"

    query = from ss in StudySession,
      preload: [:group, :study_activity]

    total_count = Repo.aggregate(query, :count, :id)

    sessions = query
    |> paginate(page, per_page)
    |> Repo.all()

    %{
      entries: sessions,
      page_number: String.to_integer(page),
      page_size: String.to_integer(per_page),
      total_entries: total_count,
      total_pages: ceil(total_count / String.to_integer(per_page))
    }
  end

  def get_study_activity!(id) do
    StudyActivity
    |> Repo.get!(id)
  end

  def get_study_session!(id) do
    StudySession
    |> Repo.get!(id)
    |> Repo.preload([:group, :study_activity, :word_review_items])
  end

  def create_study_session(attrs \\ %{}) do
    %StudySession{}
    |> StudySession.changeset(attrs)
    |> Repo.insert()
  end

  def create_word_review(attrs \\ %{}) do
    %WordReviewItem{}
    |> WordReviewItem.changeset(attrs)
    |> Repo.insert()
  end

  def get_session_stats(session_id) do
    result = from(wri in WordReviewItem,
      where: wri.study_session_id == ^session_id,
      select: %{
        total_items: count(wri.id),
        correct_items: fragment("SUM(CASE WHEN correct THEN 1 ELSE 0 END)")
      }
    )
    |> Repo.one()

    case result do
      nil -> %{total_items: 0, correct_items: 0}
      stats -> stats
    end
  end

  defp paginate(query, page, per_page) do
    page = String.to_integer(page)
    per_page = String.to_integer(per_page)

    query
    |> limit(^per_page)
    |> offset(^((page - 1) * per_page))
  end
end
