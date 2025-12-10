interface FilterButtonsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  allLabel?: string;
}

/**
 * Reusable filter button group
 * Used in events, gallery, store, and other filterable pages
 */
export default function FilterButtons({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  allLabel = 'All'
}: FilterButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onSelectCategory(null)}
      >
        {allLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
