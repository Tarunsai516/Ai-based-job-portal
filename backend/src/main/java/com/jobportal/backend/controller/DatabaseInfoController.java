package com.jobportal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*")
public class DatabaseInfoController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/database-info")
    public ResponseEntity<Map<String, Object>> getDatabaseInfo() {
        Map<String, Object> response = new HashMap<>();

        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            String productName = metaData.getDatabaseProductName();
            String productVersion = metaData.getDatabaseProductVersion();
            String driverName = metaData.getDriverName();
            String driverVersion = metaData.getDriverVersion();
            String url = metaData.getURL();
            String username = metaData.getUserName();

            boolean isMySQL = productName != null && productName.toLowerCase().contains("mysql");

            response.put("status", "CONNECTED");
            response.put("databaseType", isMySQL ? "MySQL Workbench / MySQL Database" : productName);
            response.put("productName", productName);
            response.put("productVersion", productVersion);
            response.put("driverName", driverName);
            response.put("driverVersion", driverVersion);
            response.put("url", url);
            response.put("username", username);
            response.put("workbenchCompatible", true);
            response.put("isMySQL", isMySQL);
            response.put("host", "localhost:3306");
            response.put("databaseName", "talentsync");

        } catch (Exception e) {
            response.put("status", "DISCONNECTED");
            response.put("databaseType", "MySQL Workbench / MySQL Database");
            response.put("error", e.getMessage());
            response.put("workbenchCompatible", true);
            response.put("host", "localhost:3306");
            response.put("databaseName", "talentsync");
        }

        return ResponseEntity.ok(response);
    }
}
