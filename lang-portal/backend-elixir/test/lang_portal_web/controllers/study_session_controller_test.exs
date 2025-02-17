defmodule LangPortalWeb.StudySessionControllerTest do
  use LangPortalWeb.ConnCase
  import LangPortal.Factory

  setup do
    group = insert(:group)
    activity = insert(:study_activity)
    session = insert(:study_session, group_id: group.id, study_activity_id: activity.id)

    # Create some review items
    word = insert(:word)
    insert(:word_review_item, study_session_id: session.id, word_id: word.id, correct: true)
    insert(:word_review_item, study_session_id: session.id, word_id: word.id, correct: false)

    {:ok, %{
      session: session,
      group: group,
      activity: activity,
      word: word
    }}
  end

  describe "index" do
    test "lists all study sessions with pagination", %{conn: conn} do
      # Add more sessions for pagination
      insert_list(3, :study_session)

      conn = get(conn, ~p"/api/study_sessions")

      response = json_response(conn, 200)
      assert %{
        "items" => items,
        "pagination" => %{
          "current_page" => 1,
          "total_items" => total_items
        }
      } = response

      # 2 from seeds + 1 from setup + 3 from insert_list = 6 total
      assert length(items) == 6
      assert total_items == 6

      [first_item | _] = items
      assert %{
        "id" => _,
        "activity_name" => _,
        "group_name" => _,
        "start_time" => _,
        "end_time" => _,
        "review_items_count" => count
      } = first_item
      assert is_integer(count)
    end
  end

  describe "show" do
    test "returns study session with stats", %{conn: conn, session: session} do
      conn = get(conn, ~p"/api/study_sessions/#{session.id}")

      response = json_response(conn, 200)
      assert %{
        "id" => id,
        "activity_name" => _,
        "group_name" => _,
        "start_time" => _,
        "end_time" => _,
        "stats" => %{
          "total_items" => 2,
          "correct_items" => 1
        }
      } = response

      assert id == session.id
    end
  end

  describe "create" do
    test "creates study session with valid data", %{conn: conn, group: group, activity: activity} do
      params = %{
        "study_session" => %{
          "group_id" => group.id,
          "study_activity_id" => activity.id
        }
      }

      conn = post(conn, ~p"/api/study_sessions", params)

      response = json_response(conn, 201)
      assert %{
        "id" => id,
        "activity_name" => activity_name,
        "group_name" => group_name
      } = response

      assert activity_name == activity.name
      assert group_name == group.name
      assert Enum.find(conn.resp_headers, fn {key, _} -> key == "location" end) |> elem(1) =~ ~r|/api/study_sessions/#{id}|
    end

    test "returns error with invalid data", %{conn: conn} do
      params = %{
        "study_session" => %{
          "group_id" => "invalid",
          "study_activity_id" => "invalid"
        }
      }

      conn = post(conn, ~p"/api/study_sessions", params)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "create_review" do
    test "creates word review item", %{conn: conn, session: session, word: word} do
      params = %{
        "review" => %{
          "word_id" => word.id,
          "correct" => true
        }
      }

      conn = post(conn, ~p"/api/study_sessions/#{session.id}/review", params)

      response = json_response(conn, 201)
      assert %{
        "id" => _,
        "word_id" => word_id,
        "correct" => correct
      } = response

      assert word_id == word.id
      assert correct == true
    end

    test "returns error with invalid data", %{conn: conn, session: session} do
      params = %{
        "review" => %{
          "word_id" => "invalid",
          "correct" => "invalid"
        }
      }

      conn = post(conn, ~p"/api/study_sessions/#{session.id}/review", params)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end
end
