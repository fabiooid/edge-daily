import crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function percentEncode(str) {
  return encodeURIComponent(String(str)).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildOAuthHeader(method, url, bodyParams) {
  const oauthParams = {
    oauth_consumer_key: process.env.X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...bodyParams };
  const sortedParams = Object.keys(allParams).sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(sortedParams)].join('&');
  const signingKey = `${percentEncode(process.env.X_API_SECRET)}&${percentEncode(process.env.X_ACCESS_TOKEN_SECRET)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;
  const headerValue = 'OAuth ' + Object.keys(oauthParams).sort()
    .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');

  return headerValue;
}

async function draftTweet(post) {
  const articleUrl = `https://edgedaily.vercel.app/post/${post.slug}`;
  const prompt = `Write a punchy tweet about this article. Max 200 characters (not counting the URL). One sentence. Direct and specific — mention the key fact or development. No hashtags unless they naturally fit. No filler phrases like "Exciting news" or "Check this out". Do not include the URL in your response.

Article title: ${post.title}
Article summary: ${post.content.slice(0, 400)}

Respond with ONLY the tweet text, nothing else.`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    messages: [{ role: 'user', content: prompt }],
  });

  const tweetText = message.content.find(b => b.type === 'text')?.text?.trim() || post.title;
  return `${tweetText} ${articleUrl}`;
}

export async function postToX(post) {
  if (!process.env.X_API_KEY || !process.env.X_API_SECRET || !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_TOKEN_SECRET) {
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

  const data = await res.json();
  if (!res.ok) throw new Error(`X API error ${res.status}: ${JSON.stringify(data)}`);

  const tweetId = data.data?.id;
  console.log(`✅ Tweet posted: https://x.com/i/status/${tweetId}`);
  return { tweetId, tweetUrl: `https://x.com/i/status/${tweetId}` };
}
