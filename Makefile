.PHONY: up down restart seed test lint typecheck build kind-up deploy rollback chaos load clean

up:
	docker compose --profile core up -d

down:
	docker compose --profile core down

restart: down up

seed:
	pnpm --filter @kineticfit/db seed

test:
	pnpm test

lint:
	pnpm lint

typecheck:
	pnpm typecheck

build:
	pnpm build

kind-up:
	bash scripts/kind-up.sh

deploy:
	helm upgrade --install kineticfit deploy/helm/kineticfit -f deploy/helm/kineticfit/values.yaml

rollback:
	helm rollback kineticfit

chaos:
	pnpm --filter @kineticfit/chaos run chaos

load:
	k6 run load/k6-thresholds.js

clean:
	pnpm clean
