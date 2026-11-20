import 'dart:convert';

import 'package:http/http.dart' as http;

import 'errores_api.dart';

/// Cliente del servicio de autenticación (`/auth/*`, que nginx reenvía a auth:9000).
class AuthApi {
  AuthApi(this._cliente, {Uri? base}) : _base = base ?? Uri.base;

  final http.Client _cliente;
  final Uri _base;

  Future<String> login(String usuario, String password) =>
      _pedirToken('/auth/login', usuario, password);

  /// Crea la cuenta. Devuelve el token, pero la app no lo usa: tras registrarse
  /// se pide iniciar sesión, como en el cliente original.
  Future<String> registrar(String usuario, String password) =>
      _pedirToken('/auth/register', usuario, password);

  Future<String> _pedirToken(String ruta, String usuario, String password) async {
    final http.Response resp;
    try {
      resp = await _cliente.post(
        _base.resolve(ruta),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'usuario': usuario, 'password': password}),
      );
    } on Exception {
      throw const ErrorApi();
    }
    if (resp.statusCode < 200 || resp.statusCode >= 300) {
      throw ErrorApi(resp.statusCode);
    }
    final token = (jsonDecode(resp.body) as Map<String, dynamic>)['token'];
    if (token is! String || token.isEmpty) throw ErrorApi(resp.statusCode);
    return token;
  }
}
