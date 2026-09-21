FROM postgres
ENV POSTGRES_PASSWORD=docker
ENV POSTGRES_DB="child_and_me"
COPY "child_and_me".sql /docker-entrypoint-initdb.d/
