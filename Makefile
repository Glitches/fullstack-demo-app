include .env

.PHONY: setup start sh migrate

setup:
		docker-compose build
start:
		docker-compose up -d
sh:
		docker exec -u node -ti fullstack-node sh
migrate:
		docker exec -i fullstack-db mysql --user=root --password="$(MYSQL_ROOT_PASSWORD)" --database="$(MYSQL_DATABASE)" < sql/demo_table_create.sql
		docker exec -i fullstack-db mysql --user=root --password="$(MYSQL_ROOT_PASSWORD)" --database="$(MYSQL_DATABASE)" < sql/fixtures.sql