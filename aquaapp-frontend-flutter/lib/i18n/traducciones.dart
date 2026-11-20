import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

/// Idiomas soportados.
const List<String> idiomasSoportados = ['es', 'en'];

/// Idioma por defecto a partir de `navigator.language` (`en-US` -> `en`).
String idiomaPorDefecto(String? idiomaNavegador) =>
    (idiomaNavegador ?? '').toLowerCase().startsWith('en') ? 'en' : 'es';

/// Diccionario `clave -> texto` de un idioma, cargado en tiempo de ejecución
/// desde `assets/i18n/<idioma>.json` (mismas claves que el cliente original),
/// más formateo de números y fechas con `intl`.
class Traducciones {
  Traducciones(this.idioma, this._textos);

  final String idioma;
  final Map<String, String> _textos;

  static Future<Traducciones> cargar(String idioma, {AssetBundle? bundle}) async {
    final json = await (bundle ?? rootBundle).loadString('assets/i18n/$idioma.json');
    final mapa = (jsonDecode(json) as Map<String, dynamic>).cast<String, String>();
    return Traducciones(idioma, mapa);
  }

  /// Texto de [clave]; si no existe, la propia clave.
  String t(String clave) => _textos[clave] ?? clave;

  String numero(num valor) => NumberFormat.decimalPattern(idioma).format(valor);

  String fecha(DateTime fecha) => DateFormat.yMd(idioma).add_Hm().format(fecha);
}
