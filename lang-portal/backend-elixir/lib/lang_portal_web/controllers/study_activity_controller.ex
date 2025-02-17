defmodule LangPortalWeb.StudyActivityController do
  use LangPortalWeb, :controller
  alias LangPortal.Study

  def index(conn, params) do
    page_data = Study.list_study_activities(params)
    render(conn, :index, page_data: page_data)
  end

  def show(conn, %{"id" => id}) do
    activity = Study.get_study_activity!(id)
    render(conn, :show, activity: activity)
  end
end
