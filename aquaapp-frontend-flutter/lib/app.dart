import 'dart:ui' show PointerDeviceKind;

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

/// Permite arrastrar las listas con el ratón además del dedo (en la web de
/// escritorio el comportamiento por defecto solo admite la rueda y la barra).
class ComportamientoDesplazamiento extends MaterialScrollBehavior {
  const ComportamientoDesplazamiento();

  @override
  Set<PointerDeviceKind> get dragDevices => {
        ...super.dragDevices,
        PointerDeviceKind.mouse,
      };
}

/// Aplicación raíz: Material 3 con una paleta derivada del azul del logo,
/// tema claro y oscuro según el sistema.
class AplicacionAquaapp extends StatelessWidget {
  const AplicacionAquaapp({super.key, required this.estado});

  final AppEstado estado;

  /// Azul del logo (#093074), semilla de toda la paleta.
  static const Color azulLogo = Color(0xFF093074);

  static ThemeData _tema(Brightness brillo) => ThemeData(
        useMaterial3: true,
        // Roboto va incluida en la app (assets/fonts): no se descarga de Google Fonts.
        fontFamily: 'Roboto',
        colorScheme: ColorScheme.fromSeed(seedColor: azulLogo, brightness: brillo),
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
        ),
      );

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
            theme: _tema(Brightness.light),
            darkTheme: _tema(Brightness.dark),
            themeMode: ThemeMode.system,
            scrollBehavior: const ComportamientoDesplazamiento(),
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
