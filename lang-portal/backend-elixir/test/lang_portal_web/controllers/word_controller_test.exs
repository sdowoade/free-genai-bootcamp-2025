defmodule LangPortalWeb.WordControllerTest do
  use LangPortalWeb.ConnCase
  import LangPortal.Factory

  setup do
    # Create test data
    word = insert(:word)
    group = insert(:group)

    # Create word-group association
    %LangPortal.Groups.WordsGroups{}
    |> LangPortal.Groups.WordsGroups.changeset(%{
      word_id: word.id,
      group_id: group.id
    })
    |> LangPortal.Repo.insert!()

    # Create some review items - use foreign keys instead of associations
    session = insert(:study_session)
    insert(:word_review_item, word_id: word.id, study_session_id: session.id, correct: true)
    insert(:word_review_item, word_id: word.id, study_session_id: session.id, correct: false)

    {:ok, %{word: word, group: group}}
  end

  describe "index" do
    test "lists all words with pagination", %{conn: conn} do
      # Insert additional words for pagination testing
      insert_list(5, :word)

      conn = get(conn, ~p"/api/words")

      assert %{
        "items" => items,
        "pagination" => %{
          "current_page" => 1,
          "items_per_page" => 100,
          "total_items" => total_items,
          "total_pages" => _
        }
      } = json_response(conn, 200)

      assert length(items) == 8  # 2 from seeds + 1 from setup + 5 from insert_list
      assert total_items == 8
    end

    test "supports pagination parameters", %{conn: conn} do
      insert_list(5, :word)

      conn = get(conn, ~p"/api/words", %{"page" => "2", "per_page" => "2"})

      assert %{
        "items" => items,
        "pagination" => %{
          "current_page" => 2,
          "items_per_page" => 2
        }
      } = json_response(conn, 200)

      assert length(items) == 2
    end
  end

  describe "show" do
    test "returns word with stats and groups", %{conn: conn, word: word} do
      conn = get(conn, ~p"/api/words/#{word.id}")

      response = json_response(conn, 200)
      assert %{
        "yoruba" => yoruba,
        "english" => english,
        "stats" => %{
          "correct_count" => 1,
          "wrong_count" => 1
        },
        "groups" => [%{"id" => _, "name" => _}]
      } = response

      assert yoruba == word.yoruba
      assert english == word.english
    end

    test "returns error for non-existent word", %{conn: conn} do
      assert_error_sent 404, fn ->
        get(conn, ~p"/api/words/999999")
      end
    end
  end
end
