package com.galcina.backend.service;

import com.galcina.backend.entity.Activity;
import com.galcina.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActivityService {

    private final ActivityRepository repo;

    public ActivityService(ActivityRepository repo) {
        this.repo = repo;
    }

    public List<Activity> getAll() {
        return repo.findAll();
    }

    public Activity create(Activity activity) {
        if (activity.getName() == null || activity.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (activity.getDurationMinutes() == null || activity.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
        if (activity.getCategory() == null || activity.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (activity.getDate() == null) {
            throw new IllegalArgumentException("Date is required");
        }
        return repo.save(activity);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public Activity update(Long id, Activity updated) {
        Optional<Activity> existingOpt = repo.findById(id);
        if (existingOpt.isEmpty()) {
            throw new IllegalArgumentException("Activity not found");
        }

        Activity existing = existingOpt.get();

        // Validate updated data (same rules as create)
        if (updated.getName() == null || updated.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (updated.getDurationMinutes() == null || updated.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
        if (updated.getCategory() == null || updated.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (updated.getDate() == null) {
            throw new IllegalArgumentException("Date is required");
        }

        // Update fields
        existing.setName(updated.getName().trim());
        existing.setDescription(updated.getDescription() != null ? updated.getDescription().trim() : null);
        existing.setCategory(updated.getCategory().trim());
        existing.setDate(updated.getDate());
        existing.setDurationMinutes(updated.getDurationMinutes());

        return repo.save(existing);
    }
}
