import { useState } from 'react';

/**
 * Custom hook for managing array inputs (tags, likes, dislikes, etc.)
 * Reduces duplication in profile editors and admin panels
 */
export function useArrayInput<T = string>(initialArray: T[] = []) {
  const [items, setItems] = useState<T[]>(initialArray);
  const [inputValue, setInputValue] = useState('');

  const addItem = (item: T) => {
    if (item) {
      setItems(prev => [...prev, item]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent, transform?: (val: string) => T) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val) {
        const item = transform ? transform(val) : (val as unknown as T);
        addItem(item);
      }
    }
  };

  const reset = () => {
    setItems(initialArray);
    setInputValue('');
  };

  return {
    items,
    setItems,
    inputValue,
    setInputValue,
    addItem,
    removeItem,
    handleKeyDown,
    reset,
  };
}
