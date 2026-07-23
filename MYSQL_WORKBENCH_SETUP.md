# MySQL Workbench Integration Guide

This guide provides instructions for setting up **MySQL Workbench** as the relational database for the AI-Based Job Portal (TalentSync).

---

## 1. Prerequisites
- **MySQL Server 8.0+** installed and running on `localhost:3306`.
- **MySQL Workbench** installed on your system.
- **Java JDK 17+** and **Maven** installed for the backend.
- **Node.js (v18+)** for the frontend.

---

## 2. Setting Up Database in MySQL Workbench

### Step 1: Open MySQL Workbench
1. Launch **MySQL Workbench**.
2. Connect to your local MySQL instance (e.g., `localhost:3306`).
3. Enter your MySQL password (default set in backend is `root`, or update `application.properties` to match your credentials).

### Step 2: Run the Setup Script
1. In MySQL Workbench, click **File -> Open SQL Script...**
2. Select `backend/src/main/resources/setup_mysql.sql`.
3. Click the **Execute (Lightning Bolt icon)** button to execute the entire script.
4. Verify in the MySQL Workbench **SCHEMAS** panel that the `talentsync` database and tables (`users`, `candidates`, `jobs`, `applications`, etc.) have been created.

---

## 3. Configuring Spring Boot Backend

The backend `application.properties` is configured to connect to MySQL Workbench:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/talentsync?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```

If your MySQL username or password differs from `root`, set environment variables or edit `backend/src/main/resources/application.properties`:
```bash
# PowerShell Example:
$env:SPRING_DATASOURCE_USERNAME="your_username"
$env:SPRING_DATASOURCE_PASSWORD="your_password"
```

---

## 4. Running the Application

### Start the Backend (Spring Boot):
```bash
cd backend
./mvnw clean compile spring-boot:run
```

### Start the Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Visualizing Database Status in Frontend
- Open **http://localhost:5173** (or your Vite dev server URL).
- Go to **Admin Dashboard** (`/admin`) or **Settings** (`/settings`) to view real-time **MySQL Workbench & Database Status** diagnostics.

---

## 6. How to Find & Add Database Details in IntelliJ IDEA

### Method 1: Using IntelliJ Database Tool Window (GUI DB Manager)
1. Open the project in **IntelliJ IDEA**.
2. Open the **Database Tool Window**:
   - Go to top menu: `View` ➔ `Tool Windows` ➔ `Database` (or click **Database** tab on the right sidebar).
3. Add a new MySQL Data Source:
   - Click the **`+` (New)** icon at the top left of the Database window.
   - Select **Data Source** ➔ **MySQL**.
4. Fill in connection details:
   - **Host**: `localhost`
   - **Port**: `3306`
   - **User**: `root` (or your MySQL username)
   - **Password**: `root` (or your MySQL password)
   - **Database**: `talentsync`
5. Test Connection & Drivers:
   - Click **Download Missing Driver Files** link if IntelliJ prompts for MySQL JDBC drivers.
   - Click **Test Connection**. You should see a green checkmark `Succeeded`.
   - Click **Apply** ➔ **OK**.
6. Execute SQL scripts directly in IntelliJ:
   - Expand the data source, right click `talentsync`, select **New** ➔ **Console**.
   - Drag or copy `backend/src/main/resources/setup_mysql.sql` into the console and press `Ctrl+Enter` (`Cmd+Enter` on macOS) to run queries.

### Method 2: Locating and Editing Database Properties File in IntelliJ Project Panel
1. In IntelliJ Project tool window (left sidebar `Alt+1` / `Cmd+1`), navigate to:
   - `backend/src/main/resources/application.properties`
2. Update the credentials directly:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/talentsync?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true
   spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

### Method 3: Setting DB Credentials in IntelliJ Run/Debug Configuration
1. Click `Run` ➔ `Edit Configurations...` in top menu.
2. Select your Spring Boot application (`BackendApplication`).
3. Under **Environment variables**, click the icon and add:
   - `SPRING_DATASOURCE_USERNAME` = `root`
   - `SPRING_DATASOURCE_PASSWORD` = `your_mysql_password`
4. Click **Apply** and **Run**.

