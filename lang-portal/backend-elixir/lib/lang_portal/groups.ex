defmodule LangPortal.Groups do
  import Ecto.Query
  alias LangPortal.Repo
  alias LangPortal.Groups.Group

  def list_groups(params \\ %{}) do
    page = get_in(params, ["page"]) || "1"
    per_page = get_in(params, ["per_page"]) || "100"

    query = from g in Group

    total_count = Repo.aggregate(query, :count, :id)

    groups = query
    |> paginate(page, per_page)
    |> Repo.all()

    %{
      entries: groups,
      page_number: String.to_integer(page),
      page_size: String.to_integer(per_page),
      total_entries: total_count,
      total_pages: ceil(total_count / String.to_integer(per_page))
    }
  end

  def get_group!(id) do
    Group
    |> Repo.get!(id)
  end

  def get_group_words!(group_id, params \\ %{}) do
    page = get_in(params, ["page"]) || "1"
    per_page = get_in(params, ["per_page"]) || "100"

    query = from(w in LangPortal.Words.Word,
      join: wg in "words_groups",
      on: wg.word_id == w.id,
      where: wg.group_id == ^group_id
    )

    total_count = Repo.aggregate(query, :count, :id)

    words = query
    |> paginate(page, per_page)
    |> Repo.all()

    %{
      entries: words,
      page_number: String.to_integer(page),
      page_size: String.to_integer(per_page),
      total_entries: total_count,
      total_pages: ceil(total_count / String.to_integer(per_page))
    }
  end

  def get_group_study_sessions!(group_id, params \\ %{}) do
    page = get_in(params, ["page"]) || "1"
    per_page = get_in(params, ["per_page"]) || "100"

    query = from(ss in LangPortal.Study.StudySession,
      where: ss.group_id == ^group_id,
      preload: [:study_activity, :group]
    )

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

  defp paginate(query, page, per_page) do
    page = String.to_integer(page)
    per_page = String.to_integer(per_page)

    query
    |> limit(^per_page)
    |> offset(^((page - 1) * per_page))
  end
end
