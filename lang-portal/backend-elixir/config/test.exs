import Config

# Configure your database
config :lang_portal, LangPortal.Repo,
  database: Path.expand("../lang_portal_test.db", Path.dirname(__ENV__.file)),
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :lang_portal, LangPortalWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "your_test_secret_key_base",
  server: false
