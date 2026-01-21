# Wdrożenie przez GitHub Actions

Kompletny przewodnik krok po kroku do automatycznego wdrażania aplikacji do Azure Static Web Apps za pomocą GitHub Actions.

## 📋 Wymagania wstępne

- Konto GitHub
- Konto Azure z aktywną subskrypcją
- Zainstalowane narzędzia:
  - Git
  - Azure CLI

## 🚀 Krok po kroku

### 1️⃣ Przygotuj repozytorium GitHub

```powershell
# Przejdź do katalogu projektu
cd c:\Users\kwiat\projekty\auth_test

# Zainicjalizuj repozytorium Git (jeśli jeszcze nie zrobiłeś)
git init

# Dodaj wszystkie pliki
git add .

# Wykonaj commit
git commit -m "Initial commit - Auth app with Microsoft Entra External ID"

# Utwórz repozytorium na GitHub (przez interfejs webowy lub GitHub CLI)
# Jeśli masz GitHub CLI:
gh repo create auth-test-app --public --source=. --remote=origin

# Lub ręcznie przez GitHub.com:
# 1. Przejdź na https://github.com/new
# 2. Nazwa: auth-test-app
# 3. Wybierz Public lub Private
# 4. Kliknij "Create repository"
# 5. Wykonaj poniższe komendy:

git remote add origin https://github.com/TWOJA_NAZWA/auth-test-app.git
git branch -M main
git push -u origin main
```

### 2️⃣ Utwórz Azure Static Web App

```powershell
# Zaloguj się do Azure
az login

# Utwórz resource group
az group create --name rg-auth-test --location westeurope

# Utwórz Static Web App z integracją GitHub
az staticwebapp create `
    --name auth-test-app `
    --resource-group rg-auth-test `
    --source https://github.com/TWOJA_NAZWA/auth-test-app `
    --location westeurope `
    --branch main `
    --app-location "/" `
    --output-location "" `
    --login-with-github
```

**Lub przez Azure Portal:**

1. Przejdź do https://portal.azure.com
2. Wyszukaj "Static Web Apps" → "Create"
3. Wypełnij formularz:
   - **Subscription**: Twoja subskrypcja
   - **Resource Group**: `rg-auth-test` (utwórz nowy)
   - **Name**: `auth-test-app`
   - **Plan type**: Free
   - **Region**: West Europe
   - **Deployment details**:
     - **Source**: GitHub
     - Kliknij "Sign in with GitHub" i autoryzuj
     - **Organization**: Twoje konto GitHub
     - **Repository**: auth-test-app
     - **Branch**: main
   - **Build Details**:
     - **Build Presets**: Custom
     - **App location**: `/`
     - **Api location**: (pozostaw puste)
     - **Output location**: (pozostaw puste)
4. Kliknij "Review + create" → "Create"

Azure automatycznie:
- Utworzy plik workflow w `.github/workflows/`
- Doda secret `AZURE_STATIC_WEB_APPS_API_TOKEN` do repozytorium
- Uruchomi pierwsze wdrożenie

### 3️⃣ Sprawdź wygenerowany workflow

Azure powinien utworzyć plik podobny do tego w `.github/workflows/`. Workflow już istnieje w projekcie, ale możesz go zmodyfikować według potrzeb.

```powershell
# Pobierz zmiany z GitHub (jeśli Azure utworzył workflow)
git pull origin main
```

### 4️⃣ Skonfiguruj Microsoft Entra External ID

**Przed pierwszym uruchomieniem zaktualizuj `app.js`:**

1. W Azure Portal utwórz/skonfiguruj Microsoft Entra External ID tenant
2. Zarejestruj aplikację (SPA)
3. Skopiuj **Client ID** i **Tenant Name**
4. Edytuj `app.js` lokalnie:

```javascript
const msalConfig = {
    auth: {
        clientId: "TWÓJ_CLIENT_ID", // Wklej prawdziwy Client ID
        authority: "https://TWÓJ_TENANT.ciamlogin.com/", // Wklej prawdziwą domenę
        redirectUri: window.location.origin,
    },
    // ...
};
```

5. Commituj i pushuj zmiany:

```powershell
git add app.js
git commit -m "Update MSAL configuration with real credentials"
git push origin main
```

### 5️⃣ Zaktualizuj Redirect URI w Azure

Po pierwszym wdrożeniu:

```powershell
# Pobierz URL wdrożonej aplikacji
az staticwebapp show `
    --name auth-test-app `
    --resource-group rg-auth-test `
    --query "defaultHostname" -o tsv
```

