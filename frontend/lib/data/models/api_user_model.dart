class ApiUserModel {
  final String id;
  final String name;
  final String email;

  ApiUserModel({required this.id, required this.name, required this.email});

  factory ApiUserModel.fromJson(Map<String, dynamic> json) {
    return ApiUserModel(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'email': email};
}

class ApiAuthResponse {
  final ApiUserModel user;
  final String token;

  ApiAuthResponse({required this.user, required this.token});

  factory ApiAuthResponse.fromJson(Map<String, dynamic> json) {
    return ApiAuthResponse(
      user: ApiUserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: (json['token'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {'user': user.toJson(), 'token': token};
}
