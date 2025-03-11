import { env } from "@/env";
import assert from "assert";
import EventEmitter, { on } from "events";
import { createClient, type RedisClientType } from "redis";
import superjson from "superjson";
import {
  generationCompletedToken,
  type GenerationCompletedToken,
} from "../index";
type PubSubChannels = {
  tick: { payload: "tick" };
};
type Channel = keyof PubSubChannels;
type PubSubMessage<T extends Channel = Channel> = PubSubChannels[T];
const CHANNELS: Channel[] = ["tick"];

export class PubSubAdapter<T extends Record<string, unknown> = PubSubChannels> {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private connectionPromise: Promise<unknown> | undefined = undefined;
  private ee: EventEmitter;

  constructor(redisUrl: string) {
    this.publisher = createClient({ url: redisUrl });
    this.subscriber = createClient({ url: redisUrl });

    this.publisher.on("error", (err) =>
      console.error("Redis Publisher Error:", err),
    );
    this.subscriber.on("error", (err) =>
      console.error("Redis Subscriber Error:", err),
    );

    this.ee = new EventEmitter();

    void this.connect();
  }

  async connect(): Promise<void> {
    if (this.connectionPromise === undefined) {
      this.connectionPromise = Promise.all([
        this.publisher.connect(),
        this.subscriber.connect(),
        ...CHANNELS.map((channel) =>
          this.subscriber.subscribe(channel, (message) => {
            this.ee.emit(channel, message);
          }),
        ),
      ]);
    }
    await this.connectionPromise;
  }

  async disconnect(): Promise<void> {
    if (this.connectionPromise === undefined) return;
    await this.connectionPromise;
    await Promise.all([
      this.publisher.disconnect(),
      this.subscriber.disconnect(),
    ]);
    this.connectionPromise = undefined;
  }

  async publish<K extends keyof T>(
    channel: K,
    message: T[K] | GenerationCompletedToken,
    key: string,
  ): Promise<void> {
    assert(
      CHANNELS.includes(channel as Channel),
      `Invalid channel: ${channel as Channel}`,
    );
    await this.connect();
    const payload = superjson.stringify({ key, message });
    await this.publisher.publish(channel as Channel, payload);
  }

  async publishEndOfGeneration<K extends keyof T>(
    channel: K,
    key: string,
  ): Promise<void> {
    await this.publish(channel, generationCompletedToken, key);
  }

  async *subscribeIterator<K extends Channel>({
    channel,
    key,
    signal,
  }: {
    channel: K;
    key: string;
    signal?: AbortSignal;
  }): AsyncGenerator<PubSubMessage<K>, void, unknown> {
    await this.connect();
    for await (const [payload] of on(this.ee, channel, {
      signal,
    })) {
      const { key: payloadKey, message } = superjson.parse<{
        key: string;
        message: PubSubMessage<K> | GenerationCompletedToken;
      }>(payload as string);
      if (payloadKey !== key) continue;
      if (message === generationCompletedToken) {
        break;
      }
      yield message;
    }
  }
}

export const pubsubAdapter = new PubSubAdapter<PubSubChannels>(env.REDIS_URL);
