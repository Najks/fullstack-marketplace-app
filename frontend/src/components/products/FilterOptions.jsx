import React from 'react';
import SearchBar from './SearchBar.jsx';
import SortMenu from './SortMenu.jsx';
import Filter from './Filter.jsx';

export default function FilterOptions({
                                          searchValue,
                                          onSearchChange,
                                          onSearchApply,
                                          sortValue,
                                          onSortChange,
                                          filterValues,
                                          onFilterChange,
                                          statuses = [],
                                          categories = [],
                                          pageSize,
                                          onPageSizeChange,
                                      }) {
    return (
        <div className="bg-light border-bottom py-3 mb-4">
            <div className="container">
                {/* Main Controls Row */}
                <div className="d-flex flex-wrap gap-3 align-items-end mb-3">
                    <SearchBar
                        value={searchValue}
                        onChange={onSearchChange}
                        onApply={onSearchApply}
                        size="sm"
                    />
                    <SortMenu
                        value={sortValue}
                        onChange={onSortChange}
                        size="sm"
                    />
                    <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: '120px' }}
                        value={pageSize}
                        onChange={onPageSizeChange}
                        aria-label="Page size"
                    >
                        <option value="10">10 / page</option>
                        <option value="12">12 / page</option>
                        <option value="20">20 / page</option>
                        <option value="50">50 / page</option>
                    </select>
                </div>

                {/* Filters Row */}
                <Filter
                    onFilterChange={onFilterChange}
                    statuses={statuses}
                    categories={categories}
                />
            </div>
        </div>
    );
}
