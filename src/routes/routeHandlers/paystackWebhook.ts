import { RequestHandler } from 'express';
import hashedAuth from '../../services/paystack/authHash';
import updateBalance from '../../utils/transactions/updateBalanceService';

export const webhookHandler: RequestHandler = async (req, res) => {
  const hash = hashedAuth(req.body);
  if (hash === req.headers['x-paystack-signature']) {
    // get event from request body
    const event = req.body;
    // do something with event
    try {
      let response;
      if (event.event === 'charge.success') {
        response = await updateBalance(event);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
  res.sendStatus(200);
};
