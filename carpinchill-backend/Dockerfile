# Etapa de build: Maven + JDK
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copiamos pom y src (solo lo necesario)
COPY pom.xml .
COPY src ./src

# Construimos la app sin tests
RUN mvn clean package -DskipTests

# Etapa final: solo JRE para correr la app
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copiamos el JAR generado a la imagen final
COPY --from=build /app/target/carpinchill-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Comando para iniciar la app
CMD ["java", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]