import 'server-only';
import { toDigits, toE164 } from './phone';

/**
 * SMS delivery.
 *
 * Several providers behind one interface, because the right choice depends on
 * which account the studio can actually open. For Ghana, the local providers
 * (Arkesel, Hubtel, mNotify) are far cheaper per message than the
 * international ones and support alphanumeric sender IDs like "MARILUX".
 *
 * Pick one with SMS_PROVIDER, or leave it unset and the first fully
 * configured provider is used.
 */

export type SmsResult = {
  ok: boolean;
  /** The provider's own error text, surfaced verbatim so it is debuggable. */
  detail?: string;
  id?: string;
  provider?: string;
};

export type SmsProvider = {
  readonly id: string;
  readonly name: string;
  /** Where to sign up, shown in the dashboard when nothing is configured. */
  readonly signup: string;
  isConfigured(): boolean;
  send(to: string, body: string): Promise<SmsResult>;
};

const senderId = () => process.env.SMS_SENDER_ID || 'MARILUX';

async function readError(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    const json = JSON.parse(text);
    return (
      json.message ||
      json.error?.message ||
      json.Message ||
      json.status ||
      text.slice(0, 200)
    );
  } catch {
    return text.slice(0, 200) || 'HTTP ' + res.status;
  }
}

/** Arkesel — Ghana. Cheapest per message, simple key auth. */
const arkesel: SmsProvider = {
  id: 'arkesel',
  name: 'Arkesel',
  signup: 'https://arkesel.com',
  isConfigured: () => Boolean(process.env.ARKESEL_API_KEY),
  async send(to, body) {
    try {
      const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
        method: 'POST',
        headers: {
          'api-key': process.env.ARKESEL_API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: senderId(),
          message: body,
          recipients: [toE164(to)],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return { ok: false, detail: await readError(res) };
      const json = (await res.json().catch(() => ({}))) as {
        status?: string;
        data?: Array<{ id?: string }>;
      };
      if (json.status && json.status !== 'success') {
        return { ok: false, detail: String(json.status) };
      }
      return { ok: true, id: json.data?.[0]?.id };
    } catch (error) {
      return { ok: false, detail: message(error) };
    }
  },
};

/** Hubtel — Ghana. Worth using if the studio already banks with Hubtel. */
const hubtel: SmsProvider = {
  id: 'hubtel',
  name: 'Hubtel SMS',
  signup: 'https://hubtel.com',
  isConfigured: () =>
    Boolean(process.env.HUBTEL_SMS_CLIENT_ID && process.env.HUBTEL_SMS_CLIENT_SECRET),
  async send(to, body) {
    const params = new URLSearchParams({
      From: senderId(),
      To: toE164(to),
      Content: body,
      ClientId: process.env.HUBTEL_SMS_CLIENT_ID as string,
      ClientSecret: process.env.HUBTEL_SMS_CLIENT_SECRET as string,
    });
    try {
      const res = await fetch('https://smsc.hubtel.com/v1/messages/send?' + params, {
        method: 'GET',
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return { ok: false, detail: await readError(res) };
      const json = (await res.json().catch(() => ({}))) as {
        MessageId?: string;
        Status?: number;
      };
      // Hubtel returns Status 0 for accepted.
      if (typeof json.Status === 'number' && json.Status !== 0) {
        return { ok: false, detail: 'Hubtel status ' + json.Status };
      }
      return { ok: true, id: json.MessageId };
    } catch (error) {
      return { ok: false, detail: message(error) };
    }
  },
};

/** mNotify — Ghana. */
const mnotify: SmsProvider = {
  id: 'mnotify',
  name: 'mNotify',
  signup: 'https://mnotify.com',
  isConfigured: () => Boolean(process.env.MNOTIFY_API_KEY),
  async send(to, body) {
    try {
      const res = await fetch(
        'https://api.mnotify.com/api/sms/quick?key=' +
          encodeURIComponent(process.env.MNOTIFY_API_KEY as string),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: [toDigits(to)],
            sender: senderId(),
            message: body,
            is_schedule: false,
            schedule_date: '',
          }),
          signal: AbortSignal.timeout(15_000),
        },
      );
      if (!res.ok) return { ok: false, detail: await readError(res) };
      const json = (await res.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
        summary?: { _id?: string };
      };
      if (json.status && json.status !== 'success') {
        return { ok: false, detail: json.message || String(json.status) };
      }
      return { ok: true, id: json.summary?._id };
    } catch (error) {
      return { ok: false, detail: message(error) };
    }
  },
};

