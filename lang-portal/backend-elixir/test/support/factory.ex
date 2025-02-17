defmodule LangPortal.Factory do
  use ExMachina.Ecto, repo: LangPortal.Repo

  def word_factory do
    %LangPortal.Words.Word{
      yoruba: sequence(:yoruba, &"word#{&1}"),
      english: sequence(:english, &"translation#{&1}"),
      parts: %{
        "use_case" => "formal",
        "gender" => "male",
        "number" => "singular",
        "tone" => "toneless"
      }
    }
  end

  def group_factory do
    %LangPortal.Groups.Group{
      name: sequence(:name, &"Test Group #{&1}"),
      word_count: 0
    }
  end

  def study_activity_factory do
    %LangPortal.Study.StudyActivity{
      name: sequence(:name, &"Activity #{&1}"),
      url: sequence(:url, &"https://example.com/activity#{&1}")
    }
  end

  def study_session_factory do
    %LangPortal.Study.StudySession{
      group_id: insert(:group).id,
      study_activity_id: insert(:study_activity).id
    }
  end

  def word_review_item_factory do
    word = insert(:word)
    session = insert(:study_session)

    %LangPortal.Study.WordReviewItem{
      word_id: word.id,
      study_session_id: session.id,
      correct: true
    }
  end
end
