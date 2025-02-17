defmodule LangPortal.Words do
  import Ecto.Query
  alias LangPortal.Repo
  alias LangPortal.Words.Word
  alias LangPortal.Study.WordReviewItem

  def list_words(params \\ %{}) do
    page = get_in(params, ["page"]) || "1"
    per_page = get_in(params, ["per_page"]) || "100"

    query = from w in Word

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

  def get_word!(id) do
    Word
    |> Repo.get!(id)
    |> Repo.preload(:groups)
  end

  def get_word_stats(word_id) do
    from(r in WordReviewItem,
      where: r.word_id == ^word_id,
      select: %{
        correct_count: fragment("SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END)"),
        wrong_count: fragment("SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END)")
      }
    )
    |> Repo.one()
  end

  defp paginate(query, page, per_page) do
    page = String.to_integer(page)
    per_page = String.to_integer(per_page)

    query
    |> limit(^per_page)
    |> offset(^((page - 1) * per_page))
  end
end
