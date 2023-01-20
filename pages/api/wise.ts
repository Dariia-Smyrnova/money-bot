import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, History } from '@prisma/client'
const prisma = new PrismaClient()

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // body: {
    //     data: {
    //       resource: [Object],
    //       current_state: 'funds_converted',
    //       previous_state: 'processing',
    //       occurred_at: '2023-01-20T03:01:00Z'
    //     },
    //     subscription_id: 'cbfe59f5-a5e4-494d-aadc-0f0659c98051',
    //     event_type: 'transfers#state-change',
    //     schema_version: '2.0.0',
    //     sent_at: '2023-01-20T03:01:00Z'
    //   }
    console.log(req.body.data);
    const current_state = req.body.data.current_state;
    const occurred_at = req.body.data.occurred_at;
    const event_type = req.body.event_type;
    prisma.history.create(
      {data: {
        event: `${event_type}: ${current_state} ${occurred_at} data: ${req.body.data}`
      }}
    )
    return res.status(200).json({ text: 'Hello' });
}