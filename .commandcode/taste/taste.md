# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# database
- Use MongoDB (not PostgreSQL) and Mongoose (not Prisma) — do not migrate the persistence layer. Confidence: 0.85

# workflow
- Run type-checking and build verification at each stage, not just at the end. Confidence: 0.60

# architecture
- Avoid implementing charts, streaks, calendars, and analytics. Stay focused on core lecture tracking workflow and add extras incrementally only when genuinely needed. Confidence: 0.60
- Prioritize visual clarity over feature count — each view should convey its full progress picture within seconds, using large progress bars, clean typography, and simple inline editing rather than dedicated management interfaces. Confidence: 0.70
- Prefer deleting code over adding code — reduce complexity rather than building more. Confidence: 0.70

# deployment
- Deploy entirely on Render (both frontend and backend), not split across Vercel + Render. Confidence: 0.60

# react
- Split components only when it improves readability; do not over-componentize. Avoid deeply nested prop chains. Confidence: 0.70

