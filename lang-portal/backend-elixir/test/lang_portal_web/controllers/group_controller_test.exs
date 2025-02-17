defmodule LangPortalWeb.GroupControllerTest do
  use LangPortalWeb.ConnCase
  import LangPortal.Factory

  setup do
    # Create test data
    group = insert(:group)
    words = insert_list(3, :word)

    # Associate words with group
    Enum.each(words, fn word ->
      %LangPortal.Groups.WordsGroups{
        word_id: word.id,
        group_id: group.id
      }
      |> LangPortal.Repo.insert!()
    end)

    # Create study sessions for group
    activity = insert(:study_activity)
    sessions = insert_list(2, :study_session, group_id: group.id, study_activity_id: activity.id)

    {:ok, %{group: group, words: words, sessions: sessions}}
  end

  describe "index" do
    test "lists all groups with pagination", %{conn: conn} do
      insert_list(3, :group)

      conn = get(conn, ~p"/api/groups")

      response = json_response(conn, 200)
      assert %{
        "items" => items,
        "pagination" => %{
          "current_page" => 1,
          "total_items" => total
        }
      } = response

      assert length(items) == 6  # 2 from seeds + 1 from setup + 3 from insert_list
      assert total == 6
    end
  end

  describe "show" do
    test "returns group with stats", %{conn: conn, group: group} do
      conn = get(conn, ~p"/api/groups/#{group.id}")

      response = json_response(conn, 200)
      assert %{
        "id" => id,
        "name" => name,
        "stats" => %{
          "total_word_count" => count
        }
      } = response

      assert id == group.id
      assert name == group.name
      assert count == group.word_count
    end
  end

  describe "group words" do
    test "lists words in group with stats", %{conn: conn, group: group} do
      conn = get(conn, ~p"/api/groups/#{group.id}/words")

      assert %{
        "items" => items,
        "pagination" => %{
          "total_items" => 3
        }
      } = json_response(conn, 200)

      assert length(items) == 3

      Enum.each(items, fn item ->
        assert %{
          "yoruba" => _,
          "english" => _,
          "correct_count" => _,
          "wrong_count" => _
        } = item
      end)
    end
  end

  describe "group study sessions" do
    test "lists study sessions for group", %{conn: conn, group: group} do
      conn = get(conn, ~p"/api/groups/#{group.id}/study_sessions")

      response = json_response(conn, 200)
      assert %{
        "items" => items,
        "pagination" => %{
          "total_items" => 2
        }
      } = response

      assert length(items) == 2

      group_name = group.name  # Get the name before pattern matching
      Enum.each(items, fn item ->
        assert %{
          "id" => _,
          "activity_name" => _,
          "group_name" => name,
          "start_time" => _,
          "end_time" => _,
          "review_items_count" => _
        } = item
        assert name == group_name
      end)
    end
  end
end
