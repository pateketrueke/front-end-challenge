help: Makefile ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: all ## Start dev environment
	@cd src && npm run dev

build: all ## Build artifacts for production
	@cd src && npm run build

# Ensure dependencies are installed before
src/node_modules: src/package*.json
	@cd src && npm i

all: src/node_modules
