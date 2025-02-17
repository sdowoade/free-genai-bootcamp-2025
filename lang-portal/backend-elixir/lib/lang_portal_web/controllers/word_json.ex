defmodule LangPortalWeb.WordJSON do
  alias LangPortal.Words

  def index(%{page_data: page_data}) do
    %{
      items: for(word <- page_data.entries, do: data(word, Words.get_word_stats(word.id))),
      pagination: %{
        current_page: page_data.page_number,
        total_pages: page_data.total_pages,
        total_items: page_data.total_entries,
        items_per_page: page_data.page_size
      }
    }
  end

  def show(%{word: word, stats: stats}) do
    %{
      yoruba: word.yoruba,
      english: word.english,
      stats: stats,
      groups: for(group <- word.groups, do: %{
        id: group.id,
        name: group.name
      })
    }
  end

  defp data(word, stats) do
    %{
      yoruba: word.yoruba,
      english: word.english,
      parts: word.parts,
      correct_count: stats.correct_count,
      wrong_count: stats.wrong_count
    }
  end
end
