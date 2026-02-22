import 'package:shared_preferences/shared_preferences.dart';

class PreferenceService {
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<void> setLastEmail(String email) async {
    await _prefs.setString('last_email', email);
  }

  static String? getLastEmail() {
    return _prefs.getString('last_email');
  }

  static Future<void> setAuthToken(String token) async {
    await _prefs.setString('auth_token', token);
  }

  static String? getAuthToken() {
    return _prefs.getString('auth_token');
  }

  static Future<void> clearAuthToken() async {
    await _prefs.remove('auth_token');
  }

  static Future<void> setIsDarkMode(bool isDark) async {
    await _prefs.setBool('is_dark_mode', isDark);
  }

  static bool isDarkMode() {
    return _prefs.getBool('is_dark_mode') ?? false;
  }

  static Future<void> clearAll() async {
    await _prefs.clear();
  }
}
