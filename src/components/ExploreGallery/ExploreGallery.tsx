import React, { memo, useMemo, useState, useCallback } from 'react';
import type { ExploreItem } from '../../types';
import { MOCK_EXPLORE } from '../../lib/constants';

type FilterType = 'All' | 'Featured' | 'Latest';

interface ExploreGalleryProps {
  className?: string;
}

export const ExploreGallery: React.FC<ExploreGalleryProps> = memo(function ExploreGallery({
  className = '',
}) {
  const [exploreFilter, setExploreFilter] = useState<FilterType>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => {
    const unique = new Set(MOCK_EXPLORE.map((item) => item.category));
    return ['All', ...Array.from(unique)];
  }, []);

  const filteredItems = useMemo(() => {
    return MOCK_EXPLORE.filter((item) => {
      const matchesMain =
        exploreFilter === 'All' ||
        (exploreFilter === 'Featured' && item.isFeatured) ||
        (exploreFilter === 'Latest' && !item.isFeatured);
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesMain && matchesCategory;
    });
  }, [exploreFilter, categoryFilter]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setExploreFilter(filter);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  }, []);

  return (
    <section className={`w-full space-y-8 ${className}`} aria-labelledby="explore-heading">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h2 id="explore-heading" className="text-3xl font-bold flex items-center gap-2">
            Explore{' '}
            <span className="text-gray-300 font-normal text-xl">({MOCK_EXPLORE.length})</span>
          </h2>

          {/* Filter Tabs */}
          <div className="flex gap-2" role="tablist" aria-label="Filter by type">
            {(['All', 'Featured', 'Latest'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                role="tab"
                aria-selected={exploreFilter === filter}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  exploreFilter === filter
                    ? 'bg-white border border-gray-200 shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="category-filter"
            className="text-xs font-bold text-gray-400 uppercase tracking-widest"
          >
            Vertical
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="list"
        aria-label="Explore gallery"
      >
        {filteredItems.map((item) => (
          <ExploreCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No items found matching your filters.</p>
        </div>
      )}
    </section>
  );
});

interface ExploreCardProps {
  item: ExploreItem;
}

const ExploreCard: React.FC<ExploreCardProps> = memo(function ExploreCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <article
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      role="listitem"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={`${item.title} - ${item.style} style icon`}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-4xl">{item.title[0]}</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            className="bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={`View ${item.title} project`}
          >
            View Project
          </button>
        </div>

        {/* Featured Badge */}
        {item.isFeatured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur text-[9px] font-bold text-indigo-600 rounded shadow-sm border border-indigo-50 tracking-tighter">
            FEATURED
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-sm tracking-tight">{item.title}</h3>
          <span className="text-[9px] bg-gray-50 border border-gray-100 text-gray-400 px-1 py-0.5 rounded uppercase font-bold">
            {item.style}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <span>{item.category}</span>
          <span className="flex items-center gap-1">@{item.author}</span>
        </div>
      </div>
    </article>
  );
});
