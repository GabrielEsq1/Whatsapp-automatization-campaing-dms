# -------------------------------------------------
# 1️⃣  CONFIGURACIÓN INICIAL
# -------------------------------------------------
# Verifica que la CLI está disponible
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Vercel CLI..."
    npm i -g vercel
}

# Necesitamos el token en la variable de entorno VERCEL_TOKEN
if (-not $env:VERCEL_TOKEN) {
    Write-Error "⚠️  La variable de entorno VERCEL_TOKEN no está definida.
    Exporta tu token antes de ejecutar el script:
        `$env:VERCEL_TOKEN = '<TU_VERCELE_TOKEN>'
    "
    exit 1
}

# ID del proyecto Vercel (lo encuentras en Vercel → Project Settings → General → Project ID)
$projectId = "<TU_VERCELE_PROJECT_ID>"   # <-- REEMPLAZA con tu Project ID

# -------------------------------------------------
# 2️⃣  PIDE la cadena de conexión a PostgreSQL
# -------------------------------------------------
$pgConnection = Read-Host "Introduce la URL de conexión a PostgreSQL (ej.: postgres://user:pass@host:5432/dbname)"
if ([string]::IsNullOrWhiteSpace($pgConnection)) {
    Write-Error "❌  No se recibió una cadena de conexión. Abortando."
    exit 1
}

# -------------------------------------------------
# 3️⃣  Crea el secret `database_url` en Vercel
# -------------------------------------------------
Write-Host "\nCreando secret `database_url` en Vercel..."
vercel secret add database_url $pgConnection --project $projectId --token $env:VERCEL_TOKEN
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌  Error al crear el secret `database_url`. Revisa el mensaje anterior."
    exit 1
}
Write-Host "✅  Secret `database_url` creado."

# -------------------------------------------------
# 4️⃣  Asocia la variable de entorno `DATABASE_URL` al secret
# -------------------------------------------------
Write-Host "\nAsociando la variable de entorno DATABASE_URL al secret..."
vercel env add DATABASE_URL production --secret database_url --project $projectId --token $env:VERCEL_TOKEN
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌  Error al crear la variable de entorno DATABASE_URL."
    exit 1
}
Write-Host "✅  Variable de entorno DATABASE_URL configurada (referencia al secret `database_url`)."

# -------------------------------------------------
# 5️⃣  (Opcional) Verifica que todo está listo
# -------------------------------------------------
Write-Host "\nVerificando secrets y env vars en Vercel..."
vercel secret ls --project $projectId --token $env:VERCEL_TOKEN
vercel env ls production --project $projectId --token $env:VERCEL_TOKEN
Write-Host "\n✅  Todo listo. Vuelve a lanzar el despliegue en Vercel."
