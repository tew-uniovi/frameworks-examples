import 'package:flutter/material.dart';

import '../app.dart';
import '../modelos/embalse.dart';
import '../widgets/avisos.dart';
import 'dialogo_auth.dart';

/// Listado de embalses: fecha de actualización, filtro por nombre, tabla
/// (lista de tarjetas en pantallas estrechas) y paginación de 5 en 5.
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
    final ancho = MediaQuery.sizeOf(context).width;
    final fecha = estado.ultimaActualizacion;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (estado.cargando) const LinearProgressIndicator(),
        if (fecha != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12, top: 4),
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
              border: const OutlineInputBorder(),
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (ancho >= 700)
          _TablaEmbalses(onEditar: _editar, onEliminar: _eliminar)
        else
          _ListaEmbalses(onEditar: _editar, onEliminar: _eliminar),
        const SizedBox(height: 12),
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
          icon: Icon(Icons.delete_outline,
              color: Theme.of(context).colorScheme.error),
          tooltip: estado.t('tabla.eliminar'),
          onPressed: estado.guardando ? null : () => onEliminar(embalse),
        ),
      ],
    );
  }
}

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
      child: SizedBox(
        width: double.infinity,
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
    );
  }
}

class _ListaEmbalses extends StatelessWidget {
  const _ListaEmbalses({required this.onEditar, required this.onEliminar});

  final void Function(Embalse) onEditar;
  final void Function(Embalse) onEliminar;

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    return Column(
      children: [
        for (final e in estado.paginaActual)
          Card(
            key: ValueKey(e.id),
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(
                  color: Theme.of(context).colorScheme.outlineVariant),
            ),
            child: ListTile(
              title: Text(e.nombre),
              subtitle: Text(
                'Id ${e.id}\n'
                '${estado.t('tabla.capacidad')}: ${estado.i18n.numero(e.capacidadHm3)}\n'
                '${estado.t('tabla.nivel')}: ${estado.i18n.numero(e.nivelActualHm3)}',
              ),
              isThreeLine: true,
              trailing: _Acciones(
                  embalse: e, onEditar: onEditar, onEliminar: onEliminar),
            ),
          ),
      ],
    );
  }
}

/// Anterior / «Página X de Y» / Siguiente.
class _Paginador extends StatelessWidget {
  const _Paginador();

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final pagina = estado.paginaMostrada;
    return Wrap(
      spacing: 12,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        OutlinedButton.icon(
          key: const Key('pagina-anterior'),
          onPressed: pagina > 0 ? () => estado.irAPagina(-1) : null,
          icon: const Icon(Icons.chevron_left),
          label: Text(estado.t('listado.anterior')),
        ),
        Semantics(
          identifier: 'pagina-actual',
          child: Text(
            '${estado.t('listado.pagina')} ${pagina + 1} '
            '${estado.t('listado.de')} ${estado.totalPaginas}',
          ),
        ),
        OutlinedButton.icon(
          key: const Key('pagina-siguiente'),
          onPressed: pagina < estado.totalPaginas - 1
              ? () => estado.irAPagina(1)
              : null,
          iconAlignment: IconAlignment.end,
          icon: const Icon(Icons.chevron_right),
          label: Text(estado.t('listado.siguiente')),
        ),
      ],
    );
  }
}
