"use client";

interface Tag {
  id: string;
  name: string;
}

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string;
  onTagSelect: (tagId: string) => void;
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  return (
    <div className="flex items-center">
      <span
        className="mr-2 w-4 text-xs"
        style={{ color: "var(--color-text)" }}
      >
        {" "}
      </span>
      <label
        className="text-sm pr-2"
        style={{
          color: "var(--color-text)",
          backgroundColor: "var(--color-primary)",
        }}
      >
        tag
      </label>
      <select
        value={selectedTag}
        onChange={(e) => onTagSelect(e.target.value)}
        className="flex-1 px-2 py-1 focus:outline-none text-sm"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
        }}
      >
        <option value="">all</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
  );
}