Otrzymasz URL typu: `auth-test-app.azurestaticapps.net`

**Dodaj go jako Redirect URI:**

1. W Azure Portal → Microsoft Entra ID → App registrations
2. Wybierz swoją aplikację
3. Przejdź do "Authentication"
4. Dodaj nowy **Single-page application** Redirect URI:
   - `https://auth-test-app.azurestaticapps.net`
5. Zapisz zmiany

### 6️⃣ Monitoruj wdrożenie

**W GitHub:**
1. Przejdź do repozytorium na GitHub
2. Kliknij zakładkę "Actions"
3. Zobacz status workflow i logi

**W Azure Portal:**
1. Przejdź do swojego Static Web App
2. W menu wybierz "GitHub Action runs"
3. Zobacz historię wdrożeń

## 🔄 Automatyczne wdrażanie

Od teraz każdy push do gałęzi `main` automatycznie wdroży aplikację:

```powershell
# Wprowadź zmiany
git add .
git commit -m "Aktualizacja aplikacji"
git push origin main

# GitHub Actions automatycznie wdroży aplikację do Azure! 🚀
```

## 🌿 Środowiska stagingowe (Pull Requests)

Workflow automatycznie tworzy środowiska stagingowe dla Pull Requestów:

```powershell
# Utwórz nową gałąź
git checkout -b feature/nowa-funkcja

# Wprowadź zmiany
git add .
git commit -m "Dodanie nowej funkcji"
git push origin feature/nowa-funkcja

# Utwórz Pull Request na GitHub
# GitHub Actions automatycznie utworzy środowisko staging!
```

Każdy PR otrzyma unikalny URL do testowania przed merge'em do `main`.

## 🔧 Konfiguracja zaawansowana

### Zmienne środowiskowe

Jeśli potrzebujesz zmiennych środowiskowych:

1. W Azure Portal → Static Web App → "Configuration"
2. Dodaj zmienne w sekcji "Application settings"
3. Zmienne są dostępne podczas build time

### Custom Domain

```powershell
# Dodaj własną domenę
az staticwebapp hostname set `
    --name auth-test-app `
    --resource-group rg-auth-test `
    --hostname www.twojadomena.pl
```

### Monitorowanie

```powershell
# Zobacz logi aplikacji
az staticwebapp logs show `
    --name auth-test-app `
    --resource-group rg-auth-test

# Zobacz metryki
az monitor metrics list `
    --resource /subscriptions/<SUB_ID>/resourceGroups/rg-auth-test/providers/Microsoft.Web/staticSites/auth-test-app `
    --metric "Requests" `
    --interval PT1H
```

## 🐛 Troubleshooting

### Workflow nie uruchamia się
- Sprawdź czy secret `AZURE_STATIC_WEB_APPS_API_TOKEN` jest ustawiony w GitHub
- Idź do Settings → Secrets and variables → Actions

### Błąd podczas wdrażania
- Sprawdź logi w GitHub Actions
- Upewnij się że struktura projektu jest poprawna (pliki w głównym katalogu)

### Aplikacja nie działa po wdrożeniu
- Sprawdź Console w przeglądarce (F12)
- Upewnij się że Redirect URI jest poprawnie skonfigurowane
- Zweryfikuj Client ID i Authority w `app.js`

## 📚 Dodatkowe zasoby

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Azure Static Web Apps with GitHub Actions](https://learn.microsoft.com/azure/static-web-apps/github-actions-workflow)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)

## 🎉 Gotowe!

Twoja aplikacja jest teraz automatycznie wdrażana z GitHub do Azure przy każdej zmianie!

## 🧹 Czyszczenie zasobów

Jeśli chcesz usunąć wszystko:

```powershell
# Usuń Static Web App i resource group
az group delete --name rg-auth-test --yes --no-wait

# Usuń repozytorium GitHub (opcjonalnie)
gh repo delete TWOJA_NAZWA/auth-test-app --confirm
```
