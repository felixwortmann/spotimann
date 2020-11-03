# spotimann
Microservice based music streaming service

## Thing to do the thing

```
docker exec -it spotimann_keycloak_1 /opt/jboss/keycloak/bin/standalone.sh -Djboss.socket.binding.port-offset=100 -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.realmName=spotimann -Dkeycloak.migration.usersExportStrategy=REALM_FILE -Dkeycloak.migration.file=/store/spotimann.json
```

## Alles ausführen
- `docker-compose up --build`

## Ports
| Service                           | Port  |
| --------------------------------- | ----- |
| Vue Frontend                      | 3000  |
| node-song-information-service     | 3001  |
| node-song-streaming-service       | 3003  |
| database-song-information-service | 27017 |
| keycloak                          | 8180  |

## Song-Streaming Service
Dateien aus `/song-streaming-service/music` werden auf Port `3003` statisch geserved. <br> 
Beispielsweise liegt `/song-streaming-service/music/music.mp3` unter `<hostname>:3003/music.mp3`<br>
Die ID des Songs sollte als Name der Datei verwendet werden

## Keycloak

### Setup

Sollte sich die Keycloak-Konfiguration ändern, muss der Docker-Container für Keycloak vorher gelöscht werden, damit der Import der neuen Daten erfolgreich abläuft.

Dazu muss folgender Befehl ausgeführt werden: `docker rm spotimann_keycloak_1`.

### Technische Dinge

Unter http://localhost:8180/auth/realms/spotimann/protocol/openid-connect/certs kann ein JSON abgerufen werden, das Infos zu dem verwendeten Public RSA Key enthält.