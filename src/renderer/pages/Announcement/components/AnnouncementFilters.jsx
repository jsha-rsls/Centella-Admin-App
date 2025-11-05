import { memo, useCallback, useMemo } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import styles from '../styles/Filter.module.css';

export const AnnouncementFilters = memo(({
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterMonth,
  onMonthChange,
  categories,
  months
}) => {
  // Memoize event handlers to prevent recreation
  const handleSearchChange = useCallback((e) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleCategoryChange = useCallback((e) => {
    onCategoryChange(e.target.value);
  }, [onCategoryChange]);

  const handleMonthChange = useCallback((e) => {
    onMonthChange(e.target.value);
  }, [onMonthChange]);

  // Memoize category options to prevent re-rendering
  const categoryOptions = useMemo(() => (
    <>
      <option value="all">All Categories</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </>
  ), [categories]);

  // Memoize month options to prevent re-rendering
  const monthOptions = useMemo(() => (
    <>
      <option value="all">All Months</option>
      {months.map(month => (
        <option key={month} value={month}>{month}</option>
      ))}
    </>
  ), [months]);

  return (
    <div className={styles.filters}>
      <div className={styles.searchBox}>
        <IoSearchOutline size="20" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>
      <select
        value={filterCategory}
        onChange={handleCategoryChange}
        className={styles.filterSelect}
      >
        {categoryOptions}
      </select>
      <select
        value={filterMonth}
        onChange={handleMonthChange}
        className={styles.filterSelect}
      >
        {monthOptions}
      </select>
    </div>
  );
});