import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'estado/app_estado.dart';
import 'vistas/pagina_principal.dart';

/// Da acceso al [AppEstado] desde cualquier widget y los reconstruye cuando cambia.
class AppScope extends InheritedNotifier<AppEstado> {
  const AppScope({super.key, required AppEstado estado, required super.child})
      : super(notifier: estado);

  /// Estado de la app; el widget que lo llama se reconstruye con cada cambio.
  static AppEstado of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppScope>()!.notifier!;
  }

  /// Estado de la app sin suscribirse (para manejadores de eventos).
  static AppEstado leer(BuildContext context) {
    return context.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
  }
}

/// Aplicación raíz: Material 3 con una paleta derivada del azul del logo.
class AplicacionAquaapp extends StatelessWidget {
  const AplicacionAquaapp({super.key, required this.estado});

  final AppEstado estado;

  static const Color _azulLogo = Color(0xFF093074);

  @override
  Widget build(BuildContext context) {
    return AppScope(
      estado: estado,
      child: Builder(
        builder: (context) {
          final idioma = AppScope.of(context).i18n.idioma;
          return MaterialApp(
            title: 'Aquaapp',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              useMaterial3: true,
              colorScheme: ColorScheme.fromSeed(seedColor: _azulLogo),
            ),
            locale: Locale(idioma),
            supportedLocales: const [Locale('es'), Locale('en')],
            localizationsDelegates: GlobalMaterialLocalizations.delegates,
            home: const PaginaPrincipal(),
          );
        },
      ),
    );
  }
}
