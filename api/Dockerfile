#syntax=docker/dockerfile:1

# Stage 1: Base FrankenPHP image with PHP 8.4
FROM dunglas/frankenphp:1-php8.4 AS frankenphp_upstream

# Stage 2: Common base (shared between dev and prod)
FROM frankenphp_upstream AS frankenphp_base

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
	acl \
	file \
	gettext \
	git \
	&& rm -rf /var/lib/apt/lists/*

# PHP extensions needed for Laravel + PostgreSQL
RUN set -eux; \
	install-php-extensions \
		@composer \
		apcu \
		intl \
		opcache \
		zip \
		pdo_pgsql \
		pcntl \
	;

# Copy PHP configuration
COPY --link frankenphp/conf.d/app.ini $PHP_INI_DIR/conf.d/
COPY --link frankenphp/Caddyfile /etc/caddy/Caddyfile

# Entrypoint script (waits for DB, runs migrations, etc.)
COPY --link frankenphp/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]

# Healthcheck via Caddy admin API
HEALTHCHECK --start-period=60s CMD curl -f http://localhost:2019/metrics || exit 1
CMD [ "frankenphp", "run", "--config", "/etc/caddy/Caddyfile" ]

# ---------- DEVELOPMENT ----------
FROM frankenphp_base AS frankenphp_dev

ENV APP_ENV=local
ENV XDEBUG_MODE=off

VOLUME /app/var

RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

RUN set -eux; \
	install-php-extensions \
		xdebug \
	;

COPY --link frankenphp/conf.d/app.dev.ini $PHP_INI_DIR/conf.d/

CMD [ "frankenphp", "run", "--config", "/etc/caddy/Caddyfile", "--watch" ]

# ---------- PRODUCTION ----------
FROM frankenphp_base AS frankenphp_prod

ENV APP_ENV=production
ENV FRANKENPHP_CONFIG="import worker.Caddyfile"

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY --link frankenphp/conf.d/app.prod.ini $PHP_INI_DIR/conf.d/
COPY --link frankenphp/worker.Caddyfile /etc/caddy/worker.Caddyfile

# Copy application code
COPY --link . /app

# Install production dependencies only
RUN set -eux; \
	composer install --no-cache --prefer-dist --no-dev --no-autoloader --no-scripts --no-progress; \
	composer dump-autoload --classmap-authoritative --no-dev; \
	composer run-script --no-dev post-autoload-dump; \
	chmod +x artisan; \
	sync;
