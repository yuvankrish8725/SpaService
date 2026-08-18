# Build Stage
FROM gradle:8.10-jdk21-alpine AS build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies --no-daemon || true
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ENV PORT=8080
EXPOSE 8080
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
