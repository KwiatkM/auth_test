# Testowa Aplikacja - Microsoft Entra External ID

Prosta aplikacja webowa demonstrująca integrację z Microsoft Entra External ID (dawniej Azure AD B2C dla klientów zewnętrznych).

## 📋 Wymagania

1. Konto Azure z aktywną subskrypcją
2. Skonfigurowany tenant Microsoft Entra External ID
3. Zarejestrowana aplikacja w Azure Portal

## 🚀 Konfiguracja Microsoft Entra External ID

### Krok 1: Utwórz tenant External ID

1. Zaloguj się do [Azure Portal](https://portal.azure.com)
2. Wyszukaj "Microsoft Entra External ID"
3. Kliknij "Create" aby utworzyć nowy tenant
4. Wybierz region i nazwę dla swojego tenanta
5. Zanotuj nazwę domeny (np. `contoso.ciamlogin.com`)

### Krok 2: Zarejestruj aplikację

1. W swoim tenancie External ID przejdź do "App registrations"
2. Kliknij "New registration"
3. Podaj nazwę aplikacji (np. "Auth Test App")
4. W "Supported account types" wybierz:
   - "Accounts in this organizational directory only" dla External ID
5. W "Redirect URI":
   - Wybierz "Single-page application (SPA)"
   - Dodaj URL: `http://localhost:8080` (dla testów lokalnych)
   - Później dodasz URL produkcyjny (np. `https://your-app.azurestaticapps.net`)
6. Kliknij "Register"

### Krok 3: Skonfiguruj aplikację

1. Po zarejestrowaniu, skopiuj **Application (client) ID** ze strony "Overview"
2. Przejdź do "Authentication":
   - Upewnij się, że "Single-page application" ma odpowiednie Redirect URIs
   - W "Implicit grant and hybrid flows" zaznacz:
     - ✅ "ID tokens"
   - Zapisz zmiany
3. Przejdź do "API permissions":
   - Domyślnie powinny być: `openid`, `profile`, `email`
   - Jeśli nie ma, dodaj je ręcznie

### Krok 4: Zaktualizuj konfigurację aplikacji

Edytuj plik `app.js` i zamień następujące wartości:

```javascript
const msalConfig = {
    auth: {
        clientId: "YOUR_CLIENT_ID", // Twój Application (client) ID
        authority: "https://YOUR_TENANT_NAME.ciamlogin.com/", // Twoja domena External ID
        redirectUri: window.location.origin,
    },
    // ...
};
```

**Przykład:**
```javascript
const msalConfig = {
    auth: {
        clientId: "12345678-1234-1234-1234-123456789abc",
        authority: "https://contoso.ciamlogin.com/",
        redirectUri: window.location.origin,
    },
    // ...
};
```

## 🧪 Testowanie lokalnie

1. Uruchom prosty serwer HTTP w katalogu projektu:

```bash
# Python 3
python -m http.server 8080

# Node.js (jeśli masz zainstalowane http-server)
npx http-server -p 8080

# VS Code Live Server
# Kliknij prawym przyciskiem na index.html i wybierz "Open with Live Server"
```

2. Otwórz przeglądarkę i przejdź do `http://localhost:8080`
3. Kliknij "Zaloguj się" i przetestuj proces logowania

## ☁️ Wdrożenie do Azure Static Web Apps

### Opcja 1: Przez Azure Portal

1. Zaloguj się do [Azure Portal](https://portal.azure.com)
2. Wyszukaj "Static Web Apps" i kliknij "Create"
3. Wypełnij formularz:
   - **Subscription**: Wybierz subskrypcję
   - **Resource Group**: Utwórz nową lub wybierz istniejącą
   - **Name**: Nazwa aplikacji (np. "auth-test-app")
   - **Plan type**: Free
   - **Region**: Wybierz najbliższy region
   - **Deployment details**: 
     - Source: "Other" (dla ręcznego wdrożenia)
4. Kliknij "Review + create" i "Create"

### Opcja 2: Przez Azure CLI

```bash
# Zaloguj się do Azure
az login

# Utwórz resource group
az group create --name rg-auth-test --location westeurope

# Utwórz Static Web App
az staticwebapp create \
    --name auth-test-app \
    --resource-group rg-auth-test \
    --source . \
    --location westeurope \
    --branch main \
    --app-location "/" \
    --output-location "."
```

### Wdrożenie plików

Po utworzeniu Static Web App:

1. Pobierz deployment token z Azure Portal (Settings > Deployment token)
2. Użyj Azure CLI lub SWA CLI do wdrożenia:

```bash
# Zainstaluj SWA CLI
npm install -g @azure/static-web-apps-cli

# Wdróż aplikację
swa deploy --deployment-token <YOUR_DEPLOYMENT_TOKEN>
```

### Aktualizacja Redirect URI

Po wdrożeniu aplikacji:

1. Skopiuj URL swojej aplikacji (np. `https://auth-test-app.azurestaticapps.net`)
2. Wróć do Azure Portal > Entra ID > App registrations
3. Znajdź swoją aplikację
4. Przejdź do "Authentication"
5. Dodaj nowy Redirect URI dla produkcji:
   - `https://your-app-name.azurestaticapps.net`
6. Zapisz zmiany

## 📚 Dodatkowe zasoby

- [Microsoft Entra External ID Documentation](https://learn.microsoft.com/entra/external-id/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)

## 🔒 Bezpieczeństwo

- Nigdy nie umieszczaj wrażliwych danych w kodzie frontend
- Client ID jest publiczny i może być widoczny w kodzie
- Tokeny są przechowywane bezpiecznie przez MSAL.js
- Używaj HTTPS w środowisku produkcyjnym

## 🐛 Troubleshooting

### Problem: "AADSTS50011: The reply URL specified does not match"
**Rozwiązanie**: Upewnij się, że Redirect URI w Azure Portal dokładnie odpowiada URL-owi Twojej aplikacji.

### Problem: "AADSTS700016: Application not found"
**Rozwiązanie**: Sprawdź, czy Client ID jest poprawne i czy aplikacja jest zarejestrowana w odpowiednim tenancie.

### Problem: CORS errors
**Rozwiązanie**: Upewnij się, że używasz SPA (Single Page Application) jako typu aplikacji, nie "Web".

## 📝 Licencja

Ten projekt jest przykładową aplikacją do celów edukacyjnych.
