#!/bin/sh
set -e

if [ "$1" = 'frankenphp' ] || [ "$1" = 'php' ] || [ "$1" = 'artisan' ]; then

	# Install Composer dependencies if vendor/ is empty
	if [ -z "$(ls -A 'vendor/' 2>/dev/null)" ]; then
		composer install --prefer-dist --no-progress --no-interaction
	fi

	# Create .env from .env.example if not present
	if [ ! -f .env ]; then
		cp .env.example .env
	fi

	# Generate Laravel app key if not set
	if ! grep -q "^APP_KEY=base64:" .env; then
		php artisan key:generate --no-interaction
	fi

	# Wait for PostgreSQL to be ready
	echo "Waiting for database to be ready..."
	ATTEMPTS_LEFT_TO_REACH_DATABASE=60
	until [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ] || DATABASE_ERROR=$(php artisan db:monitor 2>&1); do
		sleep 1
		ATTEMPTS_LEFT_TO_REACH_DATABASE=$((ATTEMPTS_LEFT_TO_REACH_DATABASE - 1))
		echo "Still waiting for database... ${ATTEMPTS_LEFT_TO_REACH_DATABASE} attempts left."
	done

	if [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ]; then
		echo "Database is not reachable:"
		echo "$DATABASE_ERROR"
		exit 1
	else
		echo "Database is ready!"
	fi

	# Run migrations
	if [ "$(find ./database/migrations -iname '*.php' -print -quit)" ]; then
		php artisan migrate --force --no-interaction
	fi

	# Set permissions for storage and cache
	setfacl -R -m u:www-data:rwX -m u:"$(whoami)":rwX storage bootstrap/cache 2>/dev/null || true
	setfacl -dR -m u:www-data:rwX -m u:"$(whoami)":rwX storage bootstrap/cache 2>/dev/null || true
fi

exec docker-php-entrypoint "$@"
