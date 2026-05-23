import 'package:intl/intl.dart';

final _fcfa = NumberFormat('#,###', 'fr_FR');

String formatFcfa(int amount) => '${_fcfa.format(amount)} FCFA';
