defmodule LangPortal.Words.Word do
  use Ecto.Schema
  import Ecto.Changeset

  schema "words" do
    field :yoruba, :string
    field :english, :string
    field :parts, :map

    many_to_many :groups, LangPortal.Groups.Group, join_through: "words_groups"
    has_many :word_review_items, LangPortal.Study.WordReviewItem

    timestamps()
  end

  @required_fields [:yoruba, :english, :parts]
  @parts_fields [:use_case, :gender, :number, :tone]

  def changeset(word, attrs) do
    word
    |> cast(attrs, @required_fields)
    |> validate_required(@required_fields)
    |> validate_parts()
  end

  defp validate_parts(changeset) do
    validate_change(changeset, :parts, fn :parts, parts ->
      case validate_parts_structure(parts) do
        :ok -> []
        {:error, reason} -> [parts: reason]
      end
    end)
  end

  defp validate_parts_structure(parts) when is_map(parts) do
    case Enum.all?(@parts_fields, &Map.has_key?(parts, to_string(&1))) do
      true -> :ok
      false -> {:error, "must contain all required fields: #{inspect(@parts_fields)}"}
    end
  end
  defp validate_parts_structure(_), do: {:error, "must be a map"}
end
