import 'package:flutter/material.dart';

import '../estado/app_estado.dart';

/// Muestra un SnackBar (con acción «Cerrar») para los resultados que no son
/// correctos: 403 «sin permiso» y errores genéricos. El 401 lo gestiona el
/// estado cambiando a la vista «Sesión no válida».
void avisarResultado(ScaffoldMessengerState mensajero, AppEstado estado, Resultado r) {
  final clave = switch (r) {
    Resultado.sinPermiso => 'error.sinPermiso',
    Resultado.error => 'error.generico',
    Resultado.ok || Resultado.noAutorizado => null,
  };
  if (clave == null) return;
  mensajero
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Semantics(identifier: 'aviso', child: Text(estado.t(clave))),
      action: SnackBarAction(
        label: estado.t('comun.cerrar'),
        onPressed: () {}, // pulsar la acción ya descarta el SnackBar
      ),
    ));
}
