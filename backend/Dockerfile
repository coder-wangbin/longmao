# Build Stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git + SSL ca certificates.
# Git is required for fetching the dependencies.
# Ca-certificates is required to call HTTPS endpoints.
RUN apk update && apk add --no-cache git ca-certificates tzdata && update-ca-certificates

# Copy go mod and sum files
COPY go.mod ./
# COPY go.sum ./ 
# (Created newly, assume go.sum might not exist yet, 
# but running go mod tidy handles it)

# Copy source code
COPY . .

# Download dependencies
RUN go mod tidy

# Build the application
# -ldflags="-s -w" removes the symbol table and debug information (reduces binary size)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/server

# Run Stage
FROM scratch

WORKDIR /app

# Copy SSL certificates and Timezone info from builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
