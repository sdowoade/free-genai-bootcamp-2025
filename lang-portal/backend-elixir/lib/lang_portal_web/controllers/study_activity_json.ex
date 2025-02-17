defmodule LangPortalWeb.StudyActivityJSON do
  def show(%{activity: activity}) do
    %{
      id: activity.id,
      name: activity.name,
      url: activity.url
    }
  end

  def index(%{page_data: page_data}) do
    %{
      items: for(activity <- page_data.entries, do: %{
        id: activity.id,
        name: activity.name,
        url: activity.url
      }),
      pagination: %{
        current_page: page_data.page_number,
        total_pages: page_data.total_pages,
        total_items: page_data.total_entries,
        items_per_page: page_data.page_size
      }
    }
  end
end
