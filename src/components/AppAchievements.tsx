"use client";

import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  criteria: any;
  iconUrl?: string;
  badgeColor: string;
  awardedAt: string;
}

interface AppAchievementsProps {
  appId: string;
}

export function AppAchievements({ appId }: AppAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [appId]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/apps/${appId}/achievements`);
      const data = await response.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return "🎯";
      case "popularity":
        return "⭐";
      case "quality":
        return "🏆";
      case "community":
        return "👥";
      case "special":
        return "🎖️";
      default:
        return "🏅";
    }
  };

  if (loading) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Achievements</h3>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Achievements</h3>
        <p className="text-gray-400 text-center py-4">
          No achievements yet. Keep growing your app's community!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        Achievements ({achievements.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm"
                style={{
                  backgroundColor: achievement.badgeColor + "20",
                  color: achievement.badgeColor,
                }}
              >
                {achievement.iconUrl ? (
                  <img
                    src={achievement.iconUrl}
                    alt={achievement.title}
                    className="w-6 h-6"
                  />
                ) : (
                  getAchievementIcon(achievement.type)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Earned {new Date(achievement.awardedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
