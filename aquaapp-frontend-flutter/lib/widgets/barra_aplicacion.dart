import 'package:flutter/material.dart';

import '../app.dart';
import '../vistas/dialogo_auth.dart';
import 'logo.dart';

enum _AccionEmbalses { listado, nuevo }

enum _AccionCuenta { login, registro, salir }

/// Barra superior: logo y menús Embalses (solo con sesión), Cuenta e Idioma.
class BarraAplicacion extends StatelessWidget implements PreferredSizeWidget {
  const BarraAplicacion({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    // En pantallas estrechas los menús solo llevan icono.
    final compacto = MediaQuery.sizeOf(context).width < 700;
    final usuario = estado.usuario;
    final conSesion = usuario != null;

    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerLow,
      titleSpacing: 16,
      title: const LogoAquaapp(),
      actions: [
        if (conSesion)
          _BotonMenu<_AccionEmbalses>(
            identificador: 'menu-embalses',
            icono: Icons.water_drop_outlined,
            etiqueta: estado.t('nav.embalses'),
            compacto: compacto,
            onSelected: (accion) => switch (accion) {
              _AccionEmbalses.listado => estado.mostrarListado(),
              _AccionEmbalses.nuevo => estado.mostrarFormulario(),
            },
            items: [
              _item(_AccionEmbalses.listado, Icons.list, estado.t('nav.listado')),
              _item(_AccionEmbalses.nuevo, Icons.add, estado.t('nav.nuevo')),
            ],
          ),
        _BotonMenu<_AccionCuenta>(
          identificador: 'menu-cuenta',
          icono: Icons.account_circle_outlined,
          etiqueta: conSesion
              ? '${estado.t('nav.hola')}, $usuario'
              : estado.t('nav.cuenta'),
          compacto: compacto,
          onSelected: (accion) => switch (accion) {
            _AccionCuenta.login =>
              mostrarDialogoAuth(context, ModoAuth.login),
            _AccionCuenta.registro =>
              mostrarDialogoAuth(context, ModoAuth.registro),
            _AccionCuenta.salir => _salir(context),
          },
          items: [
            if (!conSesion) ...[
              _item(_AccionCuenta.login, Icons.login, estado.t('login.title')),
              _item(_AccionCuenta.registro, Icons.person_add_outlined,
                  estado.t('login.registrate')),
            ] else
              _item(_AccionCuenta.salir, Icons.logout, estado.t('nav.salir')),
          ],
        ),
        _BotonMenu<String>(
          identificador: 'menu-idioma',
          icono: Icons.translate,
          etiqueta: estado.i18n.idioma.toUpperCase(),
          compacto: false,
          onSelected: estado.cambiarIdioma,
          items: const [
            PopupMenuItem(value: 'es', child: Text('ES · Español')),
            PopupMenuItem(value: 'en', child: Text('EN · English')),
          ],
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  /// Salida voluntaria: se limpia la sesión y se pide iniciar sesión de nuevo.
  void _salir(BuildContext context) {
    AppScope.leer(context).cerrarSesion();
    mostrarDialogoAuth(context, ModoAuth.login);
  }

  PopupMenuItem<T> _item<T>(T valor, IconData icono, String texto) {
    return PopupMenuItem<T>(
      value: valor,
      child: Row(
        children: [Icon(icono), const SizedBox(width: 12), Text(texto)],
      ),
    );
  }
}

/// Botón de la barra que abre un [PopupMenuButton].
class _BotonMenu<T> extends StatelessWidget {
  const _BotonMenu({
    required this.identificador,
    required this.icono,
    required this.etiqueta,
    required this.compacto,
    required this.onSelected,
    required this.items,
  });

  final String identificador;
  final IconData icono;
  final String etiqueta;
  final bool compacto;
  final ValueChanged<T> onSelected;
  final List<PopupMenuEntry<T>> items;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      identifier: identificador,
      child: PopupMenuButton<T>(
        tooltip: etiqueta,
        onSelected: onSelected,
        itemBuilder: (_) => items,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 48, minWidth: 48),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icono),
                if (!compacto) ...[
                  const SizedBox(width: 6),
                  Text(etiqueta),
                ],
                const Icon(Icons.arrow_drop_down),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
