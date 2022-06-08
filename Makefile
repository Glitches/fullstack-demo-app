include .env

.PHONY: dev-setup dev-start dev-server-be dev-server-fe dev-migrations prod-setup prod-start

dev-setup:
		docker-compose --env-file .env -f docker-compose-common.yml -f docker-compose-dev.yml build

dev-start:
		docker-compose --env-file .env -f docker-compose-common.yml -f docker-compose-dev.yml up -d

dev-server-be:
		docker exec -u node -ti fullstack-be yarn server

dev-server-fe:
		docker exec -u node -ti fullstack-fe yarn dev

dev-migrations:
		docker exec -i fullstack-db mysql --user=root --password="$(MYSQL_ROOT_PASSWORD)" --database="$(MYSQL_DATABASE)" < sql/demo_table_create.sql
		docker exec -i fullstack-db mysql --user=root --password="$(MYSQL_ROOT_PASSWORD)" --database="$(MYSQL_DATABASE)" < sql/fixtures.sql

prod-setup:
		docker-compose --env-file .env -f docker-compose-common.yml -f docker-compose-prod.yml build

prod-start:
		docker-compose --env-file .env -f docker-compose-common.yml -f docker-compose-prod.yml up
