import Config

config :lang_portal, LangPortal.Repo,
  database: Path.expand("../lang_portal_dev.db", Path.dirname(__ENV__.file)),
  pool_size: 5,
  show_sensitive_data_on_connection_error: true

config :lang_portal, LangPortalWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000]
