defmodule LangPortalWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with connections
      import Plug.Conn
      import Phoenix.ConnTest
      import LangPortalWeb.ConnCase

      # Add this line to import path helpers
      import Phoenix.VerifiedRoutes

      # Add this line to set the router
      @router LangPortalWeb.Router

      alias LangPortalWeb.Router.Helpers, as: Routes

      # The default endpoint for testing
      @endpoint LangPortalWeb.Endpoint
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(LangPortal.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(LangPortal.Repo, {:shared, self()})
    end

    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end
end
