const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api/activities';

/**
 * Fetch all activities from the backend
 */
export async function fetchActivities() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching activities: ${error.message}`);
  }
}

/**
 * Create a new activity
 */
export async function createActivity(activity) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to create activity: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Error creating activity: ${error.message}`);
  }
}

/**
 * Update an existing activity
 */
export async function updateActivity(id, activity) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Activity not found');
      }
      const errorText = await response.text();
      throw new Error(errorText || `Failed to update activity: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Error updating activity: ${error.message}`);
  }
}

/**
 * Delete an activity by ID
 */
export async function deleteActivity(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete activity: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Error deleting activity: ${error.message}`);
  }
}
