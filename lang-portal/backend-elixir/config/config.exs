import Config

config :lang_portal, ecto_repos: [LangPortal.Repo]

# Configures the endpoint
config :lang_portal, LangPortalWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: LangPortalWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: LangPortal.PubSub,
  live_view: [signing_salt: "your_signing_salt"]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config
import_config "#{config_env()}.exs"
