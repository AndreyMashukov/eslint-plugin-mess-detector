DOCKER_RUN := docker run --rm -v "$(PWD):/app" -w /app node:22-alpine sh -c

.PHONY: install build test typecheck lint clean up down sh

install:
	$(DOCKER_RUN) 'apk add --no-cache git && npm install'

build:
	$(DOCKER_RUN) 'npm run build'

test:
	$(DOCKER_RUN) 'npm test'

typecheck:
	$(DOCKER_RUN) 'npm run typecheck'

lint:
	$(DOCKER_RUN) 'npm run lint'

clean:
	rm -rf dist coverage node_modules

up:
	docker compose up -d

down:
	docker compose down

sh:
	docker compose exec app sh
