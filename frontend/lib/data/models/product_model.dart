class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final rawPrice = json['price'];
    final doublePrice = rawPrice is int
        ? rawPrice.toDouble()
        : (rawPrice as num?)?.toDouble() ?? 0.0;

    return ProductModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      price: doublePrice,
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name,
        'description': description,
        'price': price,
      };
}
