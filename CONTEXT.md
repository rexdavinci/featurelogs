You are an expert full-stack developer building a "build-in-public" micro-SaaS called "FeatureLogs" (featurelogs.com).
The goal is to build a high-utility Changelog & Social Media content generator for founders with strict Freemium limitations, Stripe billing, and documentation in under 1200 lines of code.

### Tech Stack Architecture

- Framework: Next.js (App Router), Tailwind CSS, TypeScript
- UI Components: Radix UI primitives styled via Tailwind CSS (Shadcn style layouts)
- Database & Auth: Supabase (PostgreSQL, Supabase Auth, Row-Level Security)
- Payments: Stripe (Pricing Table Embed + Stripe Webhooks)
- AI Model Layer: Vercel AI SDK or OpenAI SDK Node (gpt-4o or claude-3-5-sonnet)

### App Schema (Supabase)

Create a `profiles` table:

- id: uuid (references auth.users.id)
- email: text (unique)
- is_subscribed: boolean (default: false)
- stripe_customer_id: text

Create a `logs` table:

- id: uuid (primary key)
- user_id: uuid (references auth.users.id)
- project_id: uuid (references project.id)
- raw_input: text
- output_changelog: text
- output_twitter: text
- output_linkedin: text
- created_at: timestamp with time zone (default: now())

Create `projects` table:

- id: uuid (primary key)
- user_id: uuid (references auth.user.id)
- project_name: text unique (default: 'My Startup' concatenated with a number whole number of between 1 and 9999)

### Strict Tier Enforcement Logic (Implement in Server Actions / API Routes)

1. FREE TIER (is_subscribed == false):
   - Project Limit: Only 1 unique project_name is allowed across all entries in the logs table. If they try to type a new project name, block the generation.
   - Frequency Limit: Count logs where user_id = current_user and created_at is within the current calendar month. If count >= 10, block generation and return a "Monthly limit reached" error.
   - Retention Limit: When loading the history view, filter out logs where created_at is older than 7 days (WHERE created_at > now() - INTERVAL '7 days').
   - Feature Blurring: The LinkedIn output tab must be blurred with an "Upgrade" banner.

2. PREMIUM TIER (is_subscribed == true):
   - Project Limit: Allow up to 100 unique project_name entries.
   - Frequency Limit: Count logs where user_id = current_user and created_at > now() - INTERVAL '24 hours'. If count >= 50, block generation.
   - Retention Limit: Return all historical logs with no date restrictions.
   - Feature Access: Unlocks the LinkedIn tab cleanly.

### App Views & Functional Layout

#### 1. /dashboard (The Control Center)

- Top Bar: FeatureLogs Logo, Usage Meter (e.g., "3/10 Free Logs Used this month" or "Pro Tier"), FAQ link, Logout.
- Left Column (The Input Engine):
  - Text input for "Project Name" (Validates project caps based on tier).
  - Textarea for raw Git logs, feature text, or bug notes.
  - "Generate Package" Action Button (Performs server-side tier checks before calling the LLM).
- Right Column (The Distribution Hub):
  - Tab 1: "Public Changelog" (Markdown preview + copy button).
  - Tab 2: "X Thread" (Split text blocks up to 280-char counts, copy button + native intent link twitter.com/intent/tweet?text=).
  - Tab 3: "LinkedIn Post" (If Free: Blurred interface with CTA button leading to /pricing. If Pro: Render text cleanly with copy + share utilities).
- Bottom Panel (History Log):
  - A simple list showing past updates. On the Free tier, only display logs from the past 7 days. On Premium, show everything paginated.

#### 2. /pricing (Stripe Portal)

- Render the <stripe-pricing-table> web component. Use Next.js <Script> tags to load https://js.stripe.com/v3/pricing-table.js asynchronously. Pass the authenticated user's email into the component dynamically.

#### 3. /faq (Documentation)

- Build an Accordion layout addressing:
  - "What are the limits on the Free Plan?" (10 generations/mo, 1 project, 7-day history).
  - "How do the native share features work?"
  - "Can I log minor updates like hotfixes?" (Yes, minor logs keep your build-in-public feed active).

#### 4. /api/webhook/stripe

- Next.js App Router POST API endpoint using await req.text() for incoming event verification. Listen for checkout.session.completed and customer.subscription.deleted to flip is_subscribed in Supabase.

### Step-by-Step Implementation Blueprint

1. Setup Next.js boilerplate, Tailwind configuration, and install UI dependencies.
2. Configure the Supabase Client and write basic middleware to redirect unauthenticated users to a login page.
3. Build the Stripe Webhook route first to ensure the is_subscribed database flag operates perfectly.
4. Implement the Server Action for text generation, integrating the SQL aggregate queries (COUNT) to check project and usage limits _before_ calling the AI endpoint.
5. Code the Dashboard front-end, making sure the LinkedIn layout and History records accurately reflect the active subscription tier.
