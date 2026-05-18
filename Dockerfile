# Use the lightweight nginx alpine image as the base
FROM nginx:alpine

# Copy all static files into nginx's default web root
COPY . /usr/share/nginx/html

# Replace the default nginx config with our custom one.
# Cloud Run requires the container to listen on port 8080,
# not nginx's default port 80.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
