include .env

.PHONY: dev-start dev-be migrate prod-setup prod-start

dev-start:
		docker-compose --env-file .env up -d

dev-be:
		docker exec -u node -ti fullstack-be yarn dev

migrate:
		docker exec -i fullstack-db mysql --user=root --password="$(MYSQL_ROOT_PASSWORD)" --database="$(MYSQL_DATABASE)" < sql/demo_table_create.sql
		docker exec -i fullstack-db mysql --user=root --password="$(MYSQL_ROOT_PASSWORD)" --database="$(MYSQL_DATABASE)" < sql/fixtures.sql

prod-setup:
		docker-compose -f docker-compose-prod.yml build

prod-start:
		docker-compose -f docker-compose-prod.yml up
