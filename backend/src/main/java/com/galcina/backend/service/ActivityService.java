package com.galcina.backend.service;

import com.galcina.backend.entity.Activity;
import com.galcina.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
