# Backend ASP.NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .
# escuchar en puerto 5192 por compatibilidad
ENV ASPNETCORE_URLS=http://+:5192
EXPOSE 5192
ENTRYPOINT ["dotnet", "Backend.dll"]
