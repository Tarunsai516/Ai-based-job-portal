package com.jobportal.backend.dto;

public class JwtResponse {
    private String token;
    private String tokenType = "Bearer";
    private String type = "Bearer";
    private Long expiresIn;
    private Long id;
    private String name;
    private String email;
    private String role;
    private UserDto user;

    public JwtResponse() {}

    public JwtResponse(String token, String tokenType, String type, Long expiresIn, Long id,
                       String name, String email, String role, UserDto user) {
        this.token = token;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.type = type != null ? type : "Bearer";
        this.expiresIn = expiresIn;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private String tokenType = "Bearer";
        private String type = "Bearer";
        private Long expiresIn;
        private Long id;
        private String name;
        private String email;
        private String role;
        private UserDto user;

        public Builder token(String token) { this.token = token; return this; }
        public Builder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder expiresIn(Long expiresIn) { this.expiresIn = expiresIn; return this; }
        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder user(UserDto user) { this.user = user; return this; }

        public JwtResponse build() {
            return new JwtResponse(token, tokenType, type, expiresIn, id, name, email, role, user);
        }
    }
}
