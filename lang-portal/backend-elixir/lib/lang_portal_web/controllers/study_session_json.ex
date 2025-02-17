defmodule LangPortalWeb.StudySessionJSON do
  def index(%{page_data: page_data}) do
    %{
      items: for(session <- page_data.entries, do: session_data(session)),
      pagination: %{
        current_page: page_data.page_number,
        total_pages: page_data.total_pages,
        total_items: page_data.total_entries,
        items_per_page: page_data.page_size
      }
    }
  end

  def show(%{session: session, stats: stats}) do
    session_data(session)
    |> Map.put(:stats, stats)
  end

  def review(%{review: review}) do
    %{
      id: review.id,
      word_id: review.word_id,
      correct: review.correct
    }
  end

  def error(%{errors: changeset}) do
    %{errors: Ecto.Changeset.traverse_errors(changeset, &translate_error/1)}
  end

  defp translate_error({msg, opts}) do
    Enum.reduce(opts, msg, fn {key, value}, acc ->
      String.replace(acc, "%{#{key}}", fn _ -> to_string(value) end)
    end)
  end

  defp session_data(session) do
    stats = LangPortal.Study.get_session_stats(session.id)
    %{
      id: session.id,
      activity_name: session.study_activity.name,
      group_name: session.group.name,
      start_time: session.inserted_at,
      end_time: session.updated_at,
      review_items_count: stats.total_items
    }
  end
end