/**
 * Brevo — global.
 *
 * Note: Brevo's *email* tier is free (300/day) but its **SMS is not** — it is
 * paid from purchased credits. Convenient if you already use Brevo for email;
 * the Ghana providers above are cheaper per message.
 */
const brevo: SmsProvider = {
  id: 'brevo',
  name: 'Brevo SMS',
  signup: 'https://www.brevo.com',
  isConfigured: () => Boolean(process.env.BREVO_API_KEY),
  async send(to, body) {
    try {
      const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY as string,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: senderId(),
          recipient: toDigits(to),
          content: body,
          type: 'transactional',
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return { ok: false, detail: await readError(res) };
      const json = (await res.json().catch(() => ({}))) as { messageId?: string | number };
      return { ok: true, id: json.messageId ? String(json.messageId) : undefined };
    } catch (error) {
      return { ok: false, detail: message(error) };
    }
  },
};

/** Twilio — global fallback. */
const twilio: SmsProvider = {
  id: 'twilio',
  name: 'Twilio',
  signup: 'https://www.twilio.com',
  isConfigured: () =>
    Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_FROM,
    ),
  async send(to, body) {
    const sid = process.env.TWILIO_ACCOUNT_SID as string;
    const auth = Buffer.from(sid + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64');
    try {
      const res = await fetch(
        'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json',
        {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + auth,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: process.env.TWILIO_FROM as string,
            To: toE164(to),
            Body: body,
          }),
          signal: AbortSignal.timeout(15_000),
        },
      );
      if (!res.ok) return { ok: false, detail: await readError(res) };
      const json = (await res.json().catch(() => ({}))) as { sid?: string };
      return { ok: true, id: json.sid };
    } catch (error) {
      return { ok: false, detail: message(error) };
    }
  },
};

/**
 * Console provider.
 *
 * Used only when SMS_PROVIDER=console. Prints the message to the server log
 * instead of sending, so the whole flow can be exercised locally without an
 * account. Never selected automatically.
 */
const consoleProvider: SmsProvider = {
  id: 'console',
  name: 'Console (development)',
  signup: '',
  isConfigured: () => process.env.SMS_PROVIDER === 'console',
  async send(to, body) {
    console.info('\n[sms → ' + toE164(to) + ']\n' + body + '\n');
    return { ok: true, id: 'console-' + Date.now() };
  },
};

export const SMS_PROVIDERS: SmsProvider[] = [
  arkesel,
  hubtel,
  mnotify,
  brevo,
  twilio,
  consoleProvider,
];

/** The provider that will actually be used, if any. */
export function activeSmsProvider(): SmsProvider | null {
  const preferred = process.env.SMS_PROVIDER;
  if (preferred) {
    const match = SMS_PROVIDERS.find((p) => p.id === preferred);
    return match && match.isConfigured() ? match : null;
  }
  return SMS_PROVIDERS.find((p) => p.id !== 'console' && p.isConfigured()) ?? null;
}

export const smsConfigured = () => activeSmsProvider() !== null;

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const provider = activeSmsProvider();
  if (!provider) {
    return {
      ok: false,
      detail:
        'No SMS provider is configured. Set one of ARKESEL_API_KEY, HUBTEL_SMS_CLIENT_ID, ' +
        'MNOTIFY_API_KEY, BREVO_API_KEY or the Twilio variables.',
    };
  }
  if (!toDigits(to)) {
    return { ok: false, detail: 'That phone number is not valid.', provider: provider.id };
  }

  const result = await provider.send(to, body);
  return { ...result, provider: provider.id };
}

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown SMS error';
}
