defmodule LangPortalWeb.GroupController do
  use LangPortalWeb, :controller
  alias LangPortal.Groups

  def index(conn, params) do
    page_data = Groups.list_groups(params)
    render(conn, :index, page_data: page_data)
  end

  def show(conn, %{"id" => id}) do
    group = Groups.get_group!(id)
    render(conn, :show, group: group)
  end

  def words(conn, %{"group_id" => group_id} = params) do
    page_data = Groups.get_group_words!(group_id, params)
    render(conn, :words, page_data: page_data)
  end

  def study_sessions(conn, %{"group_id" => group_id} = params) do
    page_data = Groups.get_group_study_sessions!(group_id, params)
    render(conn, :study_sessions, page_data: page_data)
  end
end
