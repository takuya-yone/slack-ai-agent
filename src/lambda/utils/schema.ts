import type { Logger } from '@aws-lambda-powertools/logger'
import { z } from 'zod'

export const sqsMessageAttirubutesSchema = z.object({
  'X-Slack-Request-Timestamp': z.object({
    stringValue: z.string(),
    stringListValues: z.array(z.string()),
    binaryListValues: z.array(z.string()),
    dataType: z.literal('String'),
  }),
  'X-Slack-Signature': z.object({
    stringValue: z.string(),
    stringListValues: z.array(z.string()),
    binaryListValues: z.array(z.string()),
    dataType: z.literal('String'),
  }),
})

export const slackMessageEventSchema = z.object({
  user: z.string(),
  type: z.literal('app_mention'),
  ts: z.string(),
  client_msg_id: z.string(),
  text: z.string(),
  team: z.string(),
  blocks: z.array(z.object()),
  channel: z.string(),
  event_ts: z.string(),
})
export type SlackMessageEvent = z.infer<typeof slackMessageEventSchema>

export const zodValidation = <T>(schema: z.ZodSchema<T>, data: unknown, logger: Logger): T => {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    logger.error('Zod validation error', { error: parsed.error, data })
    throw new Error('Zod validation error')
  }
  return parsed.data
}
