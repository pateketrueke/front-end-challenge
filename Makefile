# Defaults:
branch := feature/ui-proto
message := Release: $(shell date)

help: Makefile ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: all ## Start dev environment
	@cd src && npm run dev

open: all ## Run dev and open the browser :wink:
	@cd src && npm run dev -- -o

build: all ## Build artifacts for production
	@cd src && npm run build

clean: ## Remove al built artifacts and dependencies
	@rm -rf src/node_modules
	@rm -rf src/build
	@(unlink src/.tarima || true) > /dev/null 2>&1

dist: src/build ## Publish built files over gh-pages
	@(git branch -D gh-pages || true) > /dev/null 2>&1
	@git checkout --orphan gh-pages
	@git merge $(branch)
	@cp -r src/build/* .
	@git add . && git commit -m "$(message)"
	@git push origin gh-pages -f
	@git checkout $(branch)

# Ensure dependencies are installed before
src/node_modules: src/package*.json
	@cd src && npm i

all: src/node_modules
