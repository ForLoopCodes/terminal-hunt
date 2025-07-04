"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface CommentActionsProps {
  comment: {
    id: string;
    content: string;
    userTag: string;
    userId?: string;
  };
  onEdit: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
}

export function CommentActions({
  comment,
  onEdit,
  onDelete,
}: CommentActionsProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current user owns this comment
  const isOwner = session?.user?.userTag === comment.userTag;

  if (!isOwner) return null;

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        onEdit(comment.id, updatedComment.content);
        setIsEditing(false);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete(comment.id);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-600 resize-none"
          rows={3}
          placeholder="Edit your comment..."
        />
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            disabled={!editContent.trim()}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditContent(comment.content);
            }}
            className="px-3 py-1 text-sm border border-gray-600 text-gray-400 rounded hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 mt-2">
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
      >
        Edit
      </button>
      <span className="text-gray-600">•</span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-xs text-gray-400 hover:text-red-400 transition-colors disabled:cursor-not-allowed"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
