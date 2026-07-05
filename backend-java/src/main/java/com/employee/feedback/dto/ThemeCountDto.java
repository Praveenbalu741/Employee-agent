package com.employee.feedback.dto;

public class ThemeCountDto {
    private String theme;
    private Long count;

    public ThemeCountDto() {}

    public ThemeCountDto(String theme, Long count) {
        this.theme = theme;
        this.count = count;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
