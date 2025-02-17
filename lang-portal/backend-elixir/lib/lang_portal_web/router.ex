defmodule LangPortalWeb.Router do
  use LangPortalWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", LangPortalWeb do
    pipe_through :api

    resources "/words", WordController, only: [:index, :show]
    resources "/groups", GroupController, only: [:index, :show] do
      get "/words", GroupController, :words
      get "/study_sessions", GroupController, :study_sessions
    end

    resources "/study_activities", StudyActivityController, only: [:index, :show] do
      get "/study_sessions", StudyActivityController, :study_sessions
    end

    resources "/study_sessions", StudySessionController, only: [:index, :show, :create] do
      post "/review", StudySessionController, :create_review
    end
  end
end
