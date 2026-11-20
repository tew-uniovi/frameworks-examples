import 'package:flutter/material.dart';

import '../app.dart';
import '../estado/app_estado.dart';
import '../vistas/dialogo_auth.dart';
import 'adaptativo.dart';
import 'logo.dart';

/// Acciones de los menús de la barra.
enum _Accion { listado, nuevo, login, registro, salir, espanol, ingles }

/// Barra superior. En pantallas anchas: logo y menús Embalses (solo con
/// sesión), Cuenta e Idioma. En móvil: logo y un único menú de desbordamiento.
class BarraAplicacion extends StatelessWidget implements PreferredSizeWidget {
  const BarraAplicacion({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final compacta = Pantalla.esCompacta(context);

    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainer,
      title: const LogoAquaapp(),
      actions: compacta
          ? [_menuDesbordamiento(context, estado), const SizedBox(width: 4)]
          : [
              if (estado.hayToken) _menuEmbalses(context, estado),
              _menuCuenta(context, estado),
              _menuIdioma(context, estado),
              const SizedBox(width: 8),
            ],
    );
  }

  // --- Pantallas anchas: tres menús ----------------------------------------

  Widget _menuEmbalses(BuildContext context, AppEstado estado) {
    return _BotonMenu(
      identificador: 'menu-embalses',
      icono: Icons.water_drop_outlined,
      etiqueta: estado.t('nav.embalses'),
      onSelected: (accion) => _ejecutar(context, accion),
      items: _itemsEmbalses(estado),
    );
  }

  Widget _menuCuenta(BuildContext context, AppEstado estado) {
    return _BotonMenu(
      identificador: 'menu-sesion',
      icono: Icons.account_circle_outlined,
      etiqueta: _etiquetaCuenta(estado),
      onSelected: (accion) => _ejecutar(context, accion),
      items: _itemsCuenta(estado),
    );
  }

  Widget _menuIdioma(BuildContext context, AppEstado estado) {
    return _BotonMenu(
      identificador: 'menu-idioma',
      icono: Icons.translate,
      etiqueta: estado.i18n.idioma.toUpperCase(),
      onSelected: (accion) => _ejecutar(context, accion),
      items: _itemsIdioma(estado),
    );
  }

  // --- Móvil: un solo menú de desbordamiento --------------------------------

  Widget _menuDesbordamiento(BuildContext context, AppEstado estado) {
    return Semantics(
      identifier: 'menu-principal',
      child: PopupMenuButton<_Accion>(
        icon: const Icon(Icons.more_vert),
        tooltip: estado.t('nav.masOpciones'),
        onSelected: (accion) => _ejecutar(context, accion),
        itemBuilder: (_) => [
          if (estado.hayToken) ...[
            _cabecera(context, estado.t('nav.embalses')),
            ..._itemsEmbalses(estado),
            const PopupMenuDivider(),
          ],
          _cabecera(context, _etiquetaCuenta(estado)),
          ..._itemsCuenta(estado),
          const PopupMenuDivider(),
          _cabecera(context, estado.t('nav.idioma')),
          ..._itemsIdioma(estado),
        ],
      ),
    );
  }

  /// Título de sección dentro de un menú (no seleccionable).
  PopupMenuItem<_Accion> _cabecera(BuildContext context, String texto) {
    final tema = Theme.of(context);
    return PopupMenuItem<_Accion>(
      enabled: false,
      child: Text(
        texto,
        style: tema.textTheme.labelMedium
            ?.copyWith(color: tema.colorScheme.onSurfaceVariant),
      ),
    );
  }

  // --- Elementos compartidos -------------------------------------------------

  String _etiquetaCuenta(AppEstado estado) => estado.usuario != null
      ? '${estado.t('nav.hola')}, ${estado.usuario}'
      : estado.t('nav.cuenta');

  List<PopupMenuEntry<_Accion>> _itemsEmbalses(AppEstado estado) => [
        _item(_Accion.listado, Icons.list, estado.t('nav.listado'), 'menu-listado'),
        _item(_Accion.nuevo, Icons.add, estado.t('nav.nuevo'), 'menu-nuevo'),
      ];

  List<PopupMenuEntry<_Accion>> _itemsCuenta(AppEstado estado) => [
        if (!estado.hayToken) ...[
          _item(_Accion.login, Icons.login, estado.t('login.title'), 'menu-login'),
          _item(_Accion.registro, Icons.person_add_outlined,
              estado.t('login.registrate'), 'menu-registro'),
        ] else
          _item(_Accion.salir, Icons.logout, estado.t('nav.salir'), 'menu-logout'),
      ];

  List<PopupMenuEntry<_Accion>> _itemsIdioma(AppEstado estado) => [
        CheckedPopupMenuItem(
          value: _Accion.espanol,
          checked: estado.i18n.idioma == 'es',
          child: Text(estado.t('idioma.es')),
        ),
        CheckedPopupMenuItem(
          value: _Accion.ingles,
          checked: estado.i18n.idioma == 'en',
          child: Text(estado.t('idioma.en')),
        ),
      ];

  PopupMenuItem<_Accion> _item(
      _Accion valor, IconData icono, String texto, String identificador) {
    return PopupMenuItem<_Accion>(
      value: valor,
      child: Semantics(
        identifier: identificador,
        child: Row(
          children: [Icon(icono), const SizedBox(width: 12), Text(texto)],
        ),
      ),
    );
  }

  void _ejecutar(BuildContext context, _Accion accion) {
    final estado = AppScope.leer(context);
    switch (accion) {
      case _Accion.listado:
        estado.mostrarListado();
      case _Accion.nuevo:
        estado.mostrarFormulario();
      case _Accion.login:
        mostrarDialogoAuth(context, ModoAuth.login);
      case _Accion.registro:
        mostrarDialogoAuth(context, ModoAuth.registro);
      case _Accion.salir:
        // Salida voluntaria: se limpia la sesión y se pide iniciar sesión de nuevo.
        estado.cerrarSesion();
        mostrarDialogoAuth(context, ModoAuth.login);
      case _Accion.espanol:
        estado.cambiarIdioma('es');
      case _Accion.ingles:
        estado.cambiarIdioma('en');
    }
  }
}

/// Botón de la barra (icono + texto + flecha) que abre un [PopupMenuButton].
class _BotonMenu extends StatelessWidget {
  const _BotonMenu({
    required this.identificador,
    required this.icono,
    required this.etiqueta,
    required this.onSelected,
    required this.items,
  });

  final String identificador;
  final IconData icono;
  final String etiqueta;
  final ValueChanged<_Accion> onSelected;
  final List<PopupMenuEntry<_Accion>> items;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      identifier: identificador,
      child: PopupMenuButton<_Accion>(
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
                const SizedBox(width: 8),
                Text(etiqueta),
                const Icon(Icons.arrow_drop_down),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
