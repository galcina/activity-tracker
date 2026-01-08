import { useState, useEffect } from 'react';
import { fetchActivities, createActivity, deleteActivity } from './api';

function App() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    date: '',
    durationMinutes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActivities();
      setActivities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    setError(null);
    
    try {
      const activityToCreate = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category.trim(),
        date: formData.date,
        durationMinutes: parseInt(formData.durationMinutes)
      };
      
      await createActivity(activityToCreate);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        date: '',
        durationMinutes: ''
      });
      setFormErrors({});
      
      // Reload activities
      await loadActivities();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    setError(null);
    try {
      await deleteActivity(id);
      await loadActivities();
    } catch (err) {
      setError(err.message);
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

      <div className="container">
        {/* Form Section */}
        <section className="form-section">
          <h2>Add New Activity</h2>
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

            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Activity'}
            </button>
          </form>
        </section>

        {/* List Section */}
        <section className="list-section">
          <h2>Activities</h2>
          
          {loading ? (
            <div className="loading">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="empty-state">No activities yet. Add one to get started!</div>
          ) : (
            <div className="activities-list">
              {activities.map(activity => (
                <div key={activity.id} className="activity-card">
                  <div className="activity-header">
                    <h3 className="activity-name">{activity.name}</h3>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(activity.id)}
                      title="Delete activity"
                    >
                      ×
                    </button>
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
        </section>
      </div>
    </div>
  );
}

export default App;
