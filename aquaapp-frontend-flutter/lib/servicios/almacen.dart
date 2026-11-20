/// Abstracción de un almacén clave-valor (sessionStorage / localStorage en la
/// web). Permite sustituirlo por uno en memoria en los tests.
abstract class Almacen {
  String? leer(String clave);
  void escribir(String clave, String valor);
  void borrar(String clave);
}

/// Almacén en memoria, para tests.
class AlmacenMemoria implements Almacen {
  AlmacenMemoria([Map<String, String>? inicial]) : _datos = {...?inicial};

  final Map<String, String> _datos;

  @override
  String? leer(String clave) => _datos[clave];

  @override
  void escribir(String clave, String valor) => _datos[clave] = valor;

  @override
  void borrar(String clave) => _datos.remove(clave);
}
