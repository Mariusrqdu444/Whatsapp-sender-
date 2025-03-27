# WhatsApp Sender

WhatsApp Sender este o aplicație web care permite automatizarea trimiterii de mesaje WhatsApp fără a necesita scanarea codului QR. Aplicația utilizează autentificarea prin cod de asociere, unde utilizatorul introduce numărul său de telefon pe site pentru a primi un cod pe care îl poate introduce direct în WhatsApp.

## Caracteristici

- Autentificare prin cod de asociere (fără scanare QR)
- Trimite mesaje către contacte individuale sau grupuri
- Încarcă fișier creds.json pentru a salva sesiunea
- Trimitere mesaje din text sau din fișier
- Configureaza întârziere între mesaje
- Opțiune de reîncercare pentru mesajele eșuate
- Continuă să trimită mesaje chiar și când browserul este închis

## Cerințe

- Node.js (v14 sau mai nou)
- npm sau yarn
- Telefon cu WhatsApp instalat

## Instalare

1. Clonează repository-ul
```
git clone https://github.com/Mariusrqdu444/Whatsapp-sender-.git
cd Whatsapp-sender-
```

2. Instalează dependențele
```
npm install
npm run client-install
```

3. Creează un fișier .env (sau redenumește .env.example)
```
cp .env.example .env
```

4. Construiește aplicația client
```
npm run client-build
```

5. Pornește serverul
```
npm start
```

## Utilizare

1. Deschide aplicația în browser: `http://localhost:3000`
2. Introdu numărul tău de telefon cu codul țării (ex: +40712345678)
3. Generează un cod de asociere
4. Deschide WhatsApp pe telefon > Setări > Dispozitive conectate > Conectează un dispozitiv
5. Introdu codul afișat pe site
6. După conectare, introdu numerele de telefon țintă și mesajul
7. Apasă "Start Sending Messages" pentru a începe trimiterea mesajelor

## Hosting

Aplicația poate fi găzduită pe platforme precum:
- Bot-Hosting.net
- Render.com
- Heroku
- Orice server VPS

### Notă pentru Bot-Hosting.net
Când utilizați Bot-Hosting.net, asigurați-vă că serverul ascultă pe `0.0.0.0` pentru a permite conexiuni externe. Această configurație este deja inclusă în cod.

## Licență

MIT