defmodule LangPortalWeb.WordController do
  use LangPortalWeb, :controller
  alias LangPortal.Words

  def index(conn, params) do
    page_data = Words.list_words(params)
    render(conn, :index, page_data: page_data)
  end

  def show(conn, %{"id" => id}) do
    word = Words.get_word!(id)
    stats = Words.get_word_stats(id)
    render(conn, :show, word: word, stats: stats)
  end
end
