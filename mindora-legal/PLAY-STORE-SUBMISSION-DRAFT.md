# Mindora — Play Store Submission Draft

**Status: DRAFT — for company/legal review before submitting in Google Play Console.**
This is not hosted anywhere; it's a working document. Everything marked `[CONFIRM: ...]` is an assumption I made from reading the app's code and API docs — please verify or correct before you submit.

---

## 1. Store Listing copy

| Field | Draft value |
|---|---|
| App name (30 char max) | `Mindora — Mental Health` |
| Short description (80 char max) | `Therapy, mood tracking & AI support for your mental wellbeing.` |
| Category | Health & Fitness *(alternative: Medical — [CONFIRM which fits your positioning])* |
| Contact email | support@mindora.app |
| Website | `[CONFIRM final domain — mindora.app vs mindora.rw]` |
| Privacy Policy URL | `https://<your-hosted-domain>/privacy-policy.html` |

**Full description (draft):**

> Mindora is your mental health companion — connect with licensed therapists, track your mood day to day, and get support whenever you need it.
>
> **Find & book therapists.** Browse licensed therapists by specialty and language, check their availability, and book video, chat, or in-person sessions.
>
> **Track your mood.** Log how you're feeling, your sleep, stress, and energy levels, and see your trends over time with weekly insights.
>
> **Message your therapist.** Stay connected between sessions with secure, private messaging.
>
> **Guided exercises.** Box breathing, grounding, and body-scan exercises to help you regulate in the moment.
>
> **AI companion.** Talk things through with a supportive AI companion, available any time — with built-in safety checks that surface crisis resources if you need them.
>
> Mindora is not a replacement for emergency care. If you're in crisis, please contact your local emergency number or a crisis hotline right away.

*[CONFIRM: replace with your own voice/marketing copy — this is a functional draft, not final marketing copy.]*

---

## 2. Data Safety section (Play Console form)

Based on what the app's API layer actually sends (see `services/api.ts` and the service Swagger docs), here's how I'd answer the Data Safety questionnaire:

### Does your app collect or share any of the required user data types?
**Yes.**

### Data types collected

| Category | Data type | Collected? | Shared? | Purpose |
|---|---|---|---|---|
| Personal info | Name | Yes | No | Account functionality |
| Personal info | Email address | Yes | No | Account functionality, communications |
| Health & fitness | Health info (mood, sleep, stress, energy, journal notes) | Yes | No* | App functionality (mood tracking/insights) |
| Messages | In-app messages | Yes | No* | App functionality (therapist messaging, AI chat) |
| App activity | App interactions | Yes | No | Analytics, app functionality |
| App info & performance | Crash logs / diagnostics | `[CONFIRM: do you use Sentry/crash reporting? Not found in current dependencies]` | — | — |

\* *Shared with data processors only* — see below. Google's form distinguishes "shared with third parties" (for the third party's own purposes, e.g. advertising) from "processed by a service provider on your behalf." Mindora's AI vendor, Firebase, Resend, and Africa's Talking are service providers, not independent data recipients — answer their processor-specific question accordingly rather than marking these as general "sharing."

### Is all of the user data collected by your app encrypted in transit?
**Yes** — TLS/HTTPS to every backend service.

### Do you provide a way for users to request that their data be deleted?
**Yes** — link to `delete-account.html` (once hosted) plus in-app request via email.

### Data retention
`[CONFIRM: exact retention period once deletion request is processed]`

---

## 3. Content Rating questionnaire (IARC) — draft guidance

Answer honestly in Play Console's actual questionnaire; my read of the app's content:

- **Violence:** None.
- **Sexual content:** None.
- **Profanity:** None authored by the app (user-generated messages/journal notes could theoretically contain anything — flag "user-generated content, unmoderated by us" honestly where the form asks).
- **Controlled substances:** None depicted or promoted.
- **Mental health / self-harm references:** The app **discusses** self-harm/crisis topics supportively (crisis hotline numbers, AI safety responses) but does not depict or encourage self-harm. Google's questionnaire has a specific "references to self-harm" bucket for this — answer yes there, framed as support/resources, not depiction.
- **User-generated content / user interaction:** Yes — messaging between users (patients/therapists) and (once launched) community posts. Declare "Users can interact" and "Shares location" = No (no location data collected).

Given the sensitive subject matter, I'd lean toward **not** targeting the "Designed for Families" / children's program regardless of the numeric age result — this is a clinical/therapy product for adults.

---

## 4. App content declarations (Play Console → App content)

| Declaration | Draft answer |
|---|---|
| Ads | No ads in current app |
| In-app purchases | None currently (`[CONFIRM: no payment endpoints exist in any of the 9 backend services reviewed]`) |
| Target audience & content | Adults — `[CONFIRM minimum age, recommend 16+ or 18+ given clinical context]` |
| News app | No |
| COVID-19 contact tracing / status app | No |
| Data safety | See section 2 |
| Government app | No |
| Financial features | No |

---

## 5. Consolidated list of things that need your sign-off

1. Effective date for Privacy Policy & Terms.
2. Name of the AI vendor powering the chat companion (privacy policy currently says `[CONFIRM AI VENDOR NAME]`).
3. Data retention / deletion turnaround time (used in both the Privacy Policy and the Delete Account page).
4. Minimum account age (16 vs 18 vs other — affects Privacy Policy, Terms, and the Content Rating/target-audience answers).
5. Whether the Service is free or has any paid tier (Terms §8 currently says `[CONFIRM]`).
6. Cancellation/no-show policy for therapist appointments, if any (Terms §5).
7. Governing law confirmation from actual legal counsel (Terms §12 — I defaulted to Rwanda given the `.rw` domain and phone number, but this needs a real legal review, not my assumption).
8. Final domain this site will be hosted at, so the Play Console "Privacy Policy URL" and "Website" fields point to the right place.
9. Whether crash/analytics reporting (e.g. Sentry) is or will be used — affects the Data Safety "diagnostics" answer.

Once these are filled in, search the HTML files in this folder for `[CONFIRM` to find every spot that needs updating before you publish.
