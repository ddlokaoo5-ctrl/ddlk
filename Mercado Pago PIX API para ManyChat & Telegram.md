# Mercado Pago PIX API para ManyChat & Telegram

Esta API foi desenvolvida para facilitar a integração de pagamentos PIX do Mercado Pago em fluxos do ManyChat, especificamente para bots do Telegram.

## 🚀 Funcionalidades

- Geração de pagamento PIX dinâmico.
- Conversão automática do QR Code Base64 para imagem PNG.
- Armazenamento local de QR Codes com URL pública.
- Resposta JSON limpa e compatível com Custom Fields do ManyChat.

## 🛠️ Instalação

1. Clone ou baixe os arquivos do projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Renomeie `.env.example` para `.env`.
   - Adicione seu `MP_ACCESS_TOKEN` (Produção).
   - Configure a `BASE_URL` com o domínio onde a API será hospedada (ex: `https://sua-api.com`).

## 🏃 Execução

Para iniciar o servidor:
```bash
node index.js
```
O servidor rodará por padrão na porta `3000`.

## 🔌 Integração ManyChat (External Request)

No ManyChat, crie uma **External Request** com as seguintes configurações:

- **URL:** `https://seu-dominio.com/create-pix`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "amount": 49.90,
    "description": "Pedido Telegram",
    "email": "cliente@email.com"
  }
  ```

### Mapeamento de Resposta (Response Mapping)

Mapeie os campos JSON para Custom Fields do ManyChat:
- `$.payment_id` -> `payment_id_field`
- `$.qr_code_url` -> `qr_code_url_field` (Use este campo em uma mensagem de imagem no Telegram)
- `$.pix_copia_cola` -> `pix_code_field` (Use este campo para o botão "Copiar e Colar")

## ⚠️ Tratamento de Erros

A API retorna erros estruturados:
- `400`: Campos obrigatórios ausentes.
- `403`: Erro de autorização com o Mercado Pago (verifique o Token).
- `500`: Erro interno do servidor.
