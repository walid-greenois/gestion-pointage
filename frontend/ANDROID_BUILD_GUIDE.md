# Guide de construction APK Android

## Configuration Capacitor terminée ✅

Votre projet est maintenant configuré pour générer une APK Android avec Capacitor.

## Étapes pour construire l'APK

### Option 1: Utiliser Android Studio (Recommandé)

1. **Ouvrir le projet Android Studio**
   ```bash
   cd frontend/android
   ```
   - Ouvrez le dossier `android` avec Android Studio

2. **Configurer le projet**
   - Android Studio va synchroniser Gradle automatiquement
   - Attendez que la synchronisation soit terminée

3. **Générer l'APK de debug**
   - Menu: Build > Build Bundle(s) / APK(s) > Build APK(s)
   - L'APK sera généré dans: `android/app/build/outputs/apk/debug/app-debug.apk`

4. **Générer l'APK de release (signé)**
   - Menu: Build > Generate Signed Bundle / APK
   - Choisissez "APK"
   - Créez ou importez un keystore pour signer l'APK
   - L'APK signé sera dans: `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: Utiliser la ligne de commande (requiert Android SDK)

1. **Installer les dépendances Android**
   - Assurez-vous d'avoir Android Studio installé
   - Configurez les variables d'environnement ANDROID_HOME

2. **Construire l'APK de debug**
   ```bash
   cd frontend/android
   ./gradlew assembleDebug
   ```

3. **Construire l'APK de release**
   ```bash
   cd frontend/android
   ./gradlew assembleRelease
   ```

## Tester l'APK

### Sur un appareil Android connecté

1. **Activer le mode développeur** sur votre téléphone
2. **Activer le débogage USB**
3. **Connecter votre téléphone** via USB
4. **Installer l'APK**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Via Android Studio

1. Connectez votre appareil Android
2. Cliquez sur le bouton "Run" (triangle vert) dans Android Studio
3. L'application sera installée et lancée automatiquement

## Configuration requise

- **Android Studio**: Arctic Fox ou supérieur
- **Android SDK**: API Level 21 ou supérieur
- **Java**: JDK 11 ou supérieur
- **Gradle**: Inclus avec Android Studio

## Permissions Android

L'application nécessitera les permissions suivantes (déjà configurées):
- **CAMERA**: Pour scanner les codes QR
- **ACCESS_FINE_LOCATION**: Pour la géolocalisation
- **INTERNET**: Pour communiquer avec le backend

## Configuration de l'API

L'URL de l'API est configurée dans `.env.local`:
```
NEXT_PUBLIC_API_URL=http://20.60.2.147:5002
```

Pour la production, changez cette URL vers votre serveur de production.

## Workflow de développement

Pour mettre à jour l'APK après des modifications:

1. **Modifier le code** dans le frontend
2. **Reconstruire**:
   ```bash
   npm run build
   ```
3. **Synchroniser Capacitor**:
   ```bash
   npx cap sync
   ```
4. **Reconstruire l'APK** dans Android Studio

## Dépannage

### Erreur: "SDK location not found"
- Configurez ANDROID_HOME dans les variables d'environnement
- Ou configurez-le dans Android Studio: File > Settings > Appearance & Behavior > System Settings > Android SDK

### Erreur: "Gradle sync failed"
- Vérifiez votre connexion internet
- Assurez-vous que les SDK Android sont installés
- Essayez "File > Invalidate Caches / Restart" dans Android Studio

### L'application ne se connecte pas au backend
- Vérifiez que votre téléphone et ordinateur sont sur le même réseau
- Vérifiez que le backend est accessible depuis l'adresse IP configurée
- Assurez-vous que le pare-feu autorise les connexions sur le port 5002

## Structure du projet Android

```
frontend/android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── assets/
│   │       │   └── public/  # Fichiers web statiques
│   │       ├── java/
│   │       └── res/        # Ressources Android
│   └── build/              # Sorties de build (APK)
└── build.gradle            # Configuration Gradle
```

## Prochaines étapes

1. Ouvrez le projet dans Android Studio
2. Construisez l'APK de debug pour tester
3. Testez sur votre appareil Android
4. Pour la production, générez un keystore et signez l'APK
