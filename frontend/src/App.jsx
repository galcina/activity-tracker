import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivitiesThunk, createActivityThunk, updateActivityThunk, deleteActivityThunk } from './store/activitiesSlice';

function App() {
  const dispatch = useDispatch();
  const { items: activities, status, error } = useSelector(state => state.activities);
  const loading = status === 'loading';
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    date: '',
    durationMinutes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load activities on mount
  useEffect(() => {
    dispatch(fetchActivitiesThunk());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    if (!formData.category || formData.category.trim() === '') {
      errors.category = 'Category is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    const duration = parseInt(formData.durationMinutes);
    if (!formData.durationMinutes || isNaN(duration) || duration <= 0) {
      errors.durationMinutes = 'Duration must be a positive number';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    
    const activityData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      category: formData.category.trim(),
      date: formData.date,
      durationMinutes: parseInt(formData.durationMinutes)
    };
    
    try {
      if (editingActivityId) {
        // Update existing activity
        await dispatch(updateActivityThunk({ id: editingActivityId, activity: activityData })).unwrap();
        setEditingActivityId(null);
      } else {
        // Create new activity
        await dispatch(createActivityThunk(activityData)).unwrap();
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        date: '',
        durationMinutes: ''
      });
      setFormErrors({});
    } catch (err) {
      // Error is handled by Redux, but we can show it in form if needed
      // The error will be in the Redux state
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    setFormData({
      name: activity.name || '',
      description: activity.description || '',
      category: activity.category || '',
      date: activity.date || '',
      durationMinutes: activity.durationMinutes || ''
    });
    setEditingActivityId(activity.id);
    setFormErrors({});
    // Scroll to form section
    document.querySelector('.leftPane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setEditingActivityId(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      date: '',
      durationMinutes: ''
    });
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    try {
      await dispatch(deleteActivityThunk(id)).unwrap();
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Get unique categories from activities
  const getUniqueCategories = () => {
    const categories = activities
      .map(activity => activity.category)
      .filter((category, index, self) => self.indexOf(category) === index)
      .sort();
    return categories;
  };

  // Filter and sort activities
  const getFilteredAndSortedActivities = () => {
    let filtered = [...activities];

    // Search filter (name or description, case-insensitive)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(searchLower) ||
        (activity.description && activity.description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Date filter
    if (selectedDate !== 'all') {
      filtered = filtered.filter(activity => activity.date === selectedDate);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredActivities = getFilteredAndSortedActivities();

  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('All');
    setSelectedDate('all');
    setSortOrder('desc');
  };

  // Check if any filters are active
  const hasActiveFilters = searchText.trim() || selectedCategory !== 'All' || selectedDate !== 'all';

  // Calculate statistics from filtered activities
  const calculateStatistics = () => {
    if (filteredActivities.length === 0) {
      return {
        totalCount: 0,
        totalMinutes: 0,
        byCategory: [],
        byDate: []
      };
    }

    // Total count and minutes
    const totalCount = filteredActivities.length;
    const totalMinutes = filteredActivities.reduce((sum, activity) => 
      sum + (activity.durationMinutes || 0), 0
    );

    // By Category
    const categoryMap = new Map();
    filteredActivities.forEach(activity => {
      const category = activity.category || 'Uncategorized';
      const current = categoryMap.get(category) || { count: 0, minutes: 0 };
      categoryMap.set(category, {
        count: current.count + 1,
        minutes: current.minutes + (activity.durationMinutes || 0)
      });
    });
    const byCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.minutes - a.minutes);

    // By Date
    const dateMap = new Map();
    filteredActivities.forEach(activity => {
      const date = activity.date;
      const current = dateMap.get(date) || { count: 0, minutes: 0 };
      dateMap.set(date, {
        count: current.count + 1,
        minutes: current.minutes + (activity.durationMinutes || 0)
      });
    });
    const byDate = Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      totalCount,
      totalMinutes,
      byCategory,
      byDate
    };
  };

  const stats = calculateStatistics();

  return (
    <div className="app">
      <header>
        <h1>Activity Tracker</h1>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="page">
        {/* Form Section */}
        <section className="leftPane form-section">
          <h2>{editingActivityId ? 'Edit Activity' : 'Add New Activity'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && (
                <span className="field-error">{formErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={formErrors.category ? 'error' : ''}
              />
              {formErrors.category && (
                <span className="field-error">{formErrors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={formErrors.date ? 'error' : ''}
              />
              {formErrors.date && (
                <span className="field-error">{formErrors.date}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="durationMinutes">
                Duration (minutes) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="durationMinutes"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                min="1"
                className={formErrors.durationMinutes ? 'error' : ''}
              />
              {formErrors.durationMinutes && (
                <span className="field-error">{formErrors.durationMinutes}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Optional description..."
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={submitting}
              >
                {submitting 
                  ? (editingActivityId ? 'Saving...' : 'Adding...') 
                  : (editingActivityId ? 'Save Changes' : 'Add Activity')
                }
              </button>
              {editingActivityId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-btn"
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right Side Content */}
        <section className="rightPane">
          <div className="rightGrid">
            {/* Statistics Panel */}
            <div className="statsPanel">
              <h2>Statistics</h2>
              
              {loading ? (
                <div className="loading">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="empty-state">No activities yet. Add one to get started!</div>
              ) : (
                <div className="statistics-section">
                  <div className="stats-summary">
                    <div className="stat-card">
                      <div className="stat-value">{stats.totalCount}</div>
                      <div className="stat-label">Total Activities</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.totalMinutes}</div>
                      <div className="stat-label">Total Minutes</div>
                    </div>
                  </div>

                  {stats.byCategory.length > 0 && (
                    <div className="stats-breakdown">
                      <h4>By Category</h4>
                      <div className="table-container">
                        <table className="stats-table">
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Count</th>
                              <th>Minutes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.byCategory.map(({ category, count, minutes }) => (
                              <tr key={category}>
                                <td>{category}</td>
                                <td>{count}</td>
                                <td>{minutes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {stats.byDate.length > 0 && (
                    <div className="stats-breakdown">
                      <h4>By Date</h4>
                      <div className="table-container">
                        <table className="stats-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Count</th>
                              <th>Minutes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.byDate.map(({ date, count, minutes }) => (
                              <tr key={date}>
                                <td>{formatDate(date)}</td>
                                <td>{count}</td>
                                <td>{minutes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List Panel */}
            <div className="listPanel">
              <h2>Activities</h2>
              
              {loading ? (
                <div className="loading">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="empty-state">No activities yet. Add one to get started!</div>
              ) : (
                <>
                  {/* Filter Controls */}
                  <div className="filters-container">
                <div className="filters-grid">
                  <div className="filter-group">
                    <label htmlFor="search">Search</label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by name or description..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="category-filter">Category</label>
                    <select
                      id="category-filter"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="filter-select"
                    >
                      <option value="All">All</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="date-filter">Date</label>
                    <div className="date-filter-wrapper">
                      <select
                        id="date-filter-mode"
                        value={selectedDate === 'all' ? 'all' : 'specific'}
                        onChange={(e) => {
                          if (e.target.value === 'all') {
                            setSelectedDate('all');
                          } else {
                            // Set to today's date or first available date
                            const today = new Date().toISOString().split('T')[0];
                            const firstDate = activities.length > 0 
                              ? activities.map(a => a.date).sort()[0]
                              : today;
                            setSelectedDate(firstDate);
                          }
                        }}
                        className="filter-select date-mode-select"
                      >
                        <option value="all">All</option>
                        <option value="specific">Specific Date</option>
                      </select>
                      {selectedDate !== 'all' && (
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="filter-input date-input"
                        />
                      )}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sort-order">Sort</label>
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="filter-select"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>

                <div className="filters-footer">
                  <div className="results-count">
                    {filteredActivities.length} {filteredActivities.length === 1 ? 'result' : 'results'}
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="clear-filters-btn"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {filteredActivities.length === 0 ? (
                <div className="empty-state">No activities match your filters.</div>
              ) : (
                <div className="activities-list">
                  {filteredActivities.map(activity => (
                <div key={activity.id} className="activity-card">
                  <div className="activity-header">
                    <h3 className="activity-name">{activity.name}</h3>
                    <div className="activity-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(activity)}
                        title="Edit activity"
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(activity.id)}
                        title="Delete activity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="activity-details">
                    <div className="activity-meta">
                      <span className="activity-date">
                        📅 {formatDate(activity.date)}
                      </span>
                      <span className="activity-category">
                        🏷️ {activity.category}
                      </span>
                      <span className="activity-duration">
                        ⏱️ {activity.durationMinutes} min
                      </span>
                    </div>
                    {activity.description && (
                      <p className="activity-description">{activity.description}</p>
                    )}
                  </div>
                </div>
                  ))}
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
