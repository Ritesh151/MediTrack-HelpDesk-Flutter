class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? hospitalId;
  final List<String> permissions;
  final String? token;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.hospitalId,
    this.permissions = const [],
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'patient',
      hospitalId: json['hospitalId'],
      permissions: (json['permissions'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      token: json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'hospitalId': hospitalId,
      'permissions': permissions,
      'token': token,
    };
  }
}
