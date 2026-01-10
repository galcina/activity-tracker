package com.galcina.backend.controller;

import com.galcina.backend.entity.Activity;
import com.galcina.backend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(
  origins = "http://localhost:3000",
  allowedHeaders = "*",
  methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class ActivityController {

    private final ActivityService service;

    public ActivityController(ActivityService service) {
        this.service = service;
    }

    @GetMapping
    public List<Activity> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Activity activity) {
        try {
            Activity created = service.create(activity);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Activity activity) {
        try {
            Activity updated = service.update(id, activity);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            if (ex.getMessage().equals("Activity not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
