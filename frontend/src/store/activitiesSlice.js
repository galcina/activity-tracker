import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchActivities, createActivity, updateActivity, deleteActivity } from '../api';

// Async thunks
export const fetchActivitiesThunk = createAsyncThunk(
  'activities/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchActivities();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createActivityThunk = createAsyncThunk(
  'activities/create',
  async (activity, { rejectWithValue, dispatch }) => {
    try {
      await createActivity(activity);
      // Refresh list after creation
      dispatch(fetchActivitiesThunk());
      return null; // We refresh the list, so no need to return the created item
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateActivityThunk = createAsyncThunk(
  'activities/update',
  async ({ id, activity }, { rejectWithValue, dispatch }) => {
    try {
      await updateActivity(id, activity);
      // Refresh list after update
      dispatch(fetchActivitiesThunk());
      return null; // We refresh the list, so no need to return the updated item
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteActivityThunk = createAsyncThunk(
  'activities/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deleteActivity(id);
      // Refresh list after delete
      dispatch(fetchActivitiesThunk());
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const activitiesSlice = createSlice({
  name: 'activities',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch activities
    builder
      .addCase(fetchActivitiesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchActivitiesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchActivitiesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // Create activity
    builder
      .addCase(createActivityThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(createActivityThunk.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createActivityThunk.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Update activity
    builder
      .addCase(updateActivityThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateActivityThunk.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateActivityThunk.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete activity
    builder
      .addCase(deleteActivityThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteActivityThunk.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(deleteActivityThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearError } = activitiesSlice.actions;
export default activitiesSlice.reducer;
