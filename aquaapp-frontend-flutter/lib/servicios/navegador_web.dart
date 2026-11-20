import 'package:web/web.dart' as web;

import 'almacen.dart';
import 'indicador_listo.dart';

/// Almacén respaldado por `window.sessionStorage` o `window.localStorage`.
class AlmacenWeb implements Almacen {
  AlmacenWeb._(this._storage);

  /// Vive solo mientras dure la pestaña (aquí se guarda el JWT).
  factory AlmacenWeb.sesion() => AlmacenWeb._(web.window.sessionStorage);

  /// Persiste entre visitas (aquí se guarda el idioma).
  factory AlmacenWeb.local() => AlmacenWeb._(web.window.localStorage);

  final web.Storage _storage;

  @override
  String? leer(String clave) => _storage.getItem(clave);

  @override
  void escribir(String clave, String valor) => _storage.setItem(clave, valor);

  @override
  void borrar(String clave) => _storage.removeItem(clave);
}

/// Idioma preferido del navegador (`navigator.language`), p. ej. `es-ES`.
String idiomaDelNavegador() => web.window.navigator.language;

/// Pone/quita `data-listo` en `<body>`.
class IndicadorListoWeb implements IndicadorListo {
  const IndicadorListoWeb();

  @override
  void ocupado() => web.document.body?.removeAttribute('data-listo');

  @override
  void listo() => web.document.body?.setAttribute('data-listo', '');
}
