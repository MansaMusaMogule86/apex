type RedisCommand = Array<string | number>;

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return { url, token };
}

async function runRedisCommand(command: RedisCommand) {
  const config = getRedisConfig();
  if (!config) {
    return { skipped: true } as const;
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Upstash command failed: ${response.status} ${details}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export async function enqueue(queueName: string, payload: Record<string, unknown>) {
  const envelope = JSON.stringify({ payload, queuedAt: new Date().toISOString() });
  return runRedisCommand(["LPUSH", queueName, envelope]);
}

export async function addRetry(queueName: string, payload: Record<string, unknown>, delaySeconds: number) {
  const key = `${queueName}:retry`;
  const score = Math.floor(Date.now() / 1000) + delaySeconds;
  const value = JSON.stringify({ payload, retryAt: score });
  return runRedisCommand(["ZADD", key, score, value]);
}

export async function publish(channel: string, payload: Record<string, unknown>) {
  return runRedisCommand(["PUBLISH", channel, JSON.stringify(payload)]);
}
