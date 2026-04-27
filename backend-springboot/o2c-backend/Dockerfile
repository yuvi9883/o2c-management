# ── Stage 1: Build ──────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml from the correct subfolder
COPY backend-springboot/o2c-backend/pom.xml ./pom.xml

# Copy source code from the correct subfolder
COPY backend-springboot/o2c-backend/src ./src

# Build the JAR file (skip tests to save time)
RUN mvn clean package -DskipTests

# ── Stage 2: Run ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR from stage 1
COPY --from=build /app/target/o2c-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]