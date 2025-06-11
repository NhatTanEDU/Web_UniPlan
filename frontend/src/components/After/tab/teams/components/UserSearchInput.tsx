/**
 * UserSearchInput Component
 * --------------------------
 * - Input search gợi ý users (multi-select)
 * - Debounce 300ms để tránh spam API
 * - Trả về danh sách user đã chọn qua onChange
 */
import React, { useState, useEffect, useRef } from "react";
import { userSearchApi, SearchUser } from "../../../../../services/userSearchApi";

interface Props {
  onChange: (selected: SearchUser[]) => void;
}

export default function UserSearchInput({ onChange }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  console.log('UserSearchInput render:', { 
    query, 
    suggestionsLength: suggestions?.length, 
    selectedLength: selected?.length,
    suggestions: suggestions,
    selected: selected
  });
  // Tìm users mỗi khi query thay đổi (debounce)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) { 
      setSuggestions([]); 
      return; 
    }
      debounceRef.current = setTimeout(async () => {
      try {
        const res = await userSearchApi.searchUsers({ query, limit: 5 });
        setSuggestions(res.users || []);
      } catch (error) {
        console.warn('Search API error:', error);
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Chọn 1 user từ gợi ý
  const handleSelect = (u: SearchUser) => {
    if (!selected?.find(s => s._id === u._id)) {
      const next = [...(selected || []), u];
      setSelected(next);
      onChange(next);
    }
    setQuery("");
    setSuggestions([]);
  };

  // Xóa 1 user đã chọn
  const handleRemove = (id: string) => {
    const next = (selected || []).filter(u => u._id !== id);
    setSelected(next);
    onChange(next);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 mb-1">
        {(selected || []).map(u => (
          <span key={u._id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
            {u.name}
            <button onClick={() => handleRemove(u._id)} className="ml-1 text-red-500">×</button>
          </span>
        ))}
      </div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}        placeholder="Nhập ít nhất 2 ký tự để tìm kiếm..."
        className="w-full p-2 border rounded"
      />
      {suggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-auto">
          {suggestions.map(u => (
            <li
              key={u._id}
              onClick={() => handleSelect(u)}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
            >
              {u.name} ({u.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}