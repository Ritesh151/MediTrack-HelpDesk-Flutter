import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'dart:ui' as ui;
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/auth_provider.dart';
import 'providers/hospital_provider.dart';
import 'providers/ticket_provider.dart';
import 'providers/user_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/chat_provider.dart';
import 'routes/app_router.dart';
import 'core/theme/app_theme.dart';
import 'services/preference_service.dart';
import 'services/navigation_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  ui.channelBuffers.resize('flutter/keyevent', 100);

  // Initialize Preferences
  await PreferenceService.init();

  // Initialize Firebase (Client SDK)
  try {
    if (Firebase.apps.isEmpty) {
      final isAndroidOrIOS =
          defaultTargetPlatform == TargetPlatform.android ||
          defaultTargetPlatform == TargetPlatform.iOS;

      if (kIsWeb || !isAndroidOrIOS) {
        debugPrint(
          'Firebase client initialization skipped: missing FirebaseOptions for this platform. '
          'Configure FlutterFire and call Firebase.initializeApp(options: ...) for web/desktop.',
        );
      } else {
        await Firebase.initializeApp();
      }
    }
  } catch (e) {
    debugPrint("Firebase client initialization skipped/failed: $e.");
  }

  runApp(const MediTrackApp());
}

class MediTrackApp extends StatelessWidget {
  const MediTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => HospitalProvider()),
        ChangeNotifierProvider(create: (_) => TicketProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            navigatorKey: NavigationService.navigatorKey,
            title: 'MediTrack Pro',
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            initialRoute: AppRouter.splash,
            onGenerateRoute: AppRouter.onGenerateRoute,
          );
        },
      ),
    );
  }
}
