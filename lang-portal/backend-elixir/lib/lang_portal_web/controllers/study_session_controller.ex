defmodule LangPortalWeb.StudySessionController do
  use LangPortalWeb, :controller
  alias LangPortal.Study
  alias LangPortal.Repo

  def index(conn, params) do
    page_data = Study.list_study_sessions(params)
    render(conn, :index, page_data: page_data)
  end

  def show(conn, %{"id" => id}) do
    session = Study.get_study_session!(id)
    stats = Study.get_session_stats(id)
    render(conn, :show, session: session, stats: stats)
  end

  def create(conn, %{"study_session" => session_params}) do
    case Study.create_study_session(session_params) do
      {:ok, session} ->
        # Load both group and study_activity associations
        session = session
          |> Repo.preload(:study_activity)
          |> Map.put(:group, LangPortal.Groups.get_group!(session.group_id))
        stats = Study.get_session_stats(session.id)

        conn
        |> put_status(:created)
        |> put_resp_header("location", ~p"/api/study_sessions/#{session}")
        |> render(:show, session: session, stats: stats)

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:error, errors: changeset)
    end
  end

  def create_review(conn, %{"study_session_id" => session_id, "review" => review_params}) do
    review_params = Map.put(review_params, "study_session_id", session_id)

    case Study.create_word_review(review_params) do
      {:ok, review} ->
        conn
        |> put_status(:created)
        |> render(:review, review: review)

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:error, errors: changeset)  # or use your error view
    end
  end
end
