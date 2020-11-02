FROM mongo

COPY songs.json /songs.json
CMD mongoimport --host database-song-information-service --db information --collection songs --type json --file /songs.json --jsonArray --drop