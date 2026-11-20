/// Embalse tal y como lo expone la API (`/api/embalses`).
class Embalse {
  const Embalse({
    this.id,
    required this.nombre,
    required this.capacidadHm3,
    required this.nivelActualHm3,
  });

  /// `null` mientras el embalse no se ha creado en el servidor.
  final int? id;
  final String nombre;
  final double capacidadHm3;
  final double nivelActualHm3;

  factory Embalse.fromJson(Map<String, dynamic> json) => Embalse(
        id: (json['id'] as num?)?.toInt(),
        nombre: json['nombre'] as String,
        capacidadHm3: (json['capacidadHm3'] as num).toDouble(),
        nivelActualHm3: (json['nivelActualHm3'] as num).toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'nombre': nombre,
        'capacidadHm3': capacidadHm3,
        'nivelActualHm3': nivelActualHm3,
      };
}
