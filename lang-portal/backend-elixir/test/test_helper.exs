ExUnit.start()

# Just set up the sandbox mode
Ecto.Adapters.SQL.Sandbox.mode(LangPortal.Repo, :manual)

# Only run migrations, no seeds
Mix.Task.run("ecto.drop")
Mix.Task.run("ecto.create")
Mix.Task.run("ecto.migrate")
