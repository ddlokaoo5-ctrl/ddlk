import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 }
});
const payment = new Payment(client);

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Endpoint para criar PIX
app.post('/create-pix', async (req, res) => {
    try {
        const { amount, description, email } = req.body;

        // Validação básica
        if (!amount || !description || !email) {
            return res.status(400).json({ error: 'Missing required fields: amount, description, email' });
        }

        const paymentData = {
            body: {
                transaction_amount: Number(amount),
                description: description,
                payment_method_id: 'pix',
                payer: {
                    email: email,
                },
            },
            requestOptions: { idempotencyKey: crypto.randomUUID() }
        };

        const result = await payment.create(paymentData);

        // Extração dos dados do PIX
        const qrCodeBase64 = result.point_of_interaction.transaction_data.qr_code_base64;
        const qrCode = result.point_of_interaction.transaction_data.qr_code;
        const paymentId = result.id;

        // Salvar QR Code como imagem PNG
        const fileName = `pix-${paymentId}.png`;
        const filePath = path.join(__dirname, 'public', 'qrcodes', fileName);
        
        // Converter base64 para buffer e salvar
        const buffer = Buffer.from(qrCodeBase64, 'base64');
        fs.writeFileSync(filePath, buffer);

        // Gerar URL pública (usando BASE_URL do .env ou fallback para o host da requisição)
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const qrCodeUrl = `${baseUrl}/public/qrcodes/${fileName}`;

        // Resposta formatada para ManyChat
        return res.status(201).json({
            payment_id: String(paymentId),
            qr_code_url: qrCodeUrl,
            pix_copia_cola: qrCode
        });

    } catch (error) {
        console.error('Error creating PIX payment:', error);

        // Tratamento de erro 403 (Autorização)
        if (error.status === 403) {
            return res.status(403).json({ error: 'Mercado Pago authorization error. Check your MP_ACCESS_TOKEN.' });
        }

        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
