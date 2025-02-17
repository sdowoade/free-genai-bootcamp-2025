defmodule LangPortalWeb.GroupJSON do
  alias LangPortal.Words
  alias LangPortal.Study

  def index(%{page_data: page_data}) do
    %{
      items: for(group <- page_data.entries, do: data(group)),
      pagination: %{
        current_page: page_data.page_number,
        total_pages: page_data.total_pages,
        total_items: page_data.total_entries,
        items_per_page: page_data.page_size
      }
    }
  end

  def show(%{group: group}) do
    %{
      id: group.id,
      name: group.name,
      stats: %{
        total_word_count: group.word_count
      }
    }
  end

  def words(%{page_data: page_data}) do
    %{
      items: for(word <- page_data.entries, do: %{
        yoruba: word.yoruba,
        english: word.english,
        correct_count: Words.get_word_stats(word.id).correct_count,
        wrong_count: Words.get_word_stats(word.id).wrong_count
      }),
      pagination: %{
        current_page: page_data.page_number,
        total_pages: page_data.total_pages,
        total_items: page_data.total_entries,
        items_per_page: page_data.page_size
      }
    }
  end

  def study_sessions(%{page_data: page_data}) do
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

  defp data(group) do
    %{
      id: group.id,
      name: group.name,
      word_count: group.word_count
    }
  end

  defp session_data(session) do
    stats = Study.get_session_stats(session.id)
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
