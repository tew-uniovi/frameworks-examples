import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../app.dart';
import '../estado/app_estado.dart';
import '../widgets/adaptativo.dart';
import '../widgets/barra_aplicacion.dart';
import '../widgets/panel_indicadores.dart';
import '../widgets/pie_pagina.dart';
import 'dialogo_auth.dart';
import 'vista_formulario.dart';
import 'vista_listado.dart';
import 'vista_sesion_no_valida.dart';

/// Página única de la app: barra, cuerpo (vista actual), panel de indicadores y pie.
class PaginaPrincipal extends StatefulWidget {
  const PaginaPrincipal({super.key});

  @override
  State<PaginaPrincipal> createState() => _PaginaPrincipalState();
}

class _PaginaPrincipalState extends State<PaginaPrincipal> {
  @override
  void initState() {
    super.initState();
    // Con token al arrancar -> listado; sin token -> diálogo de login.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final estado = AppScope.leer(context);
      if (!estado.hayToken) mostrarDialogoAuth(context, ModoAuth.login);
      estado.arrancar();
    });
  }

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final conBoton = estado.hayToken && estado.vista == Vista.listado;
    return Scaffold(
      appBar: const BarraAplicacion(),
      // Botón de acción flotante de Material: crear un embalse desde el listado.
      floatingActionButton: conBoton
          ? FloatingActionButton.extended(
              key: const Key('boton-nuevo-embalse'),
              onPressed: () => estado.mostrarFormulario(),
              icon: const Icon(Icons.add),
              label: Text(estado.t('nav.nuevo')),
            )
          : null,
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              // Con el botón flotante, margen extra abajo para no tapar la última fila.
              padding: EdgeInsets.fromLTRB(16, 16, 16, conBoton ? 96 : 16),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1200),
                  child: _contenido(context, estado),
                ),
              ),
            ),
          ),
          Semantics(role: SemanticsRole.contentInfo, child: const PiePagina()),
        ],
      ),
    );
  }

  Widget _contenido(BuildContext context, AppEstado estado) {
    final principal = Semantics(
      role: SemanticsRole.main,
      container: true,
      child: switch (estado.vista) {
        Vista.vacia => const SizedBox(height: 200),
        Vista.listado => const VistaListado(),
        // La clave reinicia el formulario cada vez que se abre (alta o edición).
        Vista.formulario =>
          VistaFormulario(key: ValueKey(estado.versionFormulario)),
        Vista.sesionNoValida => const VistaSesionNoValida(),
      },
    );
    // El panel es información del listado: en las demás vistas no aparece.
    if (estado.vista != Vista.listado) return principal;

    final panel = Semantics(
      role: SemanticsRole.complementary,
      container: true,
      child: const PanelIndicadores(),
    );
    // Ancho: panel a la derecha. Estrecho: debajo del listado.
    if (Pantalla.esExpandida(context)) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: principal),
          const SizedBox(width: 24),
          SizedBox(width: 280, child: panel),
        ],
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [principal, const SizedBox(height: 16), panel],
    );
  }
}
