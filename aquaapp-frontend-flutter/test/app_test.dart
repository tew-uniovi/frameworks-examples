import 'dart:convert';

import 'package:aquaapp_frontend/app.dart';
import 'package:aquaapp_frontend/estado/app_estado.dart';
import 'package:aquaapp_frontend/servicios/almacen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'ayudas.dart';

/// Backend simulado: 12 embalses, login de «admin»/«admin» y escritura según [escrituraPermitida].
class _Servidor {
  _Servidor({this.escrituraPermitida = true, this.listadoStatus = 200});

  final bool escrituraPermitida;
  final int listadoStatus;
  final peticiones = <String>[];
  final cabecerasAuth = <String?>[];

  late final http.Client cliente = MockClient((req) async {
    peticiones.add('${req.method} ${req.url.path}');
    cabecerasAuth.add(req.headers['Authorization']);
    final json = {'content-type': 'application/json'};
    switch ((req.method, req.url.path)) {
      case ('POST', '/auth/login'):
        final datos = jsonDecode(req.body) as Map<String, dynamic>;
        return datos['usuario'] == 'admin' && datos['password'] == 'admin'
            ? http.Response(jsonEncode({'token': crearJwt(usuario: 'admin')}), 200, headers: json)
            : http.Response('', 401);
      case ('GET', '/api/embalses'):
        return http.Response(
          jsonEncode([for (final e in embalsesDePrueba(12)) e.toJson()]),
          listadoStatus,
          headers: json,
        );
      case ('POST', '/api/embalses'):
        return http.Response('{}', escrituraPermitida ? 201 : 403, headers: json);
    }
    return http.Response('', 404);
  });
}

Future<AppEstado> _crearEstado(
  WidgetTester tester,
  _Servidor servidor, {
  String? token,
}) async {
  tester.view.physicalSize = const Size(2000, 1000);
  tester.view.devicePixelRatio = 1;
  // La fuente de test (Ahem) es mucho más ancha que Roboto: se reduce para que
  // las cabeceras de la tabla quepan, igual que en un navegador real.
  tester.platformDispatcher.textScaleFactorTestValue = 0.6;
  addTearDown(tester.view.reset);
  addTearDown(tester.platformDispatcher.clearAllTestValues);
  return (await tester.runAsync(() => AppEstado.iniciar(
        cliente: servidor.cliente,
        almacenSesion: AlmacenMemoria({'jwt': ?token}),
        almacenLocal: AlmacenMemoria({'idioma': 'es'}),
        base: Uri.parse('http://localhost/'),
      )))!;
}

Future<void> _abrirApp(WidgetTester tester, AppEstado estado) async {
  await tester.pumpWidget(AplicacionAquaapp(estado: estado));
  await tester.pumpAndSettle();
}

Future<void> _abrirFormulario(WidgetTester tester) async {
  await tester.tap(find.text('Embalses'));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Nuevo embalse'));
  await tester.pumpAndSettle();
}

