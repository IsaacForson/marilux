# WhatsApp setup

About 30 minutes. You need a Facebook account and a phone number that is **not currently
registered on WhatsApp or WhatsApp Business** — once a number is connected to the Cloud API it
can no longer be used in the normal WhatsApp app.

> **Choosing the number.** Most studios buy a second SIM for this and keep `0545489200` on the
> normal WhatsApp Business app for chatting with clients. If you use `0545489200` here, you lose
> it from the phone app. Decide before you start.

Everything below is free. Meta gives 1,000 service conversations a month at no cost.

---

## 1. Create the app

1. Go to **https://developers.facebook.com** and log in.
2. **My Apps → Create App**.
3. Under "What do you want your app to do?", choose **Other** → **Next**.
4. App type: **Business** → **Next**.
5. Name it `Marilux Beauty Bar`, add your email, **Create app**.

## 2. Add WhatsApp

1. On the app dashboard, find **WhatsApp** and click **Set up**.
2. It will ask for a Meta Business Portfolio. Create one called `Marilux Beauty Bar`.
3. You now land on **WhatsApp → API Setup**.

## 3. Get your Phone number ID

On the API Setup page you will see **"From"** with a test number and, beneath it, a
**Phone number ID** — a long number like `123456789012345`.

```
WHATSAPP_PHONE_NUMBER_ID=<that number>
```

> The test number Meta gives you can only message numbers you add under **"To"**. That is fine
> for testing. Step 6 replaces it with your real number.

## 4. Get a permanent token

The token shown on API Setup expires in 24 hours. Do not use it — create a permanent one:

1. Go to **https://business.facebook.com/settings/system-users**
   (Business Settings → Users → **System users**).
2. **Add** → name it `Marilux Website` → role **Admin** → **Create system user**.
3. Click **Add assets** → **Apps** → select your app → enable **Full control** → **Save**.
4. Click **Generate new token**:
   - App: your app
   - Token expiration: **Never**
   - Permissions: tick **`whatsapp_business_messaging`** and **`whatsapp_business_management`**
5. **Generate token**, then **copy it immediately** — it is shown only once.

```
WHATSAPP_TOKEN=<the long token>
```

## 5. Add your variables and test

Put these in `.env.local` (development) or your host's environment (production):

```bash
WHATSAPP_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
OWNER_WHATSAPP=233545489200      # your number, E.164 digits, no + and no leading 0
```

Restart the server, open **`/admin`**, scroll to **System status**, and use the
**WhatsApp test** panel.

While your app is still in development mode, first add your own number under
**WhatsApp → API Setup → "To" → Manage phone number list**, or the test will fail with
*"Recipient phone number not in allowed list"* — the panel tells you this too.

## 6. Use your real number

1. **WhatsApp → API Setup → Add phone number**.
2. Enter your business number and display name, verify by SMS or call.
3. Copy the **new** Phone number ID and replace `WHATSAPP_PHONE_NUMBER_ID`.
4. Complete **Business verification** in Business Settings when Meta prompts. Until then you are
   capped at 250 conversations a day — plenty to start.

---

## 7. The message template (important)

Meta only lets a business send **free-form** messages to someone who messaged it in the last
**24 hours**. Your clients will not have, so confirmations and reminders need an approved
**template**.

Create it at **WhatsApp Manager → Manage templates → Create template**:

| Field | Value |
| --- | --- |
| Category | **Utility** (not Marketing — Utility is approved faster and is the correct category) |
| Name | `booking_update` |
| Language | English |

**Body** — paste exactly this, including the numbered placeholders:

```
Hello {{1}}, this is Marilux Beauty Bar.

{{2}}

Service: {{3}}
Date: {{4}}
Time: {{5}}
Reference: {{6}}

Please arrive 5-10 minutes early. Reply to this message if you need to change anything.
```

Meta will ask for **sample values**. Use:

```
{{1}} Ama
{{2}} Your appointment is confirmed.
{{3}} Volume Set
{{4}} Friday, 18 September
{{5}} 9:30 AM
{{6}} MLX-260918-KXVZC
```

Submit. Approval usually takes minutes to a few hours.

Once approved, add:

```bash
WHATSAPP_CUSTOMER_TEMPLATE=booking_update
WHATSAPP_TEMPLATE_LOCALE=en        # use en_US if you picked "English (US)"
```

Restart, then press **Send as template** in the admin test panel.

> The site sends **exactly six** variables in that order. If you change the template body, keep
> six placeholders — or update `deliverToClient` in `src/lib/integrations/whatsapp.ts` to match.

---

## What happens once it is on

| Event | Client gets | You get |
| --- | --- | --- |
| Booking submitted | Email + WhatsApp: "we have your booking" | Email + WhatsApp with full details |
| You press **Accept** | Email + WhatsApp: confirmed | — |
| You press **Decline** | Email + WhatsApp: declined, deposit returned | — |
| **Send reminders** (or daily cron) | Email + WhatsApp the day before | Count of how many went out |

Nothing is ever sent silently: every action reports per-channel results, and if WhatsApp fails
the studio still gets a one-tap `wa.me` link to send it by hand.

---

## Troubleshooting

| Error | What it means |
| --- | --- |
| `Recipient phone number not in allowed list` | App still in development mode. Add the number under API Setup → "To", or publish the app. |
| `Message failed to send because more than 24 hours have passed` | Outside the service window. Use a template (step 7). |
| `Template name does not exist in the translation` | Name or language mismatch. Check `WHATSAPP_CUSTOMER_TEMPLATE` and `WHATSAPP_TEMPLATE_LOCALE` (`en` vs `en_US`). |
| `Error validating access token: Session has expired` | You used the 24-hour token. Create a System User token (step 4). |
| `(#132000) Number of parameters does not match` | The template does not have six `{{n}}` placeholders. |

The admin test panel prints Meta's own error and the fix for each of these.

## A note on cost

Service conversations — a client messaging you first — are free, up to 1,000 a month. Utility
templates you initiate are charged per conversation (a few pesewas in Ghana) after the free
allowance. Marilux's volume will sit inside the free tier for a long time.
