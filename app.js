// Konfiguracja Microsoft Entra External ID
// UWAGA: Zamień poniższe wartości na właściwe dla Twojej aplikacji
const msalConfig = {
    auth: {
        clientId: "443456e2-c87a-425d-9ce8-96b59b338499", // Application (client) ID z Azure Portal
        authority: "https://test153452.ciamlogin.com/", // Twoja domena External ID
        redirectUri: window.location.origin, // URL Twojej aplikacji - automatycznie dostosowuje się do środowiska
    },
    cache: {
        cacheLocation: "sessionStorage", // Przechowywanie tokenów w sessionStorage
        storeAuthStateInCookie: false,
    }
};

// Scope dla żądania tokenu
const loginRequest = {
    scopes: ["openid", "profile", "email"]
};

// Inicjalizacja MSAL
let msalInstance;

async function initializeMsal() {
    try {
        msalInstance = new msal.PublicClientApplication(msalConfig);
        await msalInstance.initialize();
        
        // Sprawdź, czy użytkownik jest już zalogowany
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            msalInstance.setActiveAccount(accounts[0]);
            showUserInfo(accounts[0]);
        }

        // Obsługa przekierowania po logowaniu
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
            msalInstance.setActiveAccount(response.account);
            showUserInfo(response.account);
        }
    } catch (error) {
        console.error('Błąd inicjalizacji MSAL:', error);
        showError('Błąd inicjalizacji aplikacji: ' + error.message);
    }
}

// Funkcja logowania
async function login() {
    try {
        showLoading(true);
        hideError();
        
        // Użyj popup lub redirect - tutaj używamy redirect
        await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
        console.error('Błąd logowania:', error);
        showError('Błąd logowania: ' + error.message);
        showLoading(false);
    }
}

// Funkcja wylogowania
async function logout() {
    try {
        showLoading(true);
        hideError();
        
        const logoutRequest = {
            account: msalInstance.getActiveAccount(),
            postLogoutRedirectUri: window.location.origin
        };
        
        await msalInstance.logoutRedirect(logoutRequest);
    } catch (error) {
        console.error('Błąd wylogowania:', error);
        showError('Błąd wylogowania: ' + error.message);
        showLoading(false);
    }
}

// Wyświetlanie informacji o użytkowniku
function showUserInfo(account) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userInfo = document.getElementById('userInfo');
    const loginSection = document.getElementById('loginSection');
    const logoutSection = document.getElementById('logoutSection');

    // Wyświetl powitanie
    welcomeMessage.textContent = `Witaj, ${account.name || account.username}! 👋`;
    welcomeMessage.classList.add('active');

    // Wypełnij dane użytkownika
    document.getElementById('userName').textContent = account.name || 'Brak danych';
    document.getElementById('userEmail').textContent = account.username || 'Brak danych';
    document.getElementById('userId').textContent = account.localAccountId || 'Brak danych';

    // Pokaż informacje o użytkowniku i przycisk wylogowania
    userInfo.classList.add('active');
    loginSection.classList.add('hidden');
    logoutSection.classList.remove('hidden');
    
    showLoading(false);
}

// Ukryj informacje o użytkowniku
function hideUserInfo() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userInfo = document.getElementById('userInfo');
    const loginSection = document.getElementById('loginSection');
    const logoutSection = document.getElementById('logoutSection');

    welcomeMessage.classList.remove('active');
    userInfo.classList.remove('active');
    loginSection.classList.remove('hidden');
    logoutSection.classList.add('hidden');
}

// Wyświetlanie błędów
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
}

// Ukrywanie błędów
function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.remove('active');
}

// Wyświetlanie loadingu
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Inicjalizacja MSAL
    await initializeMsal();

    // Przyciski
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});
