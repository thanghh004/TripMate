# Stage 1: Build application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files & restore dependencies (cache layer)
COPY ["src/TripMate.API/TripMate.API.csproj", "src/TripMate.API/"]
COPY ["src/TripMate.Application/TripMate.Application.csproj", "src/TripMate.Application/"]
COPY ["src/TripMate.Domain/TripMate.Domain.csproj", "src/TripMate.Domain/"]
COPY ["src/TripMate.Infrastructure/TripMate.Infrastructure.csproj", "src/TripMate.Infrastructure/"]

RUN dotnet restore "src/TripMate.API/TripMate.API.csproj"

# Copy source code & publish
COPY . .
WORKDIR "/src/src/TripMate.API"
RUN dotnet publish "TripMate.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

ENV ASPNETCORE_URLS=http://+:8080
# Khắc phục lỗi inotify limit trên Linux / Render Container
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TripMate.API.dll"]
