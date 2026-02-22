class HospitalModel {
  final String id;
  final String name;
  final String type;
  final String address;
  final String city;
  final String code;

  HospitalModel({
    required this.id,
    required this.name,
    required this.type,
    required this.address,
    required this.city,
    required this.code,
  });

  factory HospitalModel.fromJson(Map<String, dynamic> json) {
    return HospitalModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      code: json['code'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'address': address,
      'city': city,
      'code': code,
    };
  }
}
