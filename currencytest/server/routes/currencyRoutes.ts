import { Router } from 'express';
import { convertAmount } from '../controllers/currencyController';

const router = Router();

router.post('/convert/amount', convertAmount);

export default router;
