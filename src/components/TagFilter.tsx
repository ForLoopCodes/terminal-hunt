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
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-300">
        Filter by tag:
      </label>

      <select
        value={selectedTag}
        onChange={(e) => onTagSelect(e.target.value)}
        className="border border-gray-600 rounded-md px-3 py-1 text-sm bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">All tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
  );
}