void main() {
  setUpAll(() async {
    await initializeDateFormatting('es');
    await initializeDateFormatting('en');
  });

  testWidgets('con token lista los embalses, pagina y filtra', (tester) async {
    final servidor = _Servidor();
    final estado = await _crearEstado(tester, servidor,
        token: crearJwt(usuario: 'admin'));
    await _abrirApp(tester, estado);

    expect(find.text('Hola, admin'), findsOneWidget);
    expect(find.text('Embalse 1'), findsOneWidget);
    expect(find.text('Embalse 6'), findsNothing);
    expect(find.text('Página 1 de 3'), findsOneWidget);
    expect(find.text('12 embalses'), findsOneWidget);
    // Se envió el JWT en la petición protegida.
    expect(servidor.cabecerasAuth.last, startsWith('Bearer '));

    await tester.tap(find.text('Siguiente'));
    await tester.pumpAndSettle();
    expect(find.text('Página 2 de 3'), findsOneWidget);
    expect(find.text('Embalse 6'), findsOneWidget);

    // «Embalse 11» y «Embalse 12» coinciden con «Embalse 1»: filtrar vuelve a la página 1.
    await tester.enterText(find.byType(TextField), 'embalse 1');
    await tester.pumpAndSettle();
    expect(find.text('Página 1 de 1'), findsOneWidget);
    expect(find.text('Embalse 1'), findsOneWidget);
    expect(find.text('Embalse 11'), findsOneWidget);
    expect(find.text('Embalse 2'), findsNothing);
  });

  testWidgets('sin token abre el login; credenciales erróneas y correctas',
      (tester) async {
    final servidor = _Servidor();
    final estado = await _crearEstado(tester, servidor);
    await _abrirApp(tester, estado);

    expect(find.text('Iniciar sesión'), findsWidgets);
    expect(find.text('Cuenta'), findsOneWidget);

    await tester.enterText(find.byKey(const Key('campo-usuario')), 'admin');
    await tester.enterText(find.byKey(const Key('campo-password')), 'mala');
    await tester.tap(find.byKey(const Key('boton-enviar-auth')));
    await tester.pumpAndSettle();
    expect(find.text('Credenciales inválidas'), findsOneWidget);
    expect(estado.hayToken, isFalse);

    await tester.enterText(find.byKey(const Key('campo-password')), 'admin');
    await tester.tap(find.byKey(const Key('boton-enviar-auth')));
    await tester.pumpAndSettle();
    expect(estado.hayToken, isTrue);
    expect(estado.usuario, 'admin');
    expect(find.text('Hola, admin'), findsOneWidget);
    expect(find.text('Embalse 1'), findsOneWidget);
  });

  testWidgets('el registro exige que las contraseñas coincidan', (tester) async {
    final estado = await _crearEstado(tester, _Servidor());
    await _abrirApp(tester, estado);

    await tester.tap(find.text('Regístrate'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('campo-usuario')), 'nuevo');
    await tester.enterText(find.byKey(const Key('campo-password')), 'abc');
    await tester.enterText(find.byKey(const Key('campo-password2')), 'xyz');
    await tester.tap(find.byKey(const Key('boton-enviar-auth')));
    await tester.pumpAndSettle();
    expect(find.text('Las contraseñas no coinciden'), findsOneWidget);
  });

  testWidgets('el formulario no deja guardar un nivel mayor que la capacidad',
      (tester) async {
    final servidor = _Servidor();
    final estado = await _crearEstado(tester, servidor,
        token: crearJwt(usuario: 'admin'));
    await _abrirApp(tester, estado);
    await _abrirFormulario(tester);

    await tester.enterText(find.byKey(const Key('campo-nombre')), 'Nuevo');
    await tester.enterText(find.byKey(const Key('campo-capacidad')), '10');
    await tester.enterText(find.byKey(const Key('campo-nivel')), '20');
    await tester.tap(find.byKey(const Key('boton-guardar')));
    await tester.pumpAndSettle();

    expect(find.text('El nivel actual no puede superar la capacidad'),
        findsOneWidget);
    expect(servidor.peticiones, isNot(contains('POST /api/embalses')));
  });

  testWidgets('un 403 al escribir muestra «No tienes permiso»', (tester) async {
    final servidor = _Servidor(escrituraPermitida: false);
    final estado = await _crearEstado(tester, servidor,
        token: crearJwt(usuario: 'ana'));
    await _abrirApp(tester, estado);
    await _abrirFormulario(tester);

    await tester.enterText(find.byKey(const Key('campo-nombre')), 'Nuevo');
    await tester.enterText(find.byKey(const Key('campo-capacidad')), '10');
    await tester.enterText(find.byKey(const Key('campo-nivel')), '5');
    await tester.tap(find.byKey(const Key('boton-guardar')));
    await tester.pumpAndSettle();

    expect(find.text('No tienes permiso para esta acción'), findsOneWidget);
    expect(estado.hayToken, isTrue); // el 403 no cierra la sesión
  });

  testWidgets('un 401 limpia la sesión y muestra «Sesión no válida»',
      (tester) async {
    final servidor = _Servidor(listadoStatus: 401);
    final estado = await _crearEstado(tester, servidor,
        token: crearJwt(usuario: 'admin'));
    await _abrirApp(tester, estado);

    expect(find.text('Sesión no válida'), findsOneWidget);
    expect(find.text('Ir a iniciar sesión'), findsOneWidget);
    expect(estado.hayToken, isFalse);
  });

  testWidgets('un token caducado ni siquiera llama a la API', (tester) async {
    final servidor = _Servidor();
    final caducado =
        crearJwt(usuario: 'admin', exp: DateTime.now().subtract(const Duration(hours: 1)));
    final estado = await _crearEstado(tester, servidor, token: caducado);
    await _abrirApp(tester, estado);

    expect(find.text('Sesión no válida'), findsOneWidget);
    expect(servidor.peticiones, isEmpty);
  });

  testWidgets('cambiar de idioma traduce la interfaz y se guarda', (tester) async {
    final estado = await _crearEstado(tester, _Servidor(),
        token: crearJwt(usuario: 'admin'));
    await _abrirApp(tester, estado);

    await tester.tap(find.text('ES'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('EN · English'));
    await tester.pumpAndSettle();

    expect(find.text('Hi, admin'), findsOneWidget);
    expect(find.text('Average level: 65 hm³'), findsOneWidget);
    expect(find.text('Page 1 of 3'), findsOneWidget);
  });
}
