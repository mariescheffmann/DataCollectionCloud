# DataCollectionCloud

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