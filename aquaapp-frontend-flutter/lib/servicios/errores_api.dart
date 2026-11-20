/// Error devuelto por la API (o por la red).
class ErrorApi implements Exception {
  const ErrorApi([this.estado]);

  /// Código HTTP, o `null` si ni siquiera hubo respuesta.
  final int? estado;

  @override
  String toString() => 'ErrorApi(${estado ?? 'sin respuesta'})';
}

/// 401: sin token, token caducado o rechazado por el backend.
class NoAutorizado extends ErrorApi {
  const NoAutorizado() : super(401);
}

/// 403: autenticado pero sin permiso (p. ej. escribir con el rol USER).
class Prohibido extends ErrorApi {
  const Prohibido() : super(403);
}
