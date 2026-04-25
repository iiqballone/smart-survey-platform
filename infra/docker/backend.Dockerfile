FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN ./mvnw -q -DskipTests package -f pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
