package com.employee.feedback.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Object teamId; // can be a TeamDto or a Long ID

    public UserDto() {}

    public UserDto(Long id, String name, String email, String role, Object teamId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.teamId = teamId;
    }

    public Long getId() {
        return id;
    }

    @JsonProperty("_id")
    public Long getUnderscoreId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Object getTeamId() {
        return teamId;
    }

    public void setTeamId(Object teamId) {
        this.teamId = teamId;
    }
}
