# spotimann
Microservice based music streaming service

## Thing to do the thing

```
docker exec -it spotimann_keycloak_1 /opt/jboss/keycloak/bin/standalone.sh -Djboss.socket.binding.port-offset=100 -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.realmName=spotimann -Dkeycloak.migration.usersExportStrategy=REALM_FILE -Dkeycloak.migration.file=/store/spotimann.json
```

<!-- ## Connect to song information service
1. Run `docker-compose up`
2. Open **MongoDB Compass**
3. Connect to `mongodb://localhost:27017`
3. Create database `information`
4. Create collection `songs`
5. Import `songs.json`
6. Run `node index.js`
7. Service now available under `localhost:8080`
8. Try going to `localhost:8080/1` -->

## Ports
| Service                           | Port  |
| --------------------------------- | ----- |
| Vue Frontend                      | 3000  |
| node-song-information-service     | 3001  |
| node-song-streaming-service       | 3002  |
| database-song-information-service | 27017 |
| keycloak                          | 8180  |

## Keycloak

### Setup

Sollte sich die Keycloak-Konfiguration ändern, muss der Docker-Container für Keycloak vorher gelöscht werden, damit der Import der neuen Daten erfolgreich abläuft.

Dazu muss folgender Befehl ausgeführt werden: `docker rm spotimann_keycloak_1`.

### Technische Dinge

Unter http://localhost:8180/auth/realms/spotimann/protocol/openid-connect/certs kann ein JSON abgerufen werden, das Infos zu dem verwendeten Public RSA Key enthält.