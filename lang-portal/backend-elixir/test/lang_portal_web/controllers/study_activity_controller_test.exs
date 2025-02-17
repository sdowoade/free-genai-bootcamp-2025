defmodule LangPortalWeb.StudyActivityControllerTest do
  use LangPortalWeb.ConnCase
  import LangPortal.Factory

  setup do
    activity = insert(:study_activity)
    group = insert(:group)
    sessions = insert_list(2, :study_session, group_id: group.id, study_activity_id: activity.id)

    {:ok, %{activity: activity, sessions: sessions}}
  end

  describe "index" do
    test "lists all study activities with pagination", %{conn: conn} do
      # Add more activities for pagination
      insert_list(3, :study_activity)

      conn = get(conn, ~p"/api/study_activities")

      response = json_response(conn, 200)
      assert %{
        "items" => items,
        "pagination" => %{
          "current_page" => 1,
          "total_items" => total_items,
          "items_per_page" => 100
        }
      } = response

      assert length(items) == 6  # 2 from seeds + 1 from setup + 3 from insert_list
      assert total_items == 6

      [first_item | _] = items
      assert %{
        "id" => _,
        "name" => _,
        "url" => url
      } = first_item
      assert String.starts_with?(url, "https://")
    end

    test "supports pagination parameters", %{conn: conn} do
      insert_list(4, :study_activity)

      conn = get(conn, ~p"/api/study_activities", %{"page" => "2", "per_page" => "2"})

      response = json_response(conn, 200)
      assert %{
        "items" => items,
        "pagination" => pagination
      } = response

      assert length(items) == 2
      assert pagination["current_page"] == 2
      assert pagination["items_per_page"] == 2
    end
  end

  describe "show" do
    test "returns study activity details", %{conn: conn, activity: activity} do
      conn = get(conn, ~p"/api/study_activities/#{activity.id}")

      response = json_response(conn, 200)
      assert %{
        "id" => id,
        "name" => name,
        "url" => url
      } = response

      assert id == activity.id
      assert name == activity.name
      assert url == activity.url
    end

    test "returns error for non-existent activity", %{conn: conn} do
      assert_error_sent 404, fn ->
        get(conn, ~p"/api/study_activities/999999")
      end
    end
  end
end
