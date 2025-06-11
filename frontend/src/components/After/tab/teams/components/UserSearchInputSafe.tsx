/**
 * UserSearchInputSafe Component
 * ----------------------------
 * - Safe version của UserSearchInput với extensive null checking
 * - Input search gợi ý users (multi-select) for team members
 * - Debounce 300ms để tránh spam API
 * - Uses correct team member search endpoint
 * - Trả về danh sách user đã chọn qua onChange
 */
import React, { useState, useEffect, useRef } from "react";
import { teamMemberSearchApi, TeamSearchUser } from "../../../../../services/teamMemberSearchApi";

interface Props {
  onChange: (selected: TeamSearchUser[]) => void;
  teamId: string; // Required team ID for proper search
}

export default function UserSearchInputSafe({ onChange, teamId }: Props) {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<TeamSearchUser[]>([]);
  const [selected, setSelected] = useState<TeamSearchUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging với safe checking
  console.log('UserSearchInputSafe render:', { 
    query: query || "", 
    suggestionsLength: Array.isArray(suggestions) ? suggestions.length : 0, 
    selectedLength: Array.isArray(selected) ? selected.length : 0,
    suggestions: suggestions || [],
    selected: selected || []
  });
  // Tìm users mỗi khi query thay đổi (debounce)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    const trimmedQuery = (query || "").trim();
    
    // For queries shorter than 2 characters, show suggestions if available
    if (!trimmedQuery || trimmedQuery.length < 2) { 
      setSuggestions([]);
      setIsLoading(false);
      return; 
    }
    
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        console.log('Searching for users in team:', { teamId, query: trimmedQuery });
        const users = await teamMemberSearchApi.getUserSuggestions(trimmedQuery, teamId, 5);
        console.log('Team search result:', users);
        setSuggestions(Array.isArray(users) ? users : []);
      } catch (error) {
        console.warn('Search API error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };    }, [query, teamId]);
  // Chọn 1 user từ gợi ý
  const handleSelect = (u: TeamSearchUser) => {
    if (!u || !u._id) return;
    
    const currentSelected = Array.isArray(selected) ? selected : [];
    const alreadySelected = currentSelected.find(s => s?._id === u._id);
    
    if (!alreadySelected) {
      const next = [...currentSelected, u];
      setSelected(next);
      if (typeof onChange === 'function') {
        onChange(next);
      }
    }
    setQuery("");
    setSuggestions([]);
  };

  // Xóa 1 user đã chọn
  const handleRemove = (id: string) => {
    if (!id) return;
    
    const currentSelected = Array.isArray(selected) ? selected : [];
    const next = currentSelected.filter(u => u?._id !== id);
    setSelected(next);
    if (typeof onChange === 'function') {
      onChange(next);
    }
  };

  const safeSelected = Array.isArray(selected) ? selected : [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="relative">      <div className="flex flex-wrap gap-1 mb-1">
        {safeSelected.map(u => (
          u && u._id ? (
            <span key={u._id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              {u.full_name || 'Không có tên'}
              <button onClick={() => handleRemove(u._id)} className="ml-1 text-red-500">×</button>
            </span>
          ) : null
        ))}
      </div>
      <input
        value={query || ""}
        onChange={e => setQuery(e.target.value || "")}
        placeholder="Nhập ít nhất 2 ký tự để tìm kiếm..."
        className="w-full p-2 border rounded"
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-2 top-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      {safeSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-auto">
          {safeSuggestions.map(u => (
            u && u._id ? (
              <li
                key={u._id}
                onClick={() => handleSelect(u)}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              >
                {u.full_name || 'Không có tên'} ({u.email || 'Không có email'})
              </li>
            ) : null
          ))}
        </ul>
      )}
    </div>
  );
}
