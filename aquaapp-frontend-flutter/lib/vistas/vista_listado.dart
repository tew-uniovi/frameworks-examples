import 'package:flutter/material.dart';

import '../app.dart';
import '../modelos/embalse.dart';
import '../widgets/adaptativo.dart';
import '../widgets/avisos.dart';
import 'dialogo_auth.dart';

/// Listado de embalses: fecha de actualización, filtro por nombre, tabla en
/// pantallas anchas o lista de tarjetas en móvil, y paginación de 5 en 5.
class VistaListado extends StatefulWidget {
  const VistaListado({super.key});

  @override
  State<VistaListado> createState() => _VistaListadoState();
}

class _VistaListadoState extends State<VistaListado> {
  // Se inicializa con el filtro del estado: tras una escritura el listado se
  // recarga y el filtro (y la página) se conservan.
  late final TextEditingController _filtro =
      TextEditingController(text: AppScope.leer(context).filtro);

  @override
  void dispose() {
    _filtro.dispose();
    super.dispose();
  }

  Future<void> _eliminar(Embalse embalse) async {
    final estado = AppScope.leer(context);
    if (!estado.hayToken) {
      await mostrarDialogoAuth(context, ModoAuth.login);
      return;
    }
    final mensajero = ScaffoldMessenger.of(context);
    final resultado = await estado.eliminar(embalse.id!);
    avisarResultado(mensajero, estado, resultado);
  }

  void _editar(Embalse embalse) => AppScope.leer(context).mostrarFormulario(embalse);

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    final fecha = estado.ultimaActualizacion;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (estado.cargando)
          LinearProgressIndicator(semanticsLabel: estado.t('comun.cargando')),
        if (fecha != null)
          Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 12),
            child: Text(
              '${estado.t('listado.actualizado')} ${estado.i18n.fecha(fecha)}',
              style: tema.textTheme.bodySmall
                  ?.copyWith(color: tema.colorScheme.onSurfaceVariant),
            ),
          ),
        Semantics(
          identifier: 'filtro-nombre',
          child: TextField(
            controller: _filtro,
            onChanged: estado.filtrarPor,
            decoration: InputDecoration(
              labelText: estado.t('listado.filtroPlaceholder'),
              prefixIcon: const Icon(Icons.search),
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (Pantalla.esCompacta(context))
          _ListaEmbalses(onEditar: _editar, onEliminar: _eliminar)
        else
          _TablaEmbalses(onEditar: _editar, onEliminar: _eliminar),
        const SizedBox(height: 8),
        const _Paginador(),
      ],
    );
  }
}

/// Botones de editar y eliminar de una fila (solo icono, con tooltip).
class _Acciones extends StatelessWidget {
  const _Acciones({
    required this.embalse,
    required this.onEditar,
    required this.onEliminar,
  });

  final Embalse embalse;
  final void Function(Embalse) onEditar;
  final void Function(Embalse) onEliminar;

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          key: Key('editar-${embalse.id}'),
          icon: const Icon(Icons.edit_outlined),
          tooltip: estado.t('tabla.editar'),
          onPressed: () => onEditar(embalse),
        ),
        IconButton(
          key: Key('eliminar-${embalse.id}'),
          icon: Icon(Icons.delete_outline, color: Theme.of(context).colorScheme.error),
          tooltip: estado.t('tabla.eliminar'),
          onPressed: estado.guardando ? null : () => onEliminar(embalse),
        ),
      ],
    );
  }
}

/// Tabla (pantallas medianas y anchas), con desplazamiento horizontal si no cabe.
class _TablaEmbalses extends StatelessWidget {
  const _TablaEmbalses({required this.onEditar, required this.onEliminar});

  final void Function(Embalse) onEditar;
  final void Function(Embalse) onEliminar;

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    return Card(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: tema.colorScheme.outlineVariant),
      ),
      child: LayoutBuilder(
        builder: (context, restricciones) => SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: ConstrainedBox(
            constraints: BoxConstraints(minWidth: restricciones.maxWidth),
            child: DataTable(
              headingRowColor:
                  WidgetStatePropertyAll(tema.colorScheme.surfaceContainerHighest),
              columns: [
                DataColumn(label: Text(estado.t('tabla.id'))),
                DataColumn(label: Text(estado.t('tabla.nombre'))),
                DataColumn(label: Text(estado.t('tabla.capacidad')), numeric: true),
                DataColumn(label: Text(estado.t('tabla.nivel')), numeric: true),
                DataColumn(label: Text(estado.t('tabla.acciones'))),
              ],
              rows: [
                for (final e in estado.paginaActual)
                  DataRow(
                    key: ValueKey(e.id),
                    cells: [
                      DataCell(Text('${e.id}')),
                      DataCell(Text(e.nombre)),
                      DataCell(Text(estado.i18n.numero(e.capacidadHm3))),
                      DataCell(Text(estado.i18n.numero(e.nivelActualHm3))),
                      DataCell(_Acciones(
                          embalse: e, onEditar: onEditar, onEliminar: onEliminar)),
                    ],
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Lista de tarjetas (móvil): una [ListTile] por embalse con sus acciones al final.
class _ListaEmbalses extends StatelessWidget {
  const _ListaEmbalses({required this.onEditar, required this.onEliminar});

  final void Function(Embalse) onEditar;
  final void Function(Embalse) onEliminar;

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    return Column(
      children: [
        for (final e in estado.paginaActual)
          Card(
            key: ValueKey(e.id),
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: tema.colorScheme.outlineVariant),
            ),
            child: ListTile(
              title: Text(e.nombre),
              subtitle: Text(
                '${estado.t('tabla.id')} ${e.id}\n'
                '${estado.t('tabla.capacidad')}: ${estado.i18n.numero(e.capacidadHm3)}\n'
                '${estado.t('tabla.nivel')}: ${estado.i18n.numero(e.nivelActualHm3)}',
              ),
              isThreeLine: true,
              trailing: _Acciones(embalse: e, onEditar: onEditar, onEliminar: onEliminar),
            ),
          ),
      ],
    );
  }
}

/// «Página X de Y» con los botones de icono anterior / siguiente a su lado,
/// alineados al final como en el pie de un PaginatedDataTable.
class _Paginador extends StatelessWidget {
  const _Paginador();

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final pagina = estado.paginaMostrada;
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Semantics(
          identifier: 'pagina-actual',
          child: Text(
            '${estado.t('listado.pagina')} ${pagina + 1} '
            '${estado.t('listado.de')} ${estado.totalPaginas}',
          ),
        ),
        const SizedBox(width: 8),
        IconButton(
          key: const Key('pagina-anterior'),
          icon: const Icon(Icons.chevron_left),
          tooltip: estado.t('listado.anterior'),
          onPressed: pagina > 0 ? () => estado.irAPagina(-1) : null,
        ),
        IconButton(
          key: const Key('pagina-siguiente'),
          icon: const Icon(Icons.chevron_right),
          tooltip: estado.t('listado.siguiente'),
          onPressed: pagina < estado.totalPaginas - 1 ? () => estado.irAPagina(1) : null,
        ),
      ],
    );
  }
}
