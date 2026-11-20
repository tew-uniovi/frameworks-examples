import 'dart:convert';

import 'package:aquaapp_frontend/modelos/embalse.dart';

/// Crea un JWT de prueba (la firma no se verifica en el cliente).
String crearJwt({
  required String usuario,
  DateTime? exp,
  bool sinExp = false,
}) {
  String codificar(Map<String, Object?> datos) =>
      base64Url.encode(utf8.encode(jsonEncode(datos))).replaceAll('=', '');
  final fecha = exp ?? DateTime.now().add(const Duration(hours: 1));
  return [
    codificar({'alg': 'HS256', 'typ': 'JWT'}),
    codificar({
      'sub': usuario,
      'roles': ['ADMIN'],
      if (!sinExp) 'exp': fecha.millisecondsSinceEpoch ~/ 1000,
    }),
    'firma',
  ].join('.');
}

/// [n] embalses de prueba con nombres «Embalse 1», «Embalse 2»...
List<Embalse> embalsesDePrueba(int n) => [
      for (var i = 1; i <= n; i++)
        Embalse(
            id: i,
            nombre: 'Embalse $i',
            capacidadHm3: 100.0 + i,
            nivelActualHm3: 10.0 * i),
    ];
