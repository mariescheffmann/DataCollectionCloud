# DataCollectionCloud

*After completion of this guide, the files edge-client.crt and edge-client.key should be moved to the certs folder on the Edge, ant the file ca.crt should be copied to the same folder.*

## Certification for Windows machine (localhost) - Powershell

- winget install FiloSottile.mkcert
- mkcert -install

### From project dir:
- mkdir secrets\certs -ea 0
- mkcert localhost 127.0.0.1 ::1
- move .\localhost+2.pem secrets\certs\web-fullchain.pem
- move .\localhost+2-key.pem secrets\certs\web-privkey.pem
- copy "$env:LOCALAPPDATA\mkcert\rootCA.pem" secrets\certs\ca.crt
- mkcert -cert-file secrets\certs\mosq-server.crt -key-file secrets\certs\mosq-server.key localhost 127.0.0.1 ::1

#### Make certificates for Edge
- openssl genrsa -out secrets\certs\edge-client.key 2048
- openssl req -new -key secrets\certs\edge-client.key -out secrets\certs\edge-client.csr -subj "/CN=edge"
- $ROOT_CA_KEY = "$(mkcert -CAROOT)\rootCA-key.pem"
- openssl x509 -req -in secrets\certs\edge-client.csr -CA secrets\certs\ca.crt -CAkey "$ROOT_CA_KEY" -CAcreateserial -out secrets\certs\edge-client.crt -days 365 -sha256


## For mac

brew install mkcert
mkcert -install

mkdir -p secrets/certs

# TLS-cert for webserver
mkcert localhost 127.0.0.1 ::1
mv localhost+2.pem secrets/certs/web-fullchain.pem
mv localhost+2-key.pem secrets/certs/web-privkey.pem

# Copy root CA
cp "$(mkcert -CAROOT)/rootCA.pem" secrets/certs/ca.crt

# Mosquitto server cert
mkcert -cert-file secrets/certs/mosq-server.crt -key-file secrets/certs/mosq-server.key localhost 127.0.0.1 ::1

# Create Edge client-certifikat
openssl genrsa -out secrets/certs/edge-client.key 2048
openssl req -new -key secrets/certs/edge-client.key -out secrets/certs/edge-client.csr -subj "/CN=edge"
ROOT_CA_KEY="$(mkcert -CAROOT)/rootCA-key.pem"
openssl x509 -req -in secrets/certs/edge-client.csr -CA secrets/certs/ca.crt -CAkey "$ROOT_CA_KEY" -CAcreateserial -out secrets/certs/edge-client.crt -days 365 -sha256
