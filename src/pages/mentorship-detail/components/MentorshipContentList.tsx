import type { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faQuestionCircle,
  faFileAlt,
  faCalendarAlt,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import type { WeekData } from "../types";

interface MentorshipContentListProps {
  weeks: WeekData[] | null;
  loading: boolean;
  error: string | null;
  onCreateContentClick: () => void;
}

const getIconForType = (type?: string) => {
  const value = (type ?? "CONTENT").toUpperCase();

  if (value.includes("LECTURE")) return faVideo;
  if (value.includes("QUIZ")) return faQuestionCircle;
  if (value.includes("PROJECT")) return faFolderOpen;
  if (value.includes("SESSION") || value.includes("LIVE")) return faCalendarAlt;
  if (value.includes("ASSIGNMENT") || value.includes("TASK")) return faFileAlt;

  return faFileAlt;
};

const MentorshipContentList: FC<MentorshipContentListProps> = ({
  weeks,
  loading,
  error,
  onCreateContentClick,
}) => {
  const renderEmpty = () => (
    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <p className="text-gray-500 mb-2">There are no weeks available yet.</p>

      <button
        onClick={onCreateContentClick}
        className="text-primary text-sm font-medium hover:underline"
      >
        Get started by creating your first week
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center py-6 text-gray-500">Loading content...</div>
  );

  const renderError = () => (
    <div className="text-center py-6 text-red-500">{error}</div>
  );

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">
          Mentorship Content
        </h3>

        <button
          onClick={onCreateContentClick}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-dark)] transition"
        >
          Edit Content
        </button>
      </div>

      {/* States */}

      {loading && renderLoading()}
      {!loading && error && renderError()}
      {!loading && !error && (!weeks || weeks.length === 0) && renderEmpty()}

      {!loading && !error && weeks && weeks.length > 0 && (
        <div className="relative">
          {/* timeline line */}

          <div className="hidden sm:block absolute left-10 top-6 bottom-6 w-px bg-gray-200" />

          <div className="space-y-8">
            {weeks.map(({ week, items }, weekIndex) => (
              <div
                key={week.id}
                className="flex items-start sm:items-center gap-4"
              >
                {/* week circle */}

                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-primary text-primary text-xs font-semibold shadow-sm">
                    {weekIndex + 1}
                  </div>

                  <div className="block sm:hidden h-6 w-px bg-gray-200 mt-2" />
                </div>

                {/* week content */}

                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    {/* week header */}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {week.title || `Week ${weekIndex + 1}`}
                        </p>

                        <span className="text-xs text-gray-500">
                          {items.length} items
                        </span>
                      </div>

                      <button
                        onClick={onCreateContentClick}
                        className="hidden sm:inline-flex px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md text-primary hover:bg-primary/5"
                      >
                        Add Content
                      </button>
                    </div>

                    {/* items */}

                    <ul className="mt-4 space-y-3">
                      {items.map((item, idx) => (
                        <li
                          key={item.id ?? idx}
                          className="flex items-start gap-3"
                        >
                          {/* icon + connector */}

                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                              <FontAwesomeIcon
                                icon={getIconForType(item.type)}
                                className="w-3 h-3"
                              />
                            </div>

                            {idx !== items.length - 1 && (
                              <div className="h-6 w-px bg-gray-200 mt-1" />
                            )}
                          </div>

                          {/* item content */}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {item.title || "Untitled"}
                              </p>

                              {item.createdAt && (
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                  {new Date(
                                    item.createdAt as string
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                              {item.type || "CONTENT"}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipContentList;