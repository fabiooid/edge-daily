import crypto from 'crypto';
import dotenv from 'dotenv';
import { mastra } from './src/mastra/index.ts';
import type { Post } from './database.ts';

dotenv.config();

function percentEncode(str: string): string {
  return encodeURIComponent(String(str)).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildOAuthHeader(
  method: string,
  url: string,
  bodyParams: Record<string, string>
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: process.env.X_API_KEY || '',
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN || '',
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...bodyParams };
  const sortedParams = Object.keys(allParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(sortedParams)].join('&');
  const signingKey = `${percentEncode(process.env.X_API_SECRET || '')}&${percentEncode(process.env.X_ACCESS_TOKEN_SECRET || '')}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;
  const headerValue =
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(', ');

  return headerValue;
}

async function draftTweet(post: Post): Promise<string> {
  const articleUrl = `https://edgedaily.vercel.app/post/${post.slug}`;
  const prompt = `Write a punchy tweet about this article. Max 200 characters (not counting the URL).

Article title: ${post.title}
Article summary: ${post.content.slice(0, 400)}`;

  const tweetAgent = mastra.getAgent('tweetAgent');
  const result = await tweetAgent.generate(prompt);
  const tweetText = (result.text || post.title).trim();
  return `${tweetText} ${articleUrl}`;
}

export async function postToX(post: Post): Promise<{ tweetId: string; tweetUrl: string } | undefined> {
  if (
    !process.env.X_API_KEY ||
    !process.env.X_API_SECRET ||
    !process.env.X_ACCESS_TOKEN ||
    !process.env.X_ACCESS_TOKEN_SECRET
  ) {
    console.log('⏭️  X credentials not set — skipping tweet');
    return;
  }

  console.log(`🐦 Drafting tweet for: ${post.title}`);
  const tweetText = await draftTweet(post);
  console.log(`📝 Tweet: ${tweetText}`);

  const url = 'https://api.twitter.com/2/tweets';
  const body = { text: tweetText };
  const authHeader = buildOAuthHeader('POST', url, {});

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { data?: { id?: string } };
  if (!res.ok) throw new Error(`X API error ${res.status}: ${JSON.stringify(data)}`);

  const tweetId = data.data?.id || '';
  console.log(`✅ Tweet posted: https://x.com/i/status/${tweetId}`);
  return { tweetId, tweetUrl: `https://x.com/i/status/${tweetId}` };
}
