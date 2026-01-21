# Instrukcje wdrożenia do Azure

## Krok po kroku - Konfiguracja Microsoft Entra External ID i wdrożenie aplikacji

### 1️⃣ Utwórz Microsoft Entra External ID Tenant

```bash
# Zaloguj się do Azure
az login

# Opcjonalnie: Zobacz dostępne subskrypcje
az account list --output table

# Ustaw aktywną subskrypcję (jeśli masz więcej niż jedną)
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

**Alternatywnie przez Azure Portal:**
1. Przejdź do https://portal.azure.com
2. Wyszukaj "Microsoft Entra External ID"
3. Kliknij "Create a tenant"
4. Wypełnij formularz i utwórz tenant
5. Zanotuj nazwę domeny (np. `contoso.ciamlogin.com`)

### 2️⃣ Zarejestruj aplikację w Entra ID

```bash
# Zainstaluj rozszerzenie Microsoft Graph (jeśli nie masz)
az extension add --name microsoft-graph

# Zarejestruj aplikację (w Twoim External ID tenant)
az ad app create \
    --display-name "Auth Test App" \
    --sign-in-audience AzureADMyOrg \
    --web-redirect-uris "http://localhost:8080" \
    --enable-id-token-issuance true

# Skopiuj appId z wyniku - to Twój CLIENT_ID
```

**Alternatywnie przez Azure Portal:**
1. W Azure Portal, przejdź do swojego External ID tenant
2. Przejdź do "App registrations" → "New registration"
3. Nazwa: "Auth Test App"
4. Supported account types: "Accounts in this organizational directory only"
5. Redirect URI: 
   - Typ: "Single-page application (SPA)"
   - URL: `http://localhost:8080`
6. Kliknij "Register"
7. Skopiuj **Application (client) ID**

### 3️⃣ Zaktualizuj konfigurację aplikacji

Edytuj `app.js` i zamień:
- `YOUR_CLIENT_ID` → Twój Application (client) ID
- `YOUR_TENANT_NAME` → Twoja nazwa tenanta (np. `contoso`)

### 4️⃣ Testuj lokalnie

```bash
# Uruchom lokalny serwer
python -m http.server 8080

# LUB za pomocą Node.js
npx http-server -p 8080
```

Otwórz http://localhost:8080 i przetestuj logowanie.

### 5️⃣ Wdróż do Azure Static Web Apps

#### Opcja A: Azure CLI

```bash
# Utwórz resource group
az group create --name rg-auth-test --location westeurope

# Utwórz Static Web App
az staticwebapp create \
    --name auth-test-app \
    --resource-group rg-auth-test \
    --location westeurope

# Pobierz deployment token
az staticwebapp secrets list \
    --name auth-test-app \
    --resource-group rg-auth-test \
    --query "properties.apiKey" -o tsv

# Wdróż aplikację używając SWA CLI
npm install -g @azure/static-web-apps-cli
swa deploy --deployment-token <YOUR_TOKEN>
```

#### Opcja B: Azure Portal

1. W Azure Portal wyszukaj "Static Web Apps"
2. Kliknij "Create"
3. Wypełnij:
   - Resource Group: Utwórz nowy `rg-auth-test`
   - Name: `auth-test-app`
   - Region: West Europe
   - Deployment source: "Other"
4. Kliknij "Review + create" → "Create"
5. Po utworzeniu, przejdź do zasobu
6. Kliknij "Manage deployment token" i skopiuj token
7. W terminalu:
   ```bash
   npm install -g @azure/static-web-apps-cli
   cd c:\Users\kwiat\projekty\auth_test
   swa deploy --deployment-token <YOUR_TOKEN>
   ```

### 6️⃣ Zaktualizuj Redirect URI

Po wdrożeniu:

```bash
# Pobierz URL aplikacji
az staticwebapp show \
    --name auth-test-app \
    --resource-group rg-auth-test \
    --query "defaultHostname" -o tsv

# Zaktualizuj redirect URI w aplikacji
az ad app update \
    --id <YOUR_APP_ID> \
    --web-redirect-uris "http://localhost:8080" "https://<YOUR_APP_URL>"
```

**Lub w Azure Portal:**
1. Wróć do "App registrations" → Twoja aplikacja
2. Przejdź do "Authentication"
3. Dodaj nowy SPA Redirect URI: `https://your-app.azurestaticapps.net`
4. Kliknij "Save"

### 7️⃣ Przetestuj wdrożoną aplikację

1. Otwórz URL swojej aplikacji (np. `https://auth-test-app.azurestaticapps.net`)
2. Kliknij "Zaloguj się"
3. Zaloguj się za pomocą konta Microsoft
4. Sprawdź, czy widzisz swoje dane użytkownika

## 🎉 Gotowe!

Twoja aplikacja jest teraz wdrożona i działa z Microsoft Entra External ID!

## 📊 Monitorowanie

```bash
# Zobacz logi Static Web App
az staticwebapp show \
    --name auth-test-app \
    --resource-group rg-auth-test

# Zobacz metryki
az monitor metrics list \
    --resource /subscriptions/<SUB_ID>/resourceGroups/rg-auth-test/providers/Microsoft.Web/staticSites/auth-test-app \
    --metric "Requests"
```

## 🧹 Czyszczenie zasobów (opcjonalnie)

```bash
# Usuń całą resource group
az group delete --name rg-auth-test --yes --no-wait
```
