package com.galcina.backend.controller;

import tools.jackson.databind.ObjectMapper;
import com.galcina.backend.entity.Activity;
import com.galcina.backend.repository.ActivityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ActivityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ActivityRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void getActivitiesInitiallyEmpty() throws Exception {
        mockMvc.perform(get("/api/activities"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createActivitySuccess() throws Exception {
        Activity activity = new Activity();
        activity.setName("Morning Run");
        activity.setDescription("5km run in the park");
        activity.setCategory("Exercise");
        activity.setDate(LocalDate.of(2024, 1, 15));
        activity.setDurationMinutes(30);

        String jsonBody = objectMapper.writeValueAsString(activity);

        mockMvc.perform(post("/api/activities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Morning Run"))
                .andExpect(jsonPath("$.description").value("5km run in the park"))
                .andExpect(jsonPath("$.category").value("Exercise"))
                .andExpect(jsonPath("$.durationMinutes").value(30));

        // Verify the activity was saved
        mockMvc.perform(get("/api/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Morning Run"));
    }

    @Test
    void createActivityValidationFails() throws Exception {
        Activity activity = new Activity();
        // Missing name (required field)
        activity.setCategory("Exercise");
        activity.setDate(LocalDate.of(2024, 1, 15));
        activity.setDurationMinutes(30);

        String jsonBody = objectMapper.writeValueAsString(activity);

        mockMvc.perform(post("/api/activities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateActivitySuccess() throws Exception {
        // Create an activity first via repository
        Activity existing = new Activity();
        existing.setName("Original Name");
        existing.setCategory("Original Category");
        existing.setDate(LocalDate.of(2024, 1, 15));
        existing.setDurationMinutes(30);
        existing = repository.save(existing);
        Long id = existing.getId();

        // Update the activity
        Activity updated = new Activity();
        updated.setName("Updated Name");
        updated.setDescription("Updated description");
        updated.setCategory("Updated Category");
        updated.setDate(LocalDate.of(2024, 1, 20));
        updated.setDurationMinutes(60);

        String jsonBody = objectMapper.writeValueAsString(updated);

        mockMvc.perform(put("/api/activities/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated description"))
                .andExpect(jsonPath("$.category").value("Updated Category"))
                .andExpect(jsonPath("$.durationMinutes").value(60));

        // Verify the update was persisted
        mockMvc.perform(get("/api/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Updated Name"));
    }

    @Test
    void updateActivityNotFound() throws Exception {
        Activity activity = new Activity();
        activity.setName("Test Name");
        activity.setCategory("Test Category");
        activity.setDate(LocalDate.of(2024, 1, 15));
        activity.setDurationMinutes(30);

        String jsonBody = objectMapper.writeValueAsString(activity);

        mockMvc.perform(put("/api/activities/{id}", 999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteActivitySuccess() throws Exception {
        // Create an activity first via repository
        Activity activity = new Activity();
        activity.setName("Test Activity");
        activity.setCategory("Test Category");
        activity.setDate(LocalDate.of(2024, 1, 15));
        activity.setDurationMinutes(30);
        activity = repository.save(activity);
        Long id = activity.getId();

        // Delete the activity
        mockMvc.perform(delete("/api/activities/{id}", id))
                .andExpect(status().isNoContent());

        // Verify the activity was deleted
        mockMvc.perform(get("/api/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
