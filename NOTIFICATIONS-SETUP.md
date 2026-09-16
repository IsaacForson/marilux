# Email & SMS setup

Every booking sends **four messages** — an email and a text to the client, an email and a text to
you. If one is missed or filtered, the other still lands.

| Moment | Client gets | You get |
| --- | --- | --- |
| Booking submitted | Email + SMS: "booking received" | Email + SMS with full details and their notes |
| You press **Accept** | Email + SMS: confirmed | — |
| You press **Decline** | Email + SMS: declined, deposit refunded | — |
| Reminder (button or daily cron) | Email + SMS the day before | Count of how many went out |

Nothing is sent silently: every action reports per-channel results in the dashboard, with the
provider's own error text when something fails.

---

## Part 1 — Email with Brevo (15 minutes, free)

Brevo gives 300 transactional emails a day free, which is far more than Marilux will need, and
lands in inboxes more reliably than sending from Gmail directly.

1. Sign up at **https://www.brevo.com** (free plan).
2. Verify your sender address: **Senders, Domains & Dedicated IPs → Senders → Add a sender**.
   Use `Mariluxbeautybar@gmail.com`. Brevo emails you a confirmation link — click it.
3. Go to **SMTP & API → API keys** and generate a key (starts `xkeysib-`).
   Also note the **SMTP** tab's Login and key as a fallback.
4. Add to your environment:

```bash
BREVO_API_KEY=xkeysib-...              # preferred transport
SMTP_HOST=smtp-relay.brevo.com         # automatic fallback
SMTP_PORT=587
SMTP_USER=8a1b2c001@smtp-brevo.com     # the Login Brevo shows you, not your email
SMTP_PASSWORD=xsmtpsib-...
SMTP_FROM=Mariluxbeautybar@gmail.com   # MUST be verified in step 2
OWNER_EMAIL=Mariluxbeautybar@gmail.com # where your booking alerts go
```

5. Restart, make a test booking on the site, and check both inboxes.

> **The API is tried first, SMTP second.** Serverless hosts commonly block outbound SMTP ports;
> an HTTPS call always gets through. If the API call fails for any reason and SMTP is also
> configured, the send falls back automatically rather than dropping the message.

> **`SMTP_FROM` must be a verified sender.** This is the most common first-run failure: Brevo
> silently rejects mail from an address that is not listed under Senders. Add and verify
> `Mariluxbeautybar@gmail.com` before pointing `SMTP_FROM` at it.

> **Later, for best deliverability:** authenticate your own domain in Brevo (Domains → Add a
> domain) and send from `bookings@mariluxbeautybar.com`. Gmail and Outlook trust a verified
> domain far more than a free Gmail address used as a From line.

### Or keep using Gmail

Turn on 2-Step Verification, create an **App Password** at
https://myaccount.google.com/apppasswords, and use:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=Mariluxbeautybar@gmail.com
SMTP_PASSWORD=<the 16-character app password, not your account password>
```

Gmail's limit is about 500 a day. It works, but transactional mail from a personal Gmail is more
likely to land in spam.

---

## Part 2 — SMS

**One honest note first:** SMS is never free anywhere. Brevo's *email* is free; its **SMS is
paid credits**, and it is expensive for Ghana. Use a Ghanaian provider — messages cost a few
pesewas rather than several cedis.

| Provider | Why | Sign up |
| --- | --- | --- |
| **Arkesel** | Cheapest for Ghana, simplest API. Start here. | https://arkesel.com |
| **Hubtel** | Same account you would use for payments | https://hubtel.com |
| **mNotify** | Well established in Ghana | https://mnotify.com |
| Brevo | Only if you want one vendor for everything | https://www.brevo.com |
| Twilio | Global, most expensive here | https://www.twilio.com |

### Arkesel (recommended)

1. Sign up at **https://arkesel.com** and verify your account.
2. **Register your Sender ID.** This is the name clients see instead of a number — use
   `MARILUX`. Ghanaian networks require it to be approved before anything will deliver, and
   approval takes a day or so. Do this first.
3. Buy a small bundle of SMS credits to start.
4. **Developers / API → API Keys**, copy your key.
5. Add to your environment:

```bash
SMS_PROVIDER=arkesel
ARKESEL_API_KEY=<your key>
SMS_SENDER_ID=MARILUX          # must match what Arkesel approved
OWNER_SMS=0545489200           # where your own booking alerts are texted
```

6. Restart, open **`/admin`**, scroll to **System status** and press **Send test** in the
   **SMS test** panel. It reports the provider's own error and what to do about it.

### Hubtel

If you already have Hubtel for payments, use the same account:

```bash
SMS_PROVIDER=hubtel
HUBTEL_SMS_CLIENT_ID=<from Programmable SMS → API Keys>
HUBTEL_SMS_CLIENT_SECRET=<same place>
SMS_SENDER_ID=MARILUX
```

### Testing without an account

```bash
SMS_PROVIDER=console
```

Texts are printed to the terminal instead of sent, so you can walk the whole booking flow and
read exactly what each message says before spending anything. This is what `.env.local` is set
to right now.

---

## Costs, realistically

- **Email** — free. 300/day on Brevo covers roughly 75 bookings a day.
- **SMS** — around 3–5 pesewas per message in Ghana. Each booking sends 2 texts (you + client),
  plus one more if you send a reminder. At 10 bookings a day that is roughly **GHS 30–45 a
  month**.

Messages are written to fit **one 160-character segment**, which is why they use plain text —
a single curly apostrophe would switch the message to Unicode, halve the characters per segment
and double the cost. The code strips those automatically.

---

## Troubleshooting

| Error | What it means |
| --- | --- |
| `Sender ID not registered` / `sender not approved` | Register `MARILUX` with your provider first. Until then, nothing delivers. |
| `Insufficient balance` / `no credit` | Top up. Brevo SMS in particular is not part of its free email tier. |
| `Unauthorized` / `invalid API key` | Copy the key again from the provider dashboard. |
| Email lands in spam | Verify your sender in Brevo, and ideally authenticate your own domain. |

The dashboard's **SMS test** panel prints the real error and the fix for each of these.

---

## WhatsApp

Currently **paused**, and email + SMS cover everything it would have.

Turning it on needs a phone number that is *not* in use on the WhatsApp or WhatsApp Business app
— registering a number to the Cloud API removes it from that app permanently. There is no way
around this; it is a Meta platform rule, not a setting.

When you have a spare SIM, follow **[WHATSAPP-SETUP.md](WHATSAPP-SETUP.md)**. The code is
written and tested; it activates the moment the credentials are present.
