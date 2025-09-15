import type { WebClient } from '@slack/web-api'
import type { SlackMessageEvent } from './schema'

export const replyThread = async (client: WebClient, data: SlackMessageEvent, message: string) => {
  await client.chat.postMessage({
    text: message,
    channel: data.channel,
    thread_ts: data.event_ts,
  })
}

type emojiType = 'rocket' | 'white_check_mark' | 'x' | 'eyes' | 'stopwatch'

export const addReaction = async (client: WebClient, data: SlackMessageEvent, emoji: emojiType) => {
  await client.reactions.add({
    name: emoji,
    channel: data.channel,
    timestamp: data.event_ts,
  })
}
