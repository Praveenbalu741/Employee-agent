package com.employee.feedback.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class LoginResponse {
    private boolean success;
    private String accessToken;
    private UserDto user;
    
    @JsonIgnore
    private String refreshToken;

    public LoginResponse() {}

    public LoginResponse(boolean success, String accessToken, UserDto user) {
        this.success = success;
        this.accessToken = accessToken;
        this.user = user;
    }

    public LoginResponse(boolean success, String accessToken, UserDto user, String refreshToken) {
        this.success = success;
        this.accessToken = accessToken;
        this.user = user;
        this.refreshToken = refreshToken;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
