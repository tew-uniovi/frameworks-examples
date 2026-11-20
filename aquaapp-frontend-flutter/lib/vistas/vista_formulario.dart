import 'package:flutter/material.dart';

import '../app.dart';
import '../modelos/embalse.dart';
import '../widgets/avisos.dart';
import 'dialogo_auth.dart';

/// Formulario de alta y edición, incrustado en la vista principal (no es un
/// diálogo). Es edición si el estado trae un embalse con `id`.
class VistaFormulario extends StatefulWidget {
  const VistaFormulario({super.key});

  @override
  State<VistaFormulario> createState() => _VistaFormularioState();
}

class _VistaFormularioState extends State<VistaFormulario> {
  final _formulario = GlobalKey<FormState>();
  late final TextEditingController _nombre;
  late final TextEditingController _capacidad;
  late final TextEditingController _nivel;
  late final Embalse? _original;

  @override
  void initState() {
    super.initState();
    _original = AppScope.leer(context).embalseEnEdicion;
    _nombre = TextEditingController(text: _original?.nombre ?? '');
    _capacidad = TextEditingController(text: _texto(_original?.capacidadHm3));
    _nivel = TextEditingController(text: _texto(_original?.nivelActualHm3));
  }

  /// 150.0 -> «150»; 150.5 -> «150.5» (sin separador de miles: es un campo editable).
  static String _texto(double? valor) {
    if (valor == null) return '';
    return valor == valor.roundToDouble() ? valor.toInt().toString() : '$valor';
  }

  @override
  void dispose() {
    _nombre.dispose();
    _capacidad.dispose();
    _nivel.dispose();
    super.dispose();
  }

  /// Acepta «150.5» y «150,5».
  static double? _numero(String? texto) =>
      double.tryParse((texto ?? '').trim().replaceAll(',', '.'));

  Future<void> _guardar() async {
    if (!_formulario.currentState!.validate()) return;
    final estado = AppScope.leer(context);
    if (!estado.hayToken) {
      await mostrarDialogoAuth(context, ModoAuth.login);
      return;
    }
    final mensajero = ScaffoldMessenger.of(context);
    final resultado = await estado.guardar(Embalse(
      id: _original?.id,
      nombre: _nombre.text.trim(),
      capacidadHm3: _numero(_capacidad.text)!,
      nivelActualHm3: _numero(_nivel.text)!,
    ));
    avisarResultado(mensajero, estado, resultado);
  }

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    final t = estado.t;

    String? numeroValido(String? v) {
      final n = _numero(v);
      return (v == null || v.trim().isEmpty)
          ? t('validacion.obligatorio')
          : (n == null || n < 0 ? t('validacion.numero') : null);
    }

    Widget campo(Widget hijo) => ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420, minWidth: 240),
          child: hijo,
        );

    return Form(
      key: _formulario,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(t('form.titulo'), style: tema.textTheme.headlineSmall),
          const SizedBox(height: 20),
          Wrap(
            spacing: 16,
            runSpacing: 20,
            children: [
              campo(TextFormField(
                key: const Key('campo-nombre'),
                controller: _nombre,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: t('form.nombre'),
                  hintText: t('form.nombrePlaceholder'),
                  prefixIcon: const Icon(Icons.water_drop_outlined),
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? t('validacion.obligatorio')
                    : null,
              )),
              campo(TextFormField(
                key: const Key('campo-capacidad'),
                controller: _capacidad,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: t('form.capacidad'),
                  hintText: t('form.capacidadPlaceholder'),
                  prefixIcon: const Icon(Icons.storage_outlined),
                ),
                validator: numeroValido,
              )),
              campo(TextFormField(
                key: const Key('campo-nivel'),
                controller: _nivel,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _guardar(),
                decoration: InputDecoration(
                  labelText: t('form.nivel'),
                  hintText: t('form.nivelPlaceholder'),
                  prefixIcon: const Icon(Icons.show_chart),
                ),
                validator: (v) {
                  final basico = numeroValido(v);
                  if (basico != null) return basico;
                  // Regla de negocio: el nivel no puede superar la capacidad.
                  final capacidad = _numero(_capacidad.text);
                  return capacidad != null && _numero(v)! > capacidad
                      ? t('form.nivelSuperaCapacidad')
                      : null;
                },
              )),
            ],
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            key: const Key('boton-guardar'),
            onPressed: estado.guardando ? null : _guardar,
            icon: estado.guardando
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      semanticsLabel: t('comun.guardando'),
                    ),
                  )
                : const Icon(Icons.save_outlined),
            label: Text(t('form.guardar')),
          ),
        ],
      ),
    );
  }
}
