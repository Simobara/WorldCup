VITE_SUPABASE_URL=https://ywxjwwrelebgujsyehug.supabase. co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eGp3d3JlbGViZ3Vqc3llaHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTY3MzUsImV4cCI6MjA4Mjg3MjczNX0.nxGUBigJi7FhFbRoelpRwweMoJaAbX8u2FHGWfK5f uI

( per farli funzionare 
questi due che ho messo sopra mettili senza spazio in fondo che ho creato)


VITE_NOTES_SOURCE=remote
# oppure
# VITE_NOTES_SOURCE=local


const NOTES_SOURCE = import.meta.env.VITE_NOTES_SOURCE ?? "remote"; // "remote" | "local"



# 🔁 COME FUNZIONA DAVVERO (FLUSSO REALE)
# 1️⃣ Se l’env esiste (caso normale)
# VITE_NOTES_SOURCE=remote
# VITE_MATCHES_SOURCE=remote


# 👉 Risultato:

# NOTES_SOURCE = "remote"

# MATCHES_SOURCE = "remote"

# Supabase viene usato

# DATA_SOURCE viene ignorato (ma resta come fallback)

# 2️⃣ Se Supabase NON funziona

# Tu fai una di queste due cose (entrambe valide):

# Opzione A — cambi .env
# VITE_NOTES_SOURCE=local
# VITE_MATCHES_SOURCE=local


# 👉 Risultato:

# bypass completo di Supabase

# usa:

# file hardcoded

# localStorage

# nessuna chiamata remota

# Opzione B — togli/commenti .env
# # VITE_NOTES_SOURCE=remote
# # VITE_MATCHES_SOURCE=remote


# e in codice:

# export const DATA_SOURCE = LOCAL;


# 👉 Risultato:

# fallback automatico su DATA_SOURCE

# tutto gira in local

# puoi lavorare hardcoded e committare su GitHub

# 🧠 COSA OTTIENI (molto importante)

# ✔️ Un sistema a prova di emergenza
# ✔️ Un sistema a prova di deploy
# ✔️ Un sistema uguale per notes e matches
# ✔️ Un sistema che non richiede refactor futuri