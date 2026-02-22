import 'package:intl/intl.dart';

class CaseNumberService {
  static int _counter = 0;

  static String generate(String hospitalCode) {
    _counter++;
    final date = DateFormat('yyyyMMdd').format(DateTime.now());
    final sequence = _counter.toString().padLeft(4, '0');
    return '$hospitalCode-$date-$sequence';
  }
}
