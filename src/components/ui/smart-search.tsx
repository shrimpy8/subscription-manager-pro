/**
 * Smart Search Component
 * Apple-inspired search with suggestions and fuzzy matching
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  type: 'recent' | 'trending' | 'suggestion';
}

interface SmartSearchProps {
  placeholder?: string;
  suggestions?: string[];
  onSearch?: (query: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const SmartSearch = ({
  placeholder = "Search...",
  suggestions = [],
  onSearch,
  onSuggestionClick,
  className,
  value = "",
  onChange
}: SmartSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search to history
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));
  };

  // Generate suggestions based on input and history
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    const allSuggestions: SearchSuggestion[] = [];
    
    // Add recent searches
    searchHistory.forEach((item, index) => {
      allSuggestions.push({
        id: `recent-${index}`,
        text: item,
        category: 'Recent',
        type: 'recent'
      });
    });

    // Add trending suggestions
    const trendingSuggestions = [
      'ChatGPT', 'Claude', 'Midjourney', 'Notion', 'Figma', 'Linear'
    ];
    
    trendingSuggestions.forEach((item, index) => {
      allSuggestions.push({
        id: `trending-${index}`,
        text: item,
        category: 'Trending',
        type: 'trending'
      });
    });

    // Add custom suggestions
    suggestions.forEach((item, index) => {
      allSuggestions.push({
        id: `custom-${index}`,
        text: item,
        category: 'Suggestions',
        type: 'suggestion'
      });
    });

    // Filter by current input
    if (value.trim()) {
      return allSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(value.toLowerCase())
      );
    }

    return allSuggestions.slice(0, 8);
  }, [value, searchHistory, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchSuggestions[selectedIndex]) {
          handleSuggestionClick(searchSuggestions[selectedIndex].text);
        } else {
          handleSearch(value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange?.(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSuggestionClick?.(suggestion);
    saveToHistory(suggestion);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveToHistory(query);
      onSearch?.(query);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    onChange?.('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && searchSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          <div className="py-2">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center space-x-3',
                  selectedIndex === index && 'bg-primary-50 text-primary-700'
                )}
              >
                <div className="flex-shrink-0">
                  {suggestion.type === 'recent' && <Clock className="h-4 w-4 text-neutral-400" />}
                  {suggestion.type === 'trending' && <TrendingUp className="h-4 w-4 text-primary-500" />}
                  {suggestion.type === 'suggestion' && <Search className="h-4 w-4 text-neutral-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.category && (
                    <div className="text-xs text-neutral-500">
                      {suggestion.category}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SearchTipsProps {
  className?: string;
}

export const SearchTips = ({ className }: SearchTipsProps) => {
  const tips = [
    "Try searching for 'AI tools' or 'productivity'",
    "Use filters to narrow down results",
    "Press Enter to search, Escape to close",
    "Use arrow keys to navigate suggestions"
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-neutral-700">Search Tips</h4>
      <ul className="space-y-1">
        {tips.map((tip, index) => (
          <li key={index} className="text-xs text-neutral-500 flex items-start">
            <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 mr-2 flex-shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};
