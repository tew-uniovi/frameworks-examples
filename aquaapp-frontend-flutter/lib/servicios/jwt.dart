import 'dart:convert';

/// Lectura (sin verificar la firma, eso es cosa del backend) de un JWT.
class Jwt {
  const Jwt._();

  /// Payload del token, o `null` si el token está mal formado.
  static Map<String, dynamic>? carga(String token) {
    try {
      final partes = token.split('.');
      if (partes.length != 3) return null;
      final json = utf8.decode(base64Url.decode(base64Url.normalize(partes[1])));
      final mapa = jsonDecode(json);
      return mapa is Map<String, dynamic> ? mapa : null;
    } on FormatException {
      return null;
    }
  }

  /// Usuario autenticado: claim `sub`.
  static String? usuario(String token) => carga(token)?['sub'] as String?;

  /// `true` si el claim `exp` (segundos Unix) ya ha pasado o el token no es
  /// legible. Un token sin `exp` se considera vigente, como en el cliente original.
  static bool expirado(String token, {DateTime? ahora}) {
    final datos = carga(token);
    if (datos == null) return true;
    final exp = datos['exp'];
    if (exp is! num) return false;
    return (ahora ?? DateTime.now()).millisecondsSinceEpoch >= exp * 1000;
  }
}
