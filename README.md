# spotimann
Microservice based music streaming service

## Thing to do the thing

docker exec -it spotimann_keycloak_1 /opt/jboss/keycloak/bin/standalone.sh -Djboss.socket.binding.port-offset=100 -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.realmName=spotimann -Dkeycloak.migration.usersExportStrategy=REALM_FILE -Dkeycloak.migration.file=/store/spotimann.json
