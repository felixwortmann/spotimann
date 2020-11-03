FROM mongo

COPY ratings.json /ratings.json
CMD mongoimport --host database-rating-service --db ratings --collection ratings --type json --file /ratings.json --jsonArray --drop