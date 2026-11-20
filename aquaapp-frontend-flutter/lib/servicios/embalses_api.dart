import 'dart:convert';

import 'package:http/http.dart' as http;

import '../modelos/embalse.dart';
import 'errores_api.dart';
import 'jwt.dart';

/// Cliente de `/api/embalses`. Adjunta `Authorization: Bearer <jwt>` y traduce
/// 401/403 a excepciones tipadas.
class EmbalsesApi {
  EmbalsesApi(this._cliente, this._token, {Uri? base}) : _base = base ?? Uri.base;

  final http.Client _cliente;
  final String? Function() _token;
  final Uri _base;

  Future<List<Embalse>> listar() async {
    final resp = await _enviar('GET', '/api/embalses');
    final lista = jsonDecode(resp.body) as List<dynamic>;
    return lista
        .map((e) => Embalse.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
  }

  Future<void> crear(Embalse embalse) =>
      _enviar('POST', '/api/embalses', cuerpo: embalse.toJson());

  Future<void> actualizar(Embalse embalse) =>
      _enviar('PUT', '/api/embalses/${embalse.id}', cuerpo: embalse.toJson());

  Future<void> eliminar(int id) => _enviar('DELETE', '/api/embalses/$id');

  Future<http.Response> _enviar(String metodo, String ruta, {Object? cuerpo}) async {
    final token = _token();
    // Sin token, o caducado según su claim `exp`: ni siquiera se llama al backend.
    if (token == null || Jwt.expirado(token)) throw const NoAutorizado();

    final peticion = http.Request(metodo, _base.resolve(ruta))
      ..headers['Authorization'] = 'Bearer $token';
    if (cuerpo != null) {
      peticion.headers['Content-Type'] = 'application/json';
      peticion.body = jsonEncode(cuerpo);
    }

    final http.Response resp;
    try {
      resp = await http.Response.fromStream(await _cliente.send(peticion));
    } on Exception {
      throw const ErrorApi();
    }
    if (resp.statusCode == 401) throw const NoAutorizado();
    if (resp.statusCode == 403) throw const Prohibido();
    if (resp.statusCode < 200 || resp.statusCode >= 300) {
      throw ErrorApi(resp.statusCode);
    }
    return resp;
  }
}
