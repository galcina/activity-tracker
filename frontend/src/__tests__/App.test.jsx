import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import App from '../App'
import * as api from '../api'
import activitiesReducer from '../store/activitiesSlice'

// Helper to flush pending promises
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

// Mock the API module
vi.mock('../api', () => ({
  fetchActivities: vi.fn(),
  createActivity: vi.fn(),
  updateActivity: vi.fn(),
  deleteActivity: vi.fn()
}))

// Helper to create store for testing
const createTestStore = () => {
  return configureStore({
    reducer: {
      activities: activitiesReducer
    }
  })
}

describe('App', () => {
  const mockActivities = [
    {
      id: 1,
      name: 'Morning Run',
      description: '5km run in the park',
      category: 'Exercise',
      date: '2024-01-15',
      durationMinutes: 30
    },
    {
      id: 2,
      name: 'Reading',
      description: 'Read React documentation',
      category: 'Learning',
      date: '2024-01-16',
      durationMinutes: 60
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders main headings and sections', async () => {
    api.fetchActivities.mockResolvedValue([])
    const store = createTestStore()

    await act(async () => {
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
      await flushPromises()
    })

    // Check main heading (synchronous)
    expect(screen.getByRole('heading', { name: /activity tracker/i })).toBeInTheDocument()

    // Wait for loading to complete using findBy queries
    expect(await screen.findByRole('heading', { name: /add new activity/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /activities/i })).toBeInTheDocument()
  })

  it('filters activities by search text', async () => {
    const user = userEvent.setup()
    api.fetchActivities.mockResolvedValue(mockActivities)
    const store = createTestStore()

    await act(async () => {
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
      await flushPromises()
    })

    // Wait for activities to load using findBy queries
    expect(await screen.findByText('Morning Run')).toBeInTheDocument()
    expect(await screen.findByText('Reading')).toBeInTheDocument()

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search by name or description/i)
    expect(searchInput).toBeInTheDocument()

    // Type into search input and wait for UI update
    await act(async () => {
      await user.type(searchInput, 'Morning')
    })

    // Verify only "Morning Run" is visible after filter
    expect(await screen.findByText('Morning Run')).toBeInTheDocument()
    expect(screen.queryByText('Reading')).not.toBeInTheDocument()

    // Clear search and wait for UI update
    await act(async () => {
      await user.clear(searchInput)
    })

    // Verify both activities are visible again
    expect(await screen.findByText('Morning Run')).toBeInTheDocument()
    expect(await screen.findByText('Reading')).toBeInTheDocument()
  })

  it('updates statistics based on visible filtered list', async () => {
    const user = userEvent.setup()
    api.fetchActivities.mockResolvedValue(mockActivities)
    const store = createTestStore()

    await act(async () => {
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
      await flushPromises()
    })

    // Wait for activities to load using findBy queries
    expect(await screen.findByText('Morning Run')).toBeInTheDocument()
    expect(await screen.findByText('Reading')).toBeInTheDocument()

    // Check initial statistics - results count shows 2 results
    expect(await screen.findByText(/2 results/i)).toBeInTheDocument()

    // Verify statistics section exists with "Statistics" heading
    expect(screen.getByText('Statistics')).toBeInTheDocument()
    expect(screen.getByText('Total Activities')).toBeInTheDocument()
    expect(screen.getByText('Total Minutes')).toBeInTheDocument()

    // Apply search filter to filter to only "Reading"
    const searchInput = screen.getByPlaceholderText(/search by name or description/i)
    await act(async () => {
      await user.type(searchInput, 'Reading')
    })

    // Verify statistics update for filtered list
    expect(await screen.findByText(/1 result/i)).toBeInTheDocument()
    expect(await screen.findByText('Reading')).toBeInTheDocument()
    expect(screen.queryByText('Morning Run')).not.toBeInTheDocument()

    // Clear filter and wait for UI update
    await act(async () => {
      await user.clear(searchInput)
    })

    // Verify stats go back to original
    expect(await screen.findByText(/2 results/i)).toBeInTheDocument()
    expect(await screen.findByText('Morning Run')).toBeInTheDocument()
    expect(await screen.findByText('Reading')).toBeInTheDocument()
  })
})
